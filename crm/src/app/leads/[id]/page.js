'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
    ArrowLeft, User, Phone, Mail, Clock, Send, Check,
    MoreHorizontal, Calendar, Tag, Briefcase, MapPin, Globe,
    ChevronRight, Building, Edit2, Star, Plus, MessageSquare, PhoneCall,
    Mic, Video, Save, ExternalLink, Play, Activity, Square, Trash2, Loader2, Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STEPS = ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'];

export default function LeadDetailPage() {
    const { id } = useParams();
    const [lead, setLead] = useState(null);
    const [actions, setActions] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newNote, setNewNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [team, setTeam] = useState([]);

    // Editing states
    const [editMode, setEditMode] = useState(false);
    const [description, setDescription] = useState('');
    const [company, setCompany] = useState('');

    // Recording States
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioChunks, setAudioChunks] = useState([]);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordingMimeTypeRef = useRef('audio/webm');

    const fetchLead = async () => {
        try {
            const res = await fetch(`/api/leads/${id}`);
            if (!res.ok) throw new Error('Failed to fetch lead');
            const data = await res.json();
            setLead(data);
            setActions(data.actions || []);
            setRecordings(data.recordings || []);
            setDescription(data.description || '');
            setCompany(data.company || '');
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const fetchTeam = async () => {
        try {
            const res = await fetch('/api/team');
            const data = await res.json();
            setTeam(data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        if (id) {
            fetchLead();
            fetchTeam();
        }
    }, [id]);

    const getSupportedMimeType = () => {
        const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
        for (const type of types) {
            if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(type)) {
                return type;
            }
        }
        return 'audio/webm';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mimeType = getSupportedMimeType();
            recordingMimeTypeRef.current = mimeType;

            let recorder;
            try {
                recorder = new MediaRecorder(stream, { mimeType });
            } catch {
                recorder = new MediaRecorder(stream);
                recordingMimeTypeRef.current = recorder.mimeType || 'audio/webm';
            }
            mediaRecorderRef.current = recorder;
            setAudioChunks([]);

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    setAudioChunks(prev => [...prev, e.data]);
                }
            };

            recorder.onstop = () => {
                streamRef.current?.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            };

            recorder.onerror = (e) => {
                console.error('MediaRecorder error:', e);
                streamRef.current?.getTracks().forEach(track => track.stop());
            };

            recorder.start(1000);
            setIsRecording(true);
            setRecordingDuration(0);
            timerRef.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
        } catch (err) {
            console.error('Recording error:', err);
            alert('Could not access microphone. Please check permissions and try again.');
        }
    };

    const stopRecording = () => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    useEffect(() => {
        if (!isRecording && audioChunks.length > 0) {
            const uploadRecording = async () => {
                const mimeType = recordingMimeTypeRef.current || 'audio/webm';
                const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const audioBlob = new Blob(audioChunks, { type: mimeType });
                const formData = new FormData();
                formData.append('audio', audioBlob, `recording.${ext}`);
                formData.append('duration', recordingDuration);

                setIsSaving(true);
                try {
                    const res = await fetch(`/api/leads/${id}/record`, { method: 'POST', body: formData });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({}));
                        throw new Error(err.error || `Upload failed: ${res.status}`);
                    }
                    fetchLead();
                } catch (error) {
                    console.error('Upload failed:', error);
                    alert(error.message || 'Failed to save recording. Please try again.');
                } finally {
                    setIsSaving(false);
                    setAudioChunks([]);
                }
            };
            uploadRecording();
        }
    }, [isRecording, audioChunks, id, recordingDuration]);

    const updateLead = async (payload) => {
        setIsSaving(true);
        try {
            await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            fetchLead();
            setEditMode(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusUpdate = (newStatus) => {
        if (newStatus === lead.status) return;
        if (newStatus === 'Won') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
        updateLead({ status: newStatus });
    };

    const addAction = async () => {
        if (!newNote.trim()) return;
        setIsSaving(true);
        try {
            await fetch(`/api/leads/${id}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'Note', content: newNote })
            });
            setNewNote('');
            fetchLead();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-black uppercase tracking-widest">Hydrating Intel...</span>
        </div>
    );
    if (!lead) return <div className="p-12 text-center text-muted-foreground">Entity not found.</div>;

    const formatDuration = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/10">
            {/* Classic Header */}
            <header className="bg-white dark:bg-slate-950 border-b border-border px-8 py-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <Link href="/leads" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors text-muted-foreground border border-transparent hover:border-border">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    onBlur={() => updateLead({ company })}
                                    className="text-xl font-black tracking-tight uppercase bg-transparent border-b border-indigo-500 outline-none w-full"
                                    placeholder="Company Name"
                                    autoFocus
                                />
                            ) : (
                                <h1 className="text-xl font-black tracking-tight uppercase">{lead.company || lead.name}</h1>
                            )}
                            <PriorityToggle priority={lead.priority} onUpdate={(p) => updateLead({ priority: p })} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Building size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">{lead.name}</span>
                            <span className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-widest mx-1">•</span>
                            <MapPin size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-medium">{lead.location || 'San Francisco, CA'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isRecording && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-red-50 dark:bg-red-950/30 rounded-full border border-red-200 dark:border-red-900/50 animate-pulse mr-4">
                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                            <span className="text-xs font-black text-red-600 tracking-widest uppercase">{formatDuration(recordingDuration)}</span>
                        </div>
                    )}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={clsx(
                            "btn h-9 px-4 text-xs font-black transition-all flex items-center gap-2",
                            isRecording ? "btn-danger bg-red-600 text-white" : "btn-outline border-red-200 text-red-600 hover:bg-red-50"
                        )}
                    >
                        {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                        {isRecording ? 'STOP' : 'LIVE RECORD'}
                    </button>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={clsx("btn h-9 px-4 text-xs font-bold transition-all", editMode ? "btn-secondary" : "btn-outline")}
                    >
                        {editMode ? 'Cancel' : 'Modify'}
                    </button>
                    <button className="btn btn-primary h-9 w-9 p-0 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/40">
                        <Plus size={16} />
                    </button>
                </div>
            </header>

            {/* Classic 2-Column Layout */}
            <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-12 gap-8 custom-scrollbar overflow-y-auto">

                {/* Main Content (8/12) */}
                <div className="md:col-span-8 space-y-8">

                    {/* Horizontal Stepper (from Step 333) */}
                    <div className="card p-6 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Activity size={12} className="text-indigo-600" /> Lead Lifecycle
                            </h3>
                        </div>
                        <div className="relative flex justify-between items-center px-4">
                            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-100 dark:bg-slate-900 -translate-y-1/2 -z-10 rounded-full"></div>
                            {STATUS_STEPS.map((step, i) => {
                                const currentIndex = STATUS_STEPS.indexOf(lead.status);
                                const isCompleted = i < currentIndex;
                                const isActive = i === currentIndex;
                                return (
                                    <button
                                        key={step}
                                        onClick={() => handleStatusUpdate(step)}
                                        className="relative group flex flex-col items-center"
                                    >
                                        <div className={clsx(
                                            "w-7 h-7 rounded-full border-4 transition-all duration-300 z-10 flex items-center justify-center",
                                            isActive ? "bg-indigo-600 border-white dark:border-slate-950 scale-125 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40" :
                                                isCompleted ? "bg-indigo-600 border-indigo-600" : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 group-hover:border-indigo-200"
                                        )}>
                                            {isCompleted && <Check size={12} className="text-white" />}
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                                        </div>
                                        <span className={clsx(
                                            "absolute top-9 text-[10px] font-black uppercase tracking-widest transition-colors whitespace-nowrap",
                                            isActive ? "text-indigo-600" : "text-muted-foreground/60"
                                        )}>
                                            {step}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Notes / Description */}
                    <div className="card bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MessageSquare size={12} className="text-indigo-600" /> Prospect Intelligence
                            </h3>
                            {!editMode && <button onClick={() => setEditMode(true)} className="text-[10px] font-bold text-indigo-600 hover:underline">UPDATE</button>}
                        </div>
                        <div className="p-6">
                            {editMode ? (
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-900 border border-border rounded-lg min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                        placeholder="Write detailed background..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => updateLead({ description })}
                                            className="btn btn-primary h-8 px-6 text-xs font-black"
                                        >
                                            <Save size={14} className="mr-2" /> Save Details
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                                    {lead.description || "No specific documentation provided for this entity."}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-4">
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                            <div className="flex gap-4">
                                <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                                    <MessageSquare size={16} className="text-indigo-600" />
                                </div>
                                <div className="flex-1 space-y-3">
                                    <textarea
                                        className="w-full bg-transparent outline-none border-0 p-0 text-sm font-bold placeholder:text-slate-400 min-h-[60px]"
                                        placeholder="Post a quick update..."
                                        value={newNote}
                                        onChange={e => setNewNote(e.target.value)}
                                    />
                                    <div className="flex justify-between items-center pt-2">
                                        <div className="flex gap-2 text-slate-400">
                                            <button className="p-1 hover:bg-slate-100 rounded transition-colors"><LinkIcon size={14} /></button>
                                        </div>
                                        <button
                                            onClick={addAction}
                                            disabled={!newNote.trim() || isSaving}
                                            className="btn btn-primary h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Post Update
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {actions.map((action, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={action.id}
                                className="flex gap-4 relative"
                            >
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 border border-border/50 flex items-center justify-center shadow-sm">
                                        {action.type === 'Recording' ? <Mic size={12} className="text-red-500" /> : <Clock size={12} className="text-muted-foreground" />}
                                    </div>
                                    <div className="w-px grow bg-slate-200 dark:bg-slate-800 my-1"></div>
                                </div>
                                <div className="flex-1 pb-6">
                                    <div className="text-[10px] font-bold text-muted-foreground/60 mb-1">{new Date(action.created_at).toLocaleString()}</div>
                                    <div className="card p-4 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/30 shadow-sm">
                                        <div className="font-black text-[10px] text-indigo-600 uppercase tracking-widest mb-1">{action.type}</div>
                                        <p className="text-[13px] text-slate-700 dark:text-slate-300 font-medium">{action.content}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Sidebar (4/12) */}
                <div className="md:col-span-4 space-y-6">

                    {/* Audio Record Vault */}
                    <div className="card bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Play size={12} fill="currentColor" /> Record Vault
                            </h3>
                            {isSaving && <Loader2 size={12} className="animate-spin text-indigo-600" />}
                        </div>
                        <div className="p-4 space-y-4">
                            {recordings.map((rec) => (
                                <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border/50 space-y-3 group">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(rec.created_at).toLocaleDateString()}</span>
                                            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{new Date(rec.created_at).toLocaleTimeString()}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-indigo-600 px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded">
                                            {formatDuration(rec.duration)}
                                        </span>
                                    </div>
                                    <audio src={rec.url} controls className="w-full h-8 block" />
                                </div>
                            ))}
                            {recordings.length === 0 && (
                                <div className="text-center py-8">
                                    <Mic size={24} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No recordings found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card p-6 bg-white dark:bg-slate-950 border-0 ring-1 ring-border/50 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-6">Contact Matrix</h3>
                        <div className="space-y-5">
                            <MetaItem icon={Mail} label="Email Address" value={lead.email || 'None provided'} />
                            <MetaItem icon={Phone} label="Primary Contact" value={lead.phone || 'Unknown'} />
                            <div className="flex gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border/30 flex items-center justify-center text-muted-foreground shrink-0">
                                    <User size={14} />
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Owner</span>
                                    <select
                                        className="text-xs font-bold bg-transparent border-0 p-0 focus:ring-0 outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                                        value={lead.assigned_to || ''}
                                        onChange={(e) => updateLead({ assigned_to: e.target.value })}
                                    >
                                        <option value="">Unassigned</option>
                                        {team.map(member => (
                                            <option key={member.id} value={member.name}>{member.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <MetaItem icon={DollarSign} label="Deal Value" value={`$${lead.value?.toLocaleString() || 0}`} isIndigo />
                        </div>
                    </div>

                    <div className="card p-4 bg-slate-900 text-white border-0 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0 tracking-widest">AI</div>
                            <p className="text-[11px] font-medium text-slate-300 leading-snug">Focus on {lead.priority} priority closing. Follow up on proposal sent in Q1.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function PriorityToggle({ priority, onUpdate }) {
    const levels = ['Low', 'Medium', 'High', 'Urgent'];
    const colors = {
        Urgent: "bg-red-500",
        High: "bg-amber-500",
        Medium: "bg-indigo-500",
        Low: "bg-slate-400"
    };

    return (
        <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-0.5 border border-border/50 shrink-0">
            {levels.map(p => (
                <button
                    key={p}
                    onClick={() => onUpdate(p)}
                    className={clsx(
                        "px-2 py-0.5 text-[9px] font-black uppercase tracking-widest transition-all rounded",
                        priority === p ? `${colors[p]} text-white shadow-sm` : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}

function MetaItem({ icon: Icon, label, value, isIndigo }) {
    return (
        <div className="flex gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-border/30 flex items-center justify-center text-muted-foreground shrink-0">
                <Icon size={14} />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                <span className={clsx("text-xs font-bold truncate", isIndigo ? "text-indigo-600" : "text-slate-800 dark:text-slate-200")}>{value}</span>
            </div>
        </div>
    );
}

const DollarSign = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
);
