import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyAuth } from '@/lib/utils';

export async function PUT(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { transcribed_text } = await request.json();

        if (typeof transcribed_text !== 'string') {
            return NextResponse.json({ error: 'Invalid transcription text' }, { status: 400 });
        }

        const result = await db.execute({
            sql: `
                UPDATE notes 
                SET transcribed_text = ? 
                WHERE id = ? AND user_id = ?
                RETURNING id
            `,
            args: [transcribed_text, id, authResult.user.id]
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Note not found or you are not authorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Fetch note to get the audio_url and delete the local file
        const note = await db.execute({
            sql: `SELECT audio_url FROM notes WHERE id = ? AND user_id = ?`,
            args: [id, authResult.user.id]
        });

        if (note.rows.length === 0) {
            return NextResponse.json({ error: 'Note not found or you are not authorized' }, { status: 404 });
        }

        // Delete from DB (audio is stored in Supabase, no local file to delete)
        await db.execute({
            sql: `DELETE FROM notes WHERE id = ? AND user_id = ?`,
            args: [id, authResult.user.id]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }
}
