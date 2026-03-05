'use client';

import React, { useState, useEffect } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function NotesPage() {
    const { t } = useTranslation();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notes');
            if (res.ok) {
                const data = await res.json();
                setNotes(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveNewNote = (newNote) => {
        setNotes([newNote, ...notes]);
    };

    const handleDeleteNote = async (id) => {
        if (!confirm('Are you sure you want to delete this voice note?')) return;

        try {
            const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setNotes(notes.filter(note => note.id !== id));
            } else {
                alert('Failed to delete note');
            }
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const startEditing = (note) => {
        setEditingId(note.id);
        setEditText(note.transcribed_text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText('');
    };

    const saveEdit = async (id) => {
        try {
            const res = await fetch(`/api/notes/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcribed_text: editText }),
            });

            if (res.ok) {
                setNotes(notes.map(note =>
                    note.id === id ? { ...note, transcribed_text: editText } : note
                ));
                setEditingId(null);
            } else {
                alert('Failed to update transcription');
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Voice Notes</h1>
                <p className="text-muted-foreground">
                    Record voice memos, instantly transcribe them to text, and securely save them.
                </p>
            </div>

            {/* Recorder Section */}
            <div className="mb-8">
                <VoiceRecorder onSave={handleSaveNewNote} />
            </div>

            {/* Saved Notes List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Mic className="h-5 w-5 text-indigo-500" />
                    Saved Audio Notes
                </h2>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                        <Mic className="h-8 w-8 mx-auto text-slate-400 mb-3" />
                        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">No notes yet</h3>
                        <p className="text-sm text-slate-500 mt-1">Start recording above to create your first voice note.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notes.map((note) => (
                            <Card key={note.id} className="overflow-hidden flex flex-col pt-4">
                                <CardContent className="flex-1 space-y-4 pb-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(note.created_at).toLocaleString()}
                                        </span>
                                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            {Math.floor(note.duration / 60)}:{(note.duration % 60).toString().padStart(2, '0')}
                                        </span>
                                    </div>

                                    <audio controls src={note.audio_url} className="w-full h-10 mt-2 rounded-[4px]" />

                                    <div className="mt-4">
                                        {editingId === note.id ? (
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="w-full min-h-[100px] p-3 rounded-md border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950"
                                                    placeholder="Edit transcription..."
                                                />
                                                <div className="flex items-center gap-2 justify-end">
                                                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                                                        <X className="h-4 w-4 mr-1" /> Cancel
                                                    </Button>
                                                    <Button size="sm" onClick={() => saveEdit(note.id)}>
                                                        <Check className="h-4 w-4 mr-1" /> Save
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group relative">
                                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed pr-8">
                                                    {note.transcribed_text || <span className="text-slate-400 italic">No transcription available</span>}
                                                </p>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"
                                                    onClick={() => startEditing(note)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-slate-50 dark:bg-slate-900/50 py-3 border-t flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 px-2"
                                        onClick={() => handleDeleteNote(note.id)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
