import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        console.log('🔔 Manual reminder trigger initiated...');

        const { stdout, stderr } = await execAsync('node scripts/check-followups.js', {
            cwd: process.cwd()
        });

        return NextResponse.json({
            success: true,
            message: 'Reminder check completed',
            output: stdout,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Reminder trigger error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            output: error.stdout || ''
        }, { status: 500 });
    }
}

export async function POST() {
    return GET(); // Same logic for POST
}
