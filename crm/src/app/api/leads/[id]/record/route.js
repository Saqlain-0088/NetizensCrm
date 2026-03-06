import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request, { params }) {
    try {
        const { id } = await params; // Awaited params for Next.js 16
        const formData = await request.formData();
        const file = formData.get('audio');
        const duration = formData.get('duration') || 0;

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = file.name?.split('.').pop() || (file.type?.includes('mp4') ? 'mp4' : 'webm');
        const filename = `recording-${id}-${Date.now()}.${ext}`;
        const contentType = file.type || (ext === 'mp4' ? 'audio/mp4' : 'audio/webm');

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('audio')
            .upload(filename, buffer, {
                contentType,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            throw new Error(`Failed to upload to Supabase: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('audio')
            .getPublicUrl(filename);

        // Save entry in recordings history table
        await db.execute({
            sql: 'INSERT INTO recordings (lead_id, url, filename, duration) VALUES (?, ?, ?, ?)',
            args: [id, publicUrl, filename, duration]
        });

        // Log the event in timeline
        await db.execute({
            sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
            args: [id, 'Recording', `Audio memo archived: ${filename}`]
        });

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Audio upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
