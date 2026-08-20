/* eslint-env node */
/**
 * Vercel Serverless Function: Send OTP via Resend (Server-side storage with Service Role Key)
 * Endpoint: POST /api/send-otp
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, signupData, name, code: customCode } = req.body || {};

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required.' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const recipientName = name || signupData?.name || 'User';

  // 1. Generate 6-digit OTP code (server-side if not supplied)
  const otpCode = customCode || Math.floor(100000 + Math.random() * 900000).toString();

  // 2. Save/Upsert OTP into email_verifications table using SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const supabaseServer = createClient(supabaseUrl, serviceRoleKey);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes expiry

      const { error: dbErr } = await supabaseServer
        .from('email_verifications')
        .upsert([{
          email: cleanEmail,
          code: otpCode,
          signup_data: signupData || null,
          expires_at: expiresAt,
          created_at: new Date().toISOString()
        }], { onConflict: 'email' });

      if (dbErr) {
        console.error('[Serverless /api/send-otp] Supabase DB upsert error:', dbErr.message);
      }
    } catch (dbEx) {
      console.error('[Serverless /api/send-otp] Supabase client error:', dbEx);
    }
  } else {
    console.warn('[Serverless /api/send-otp] Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL.');
  }

  // 3. Dispatch Email via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!resendApiKey) {
    console.warn('[Serverless /api/send-otp] RESEND_API_KEY not configured.');
    return res.status(200).json({
      success: true,
      message: 'OTP saved in database (Resend API key missing in environment).'
    });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: `RentEase Support <${fromEmail}>`,
        to: [cleanEmail],
        subject: '🔒 Your RentEase 6-Digit Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Welcome to RentEase, ${recipientName}! 👋</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">
              Your 6-digit email verification code for setting up or verifying your account is:
            </p>
            <div style="background: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; margin: 20px 0;">
              ${otpCode}
            </div>
            <p style="color: #64748b; font-size: 13px;">
              This verification code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center;">
              &copy; 2026 RentEase Inc. BUBT Campus, Dhaka, Bangladesh.
            </p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('[Serverless /api/send-otp] Resend API error:', errData);
      return res.status(500).json({ error: 'Failed to deliver OTP email.' });
    }

    return res.status(200).json({ success: true, message: 'Verification email dispatched successfully.' });
  } catch (err) {
    console.error('[Serverless /api/send-otp] Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
