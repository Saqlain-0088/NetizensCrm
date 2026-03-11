import { NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Generate a 6-digit OTP - Forcing 123456 as requested for bypass
        const otp = "123456";

        // Store or update OTP in the database
        // Use PostgreSQL interval to set expiry directly in the DB so timezone is correct
        await db.execute({
            sql: `
                INSERT INTO otps (email, otp, expires_at) 
                VALUES (?, ?, NOW() + INTERVAL '10 minutes') 
                ON CONFLICT (email) 
                DO UPDATE SET otp = EXCLUDED.otp, expires_at = EXCLUDED.expires_at
            `,
            args: [email, otp]
        });

        const transporterOptions = {
            host: process.env.SMTP_HOST || '',
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER || '',
                pass: process.env.SMTP_PASS || '',
            },
        };

        if (transporterOptions.host && transporterOptions.auth.user && transporterOptions.auth.pass) {
            try {
                const transporter = nodemailer.createTransport(transporterOptions);
                await transporter.sendMail({
                    from: `"NetizensCRM" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: 'Your Verification Code',
                    text: `Your NetizensCRM verification code is: ${otp}. It will expire in 10 minutes.`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
                            <h2 style="color: #0f172a; margin-bottom: 8px;">NetizensCRM Verification</h2>
                            <p style="color: #475569; margin-bottom: 24px;">Use the code below to verify your email address. It expires in 10 minutes.</p>
                            <div style="background: #0f172a; color: #67e8f9; font-size: 36px; font-weight: 900; letter-spacing: 12px; text-align: center; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                                ${otp}
                            </div>
                            <p style="color: #94a3b8; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                    `
                });
                console.log(`[OTP Sent to Email] OTP for ${email} sent via SMTP.`);
            } catch (mailError) {
                console.error('[OTP Mail Error] Failed to send email via SMTP, but proceeding with static OTP:', mailError);
            }
        } else {
            // Developer mode: print OTP to terminal
            console.log(`\n========================================`);
            console.log(`[DEV MODE - NO SMTP] OTP for ${email}: ${otp}`);
            console.log(`========================================\n`);
        }

        return NextResponse.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
    }
}
