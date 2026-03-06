'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Pause, Play, Loader2, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VoiceRecorder({ onSave, leadId = null }) {
    const { t } = useTranslation();
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [duration, setDuration] = useState(0);
    const [transcription, setTranscription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const speechRecognitionRef = useRef(null);
    const timerRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US'; // Could sync with i18n later

                recognition.onresult = (event) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            currentTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (currentTranscript) {
                        setTranscription(prev => (prev ? prev + ' ' : '') + currentTranscript.trim());
                    }
                };

                // On error, just log it. (e.g. no mic access)
                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                };

                speechRecognitionRef.current = recognition;
            } else {
                console.warn('Speech Recognition API not supported in this browser.');
            }
        }

        return () => {
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.abort();
            }
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();

            if (speechRecognitionRef.current) {
                setTranscription(''); // Clear previous recording transcript
                try {
                    speechRecognitionRef.current.start();
                } catch (e) {
                    console.log("Speech recognition is already started");
                }
            }

            setIsRecording(true);
            setIsPaused(false);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.stop();
            }
            clearInterval(timerRef.current);
            setIsPaused(true);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.start();
            }
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
            setIsPaused(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());

            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.stop();
            }
            clearInterval(timerRef.current);
            setIsRecording(false);
            setIsPaused(false);

            // Create blob and file when onstop fires
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' });

                await saveNote(audioFile, transcription, duration);
            };
        }
    };

    const saveNote = async (audioFile, finalTranscription, totalDuration) => {
        setIsSaving(true);
        try {
            const formData = new FormData();
            formData.append('audio', audioFile);
            formData.append('transcribed_text', finalTranscription);
            formData.append('duration', totalDuration);
            if (leadId) {
                formData.append('lead_id', leadId);
            }

            const res = await fetch('/api/notes', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to save note');
            }

            const savedNote = await res.json();
            setTranscription('');
            setDuration(0);

            if (onSave) {
                onSave(savedNote);
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save voice note.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatDuration = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-900 shadow-sm relative overflow-hidden">
            {/* Live Indicator background glow */}
            {isRecording && !isPaused && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            )}

            <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isRecording && !isPaused ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {isRecording
                                ? (isPaused ? 'Paused' : 'Recording...')
                                : 'Voice Note'}
                        </span>
                        <span className="text-xs font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                            {formatDuration(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isRecording ? (
                            <Button
                                onClick={startRecording}
                                size="sm"
                                className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4"
                                disabled={isSaving}
                            >
                                <Mic size={16} className="mr-2" />
                                Start Recording
                            </Button>
                        ) : (
                            <>
                                {isPaused ? (
                                    <Button onClick={resumeRecording} size="sm" variant="outline" className="rounded-full">
                                        <Play size={16} className="mr-2" />
                                        Resume
                                    </Button>
                                ) : (
                                    <Button onClick={pauseRecording} size="sm" variant="outline" className="rounded-full border-amber-500/50 text-amber-600 hover:bg-amber-50">
                                        <Pause size={16} className="mr-2" />
                                        Pause
                                    </Button>
                                )}
                                <Button onClick={stopRecording} size="sm" className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
                                    <Square size={16} className="mr-2" />
                                    Stop & Save
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {(transcription || isRecording) && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-950 p-3 rounded-md border border-slate-100 dark:border-slate-800 min-h-[60px] whitespace-pre-wrap">
                        {transcription || 'Listening...'}
                    </div>
                )}

                {isSaving && (
                    <div className="flex items-center gap-2 text-indigo-600 text-sm font-medium mt-2">
                        <Loader2 size={14} className="animate-spin" />
                        Saving to cloud...
                    </div>
                )}
            </div>
        </div>
    );
}
