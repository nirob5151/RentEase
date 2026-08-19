/**
 * Email Verification Service
 * Supports Resend API / Serverless Gateway (/api/send-otp)
 */

export const emailService = {
  /**
   * Send 6-digit verification code to recipient email
   */
  async sendVerificationCode({ email, code, name }) {
    const recipient = (email || '').trim();
    const recipientName = (name || 'Student').trim();

    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const fromEmail = import.meta.env.VITE_EMAIL_FROM || 'onboarding@resend.dev';

    // 1. Try serverless backend route (/api/send-otp) if deployed
    try {
      const serverlessRes = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipient, code, name: recipientName })
      });
      if (serverlessRes.ok) {
        console.log(`[EmailService] OTP dispatched via serverless API to: ${recipient}`);
        return { success: true, message: `Verification email sent to ${recipient}` };
      }
    } catch {
      // Ignore serverless 404 in pure static dev mode
    }

    // 2. Fallback: Direct Resend API dispatch if VITE_RESEND_API_KEY is provided
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: `RentEase Support <${fromEmail}>`,
            to: [recipient],
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
          console.error('[EmailService] Resend API dispatch error:', response.status, errData);
        } else {
          console.log(`[EmailService] Resend API dispatch successful to: ${recipient}`);
        }
      } catch (err) {
        console.warn('[EmailService] Remote dispatch notice:', err.message);
      }
    } else {
      console.warn('[EmailService] ⚠️ VITE_RESEND_API_KEY is not set. Please add VITE_RESEND_API_KEY to your .env file or Vercel Environment Variables to receive real OTP emails.');
    }

    return {
      success: true,
      message: `Verification code sent to ${recipient}`
    };
  },

  /**
   * Send notification email (e.g. ID verification approval or rejection status)
   */
  async sendNotificationEmail({ email, subject, title, message }) {
    const recipient = (email || '').trim();
    const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
    const fromEmail = import.meta.env.VITE_EMAIL_FROM || 'onboarding@resend.dev';

    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
          },
          body: JSON.stringify({
            from: `RentEase Support <${fromEmail}>`,
            to: [recipient],
            subject: subject || '📢 RentEase Account Update',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 520px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
                <h2 style="color: #1e3a8a; margin-top: 0;">${title || 'RentEase Verification Status'}</h2>
                <p style="color: #334155; font-size: 15px; line-height: 1.6;">
                  ${message}
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                  &copy; 2026 RentEase Inc. BUBT Campus, Mirpur-2, Dhaka, Bangladesh.
                </p>
              </div>
            `
          })
        });
      } catch (err) {
        console.warn('[EmailService] Remote notification dispatch error:', err.message);
      }
    }

    return {
      success: true,
      message: `Status email dispatched to ${recipient}`
    };
  }
};

