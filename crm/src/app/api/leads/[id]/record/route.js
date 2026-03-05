import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import db from '@/lib/db';

export async function POST(request, { params }) {
    try {
        const { id } = await params; // Awaited params for Next.js 16
        const formData = await request.formData();
        const file = formData.get('audio');
        const duration = formData.get('duration') || 0;

        if (!file) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const dir = path.join(process.cwd(), 'public', 'recordings');
        await mkdir(dir, { recursive: true });

        const filename = `recording-${id}-${Date.now()}.webm`;
        const filepath = path.join(dir, filename);
        const relativeUrl = `/recordings/${filename}`;

        await writeFile(filepath, buffer);

        // Save entry in recordings history table
        await db.execute({
            sql: 'INSERT INTO recordings (lead_id, url, filename, duration) VALUES (?, ?, ?, ?)',
            args: [id, relativeUrl, filename, duration]
        });

        // Log the event in timeline
        await db.execute({
            sql: 'INSERT INTO actions (lead_id, type, content) VALUES (?, ?, ?)',
            args: [id, 'Recording', `Audio memo archived: ${filename}`]
        });

        return NextResponse.json({ success: true, url: relativeUrl });
    } catch (error) {
        console.error('Audio upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
