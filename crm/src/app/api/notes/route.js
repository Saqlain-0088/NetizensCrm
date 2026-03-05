import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { verifyAuth } from '@/lib/utils';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // This is a multipart form-data request
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        const transcribedText = formData.get('transcribed_text');
        const duration = parseInt(formData.get('duration') || '0', 10);
        const leadId = formData.get('lead_id') || null;

        if (!audioFile) {
            return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
        }

        const noteId = uuidv4();

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'audio');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate filename and save locally (for local development/deployment)
        const fileExtension = audioFile.name?.split('.').pop() || 'webm';
        const fileName = `${noteId}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Convert File to Buffer and write to disk
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        // Web accessible URL
        const audioUrl = `/uploads/audio/${fileName}`;

        // Insert into database
        await db.execute({
            sql: `
                INSERT INTO notes (id, user_id, lead_id, audio_url, transcribed_text, duration)
                VALUES (?, ?, ?, ?, ?, ?)
            `,
            args: [noteId, authResult.user.id, leadId, audioUrl, transcribedText, duration]
        });

        return NextResponse.json({
            id: noteId,
            user_id: authResult.user.id,
            lead_id: leadId,
            audio_url: audioUrl,
            transcribed_text: transcribedText,
            duration: duration,
            created_at: new Date().toISOString()
        }, { status: 201 });

    } catch (error) {
        console.error('Error saving note:', error);
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const leadId = searchParams.get('lead_id');

        let query = `
            SELECT id, user_id, lead_id, audio_url, transcribed_text, duration, created_at
            FROM notes
            WHERE user_id = ?
        `;
        const args = [authResult.user.id];

        if (leadId) {
            query += ` AND lead_id = ?`;
            args.push(leadId);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await db.execute({ sql: query, args });
        return NextResponse.json(result.rows);

    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}
