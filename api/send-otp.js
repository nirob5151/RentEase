/**
 * Vercel Serverless Function: Send OTP via Resend
 * Endpoint: POST /api/send-otp
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, code, name } = req.body || {};

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and OTP code are required.' });
  }

  const resendApiKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
  const fromEmail = process.env.VITE_EMAIL_FROM || process.env.EMAIL_FROM || 'onboarding@resend.dev';

  if (!resendApiKey) {
    console.error('[Serverless /api/send-otp] RESEND_API_KEY environment variable is not configured.');
    return res.status(500).json({ error: 'Server email configuration missing.' });
  }

  const recipientName = name || 'Student';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: `RentEase Support <${fromEmail}>`,
        to: [email],
        subject: '🔒 Your RentEase 6-Digit Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #1e3a8a; margin-top: 0;">Welcome to RentEase, ${recipientName}! 👋</h2>
            <p style="color: #475569; font-size: 15px; line-height: 1.5;">
              Your 6-digit email verification code for setting up your account is:
            </p>
            <div style="background: #f1f5f9; padding: 16px; text-align: center; border-radius: 8px; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #2563eb; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 13px;">
              This verification code will expire in <strong>10 minutes</strong>. If you did not request this account creation, please ignore this email.
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

    // Return success without exposing OTP code to client
    return res.status(200).json({ success: true, message: 'Verification email dispatched successfully.' });
  } catch (err) {
    console.error('[Serverless /api/send-otp] Server error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
