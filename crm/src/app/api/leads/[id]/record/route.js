import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request, { params }) {
    try {
        const { id } = await params; // Awaited params for Next.js 16
        const leadId = parseInt(id, 10);
        if (isNaN(leadId)) {
            return NextResponse.json({ error: 'Invalid lead ID' }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('audio');
        const duration = parseInt(formData.get('duration') || '0', 10);
        const uploadId = formData.get('upload_id')?.toString() || '';

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Check Supabase configuration
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Recording API: Supabase env vars missing');
            return NextResponse.json({
                error: 'Storage not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to Vercel environment variables, and create an "audio" bucket in Supabase Storage.'
            }, { status: 503 });
        }

        // Validate service_role key format (JWT starts with eyJ)
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!key.startsWith('eyJ') || key.length < 100) {
            return NextResponse.json({
                error: 'Invalid SUPABASE_SERVICE_ROLE_KEY. Use the service_role (secret) key from Supabase API settings, not the anon key.'
            }, { status: 503 });
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name?.split('.').pop() || (file.type?.includes('mp4') ? 'mp4' : 'webm');
        const filename = uploadId ? `recording-${leadId}-${uploadId}.${ext}` : `recording-${leadId}-${Date.now()}.${ext}`;
        const contentType = file.type || (ext === 'mp4' ? 'audio/mp4' : 'audio/webm');

        // Deduplicate: if same upload_id already saved (e.g. duplicate onstop from Safari), return success
        if (uploadId) {
            const existing = await db.execute({
                sql: 'SELECT url FROM recordings WHERE lead_id = ? AND filename = ?',
                args: [leadId, filename]
            });
            if (existing.rows?.length > 0) {
                return NextResponse.json({ success: true, url: existing.rows[0].url });
            }
        }

        // Upload to Supabase Storage
        let publicUrl;
        try {
            const { error: uploadError } = await supabase.storage
                .from('audio')
                .upload(filename, buffer, {
                    contentType,
                    upsert: true
                });

            if (uploadError) {
                console.error('Supabase Storage Error:', uploadError);
                if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('not found')) {
                    return NextResponse.json({
                        error: 'Storage bucket "audio" not found. Create it in Supabase Dashboard → Storage.'
                    }, { status: 503 });
                }
                if (uploadError.message?.includes('JWT') || uploadError.message?.includes('invalid') || uploadError.message?.includes('Unauthorized')) {
                    return NextResponse.json({
                        error: 'Invalid Supabase key. Use the service_role key from Supabase → Settings → API, not the anon key.'
                    }, { status: 503 });
                }
                return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
            }

            const { data: urlData } = supabase.storage.from('audio').getPublicUrl(filename);
            publicUrl = urlData.publicUrl;
        } catch (supabaseErr) {
            console.error('Supabase error:', supabaseErr);
            return NextResponse.json({
                error: supabaseErr?.message || 'Supabase storage error. Check your Supabase URL and service_role key.'
            }, { status: 500 });
        }

        // Save entry in recordings (ON CONFLICT = race/duplicate, skip action insert)
        try {
            let insertResult;
            try {
                insertResult = await db.execute({
                    sql: `INSERT INTO recordings (lead_id, url, filename, duration) VALUES (?, ?, ?, ?)
                          ON CONFLICT (lead_id, filename) DO NOTHING RETURNING id`,
                    args: [leadId, publicUrl, filename, duration]
                });
            } catch (onConflictErr) {
                if (onConflictErr?.code === '42P10') {
                    // No unique constraint yet - use simple INSERT (run: node scripts/migrate-recordings-unique.js)
                    insertResult = await db.execute({
                        sql: 'INSERT INTO recordings (lead_id, url, filename, duration) VALUES (?, ?, ?, ?) RETURNING id',
                        args: [leadId, publicUrl, filename, duration]
                    });
                } else throw onConflictErr;
            }

            const inserted = insertResult.rows?.length > 0;
            if (inserted) {
                let transcript = "";
                if (process.env.OPENAI_API_KEY) {
                    try {
                        const whisperFormData = new FormData();
                        whisperFormData.append('file', new Blob([buffer], { type: contentType }), filename);
                        whisperFormData.append('model', 'whisper-1');

                        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                            },
                            body: whisperFormData
                        });

                        if (!whisperRes.ok) {
                            console.error("Whisper API error:", await whisperRes.text());
                            transcript = "Audio uploaded successfully. [Speech-to-Text failed due to OpenAI API Error]";
                        } else {
                            const whisperData = await whisperRes.json();
                            transcript = whisperData.text || "[No speech detected]";
                        }
                    } catch (e) {
                        console.error("Transcribe error:", e);
                        transcript = "Audio uploaded successfully. [Speech-to-Text service unreachable]";
                    }
                } else {
                    transcript = "[API KEY REQUIRED] Please add OPENAI_API_KEY to your .env.local file to enable real-time accurate Speech-To-Text transcription from the recorded audio.";
                }

                // Call AI to summarize the transcript
                const { summarizeNotes } = require('@/lib/ai');
                const analysis = await summarizeNotes(transcript);

                const richContent = `🎤 Audio Memo Archived: ${filename}\n\n**📝 Transcript:**\n"${transcript}"\n\n**✨ AI Summary:**\n${analysis.summary}\n\n**🎯 Next Action:**\n${analysis.actionItem}`;

                await db.execute({
                    sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
                    args: [leadId, 'Recording', richContent]
                });
            }
        } catch (dbError) {
            if (dbError?.code === '23505') {
                // Unique violation - duplicate, treat as success
            } else {
                console.error('Database error:', dbError);
                return NextResponse.json({
                    error: dbError?.message || 'Recording saved to storage but failed to save to database. Ensure the recordings table exists.'
                }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Audio upload error:', error);
        return NextResponse.json({
            error: error?.message || 'Recording failed'
        }, { status: 500 });
    }
}
