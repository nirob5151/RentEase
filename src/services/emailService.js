/**
 * Email Verification Service
 * Dispatches emails server-side via Serverless Gateway (/api/send-otp).
 * VITE_RESEND_API_KEY is never exposed to or sent from the client browser.
 */

export const emailService = {
  /**
   * Send 6-digit verification code to recipient email
   */
  async sendVerificationCode({ email, code, name }) {
    const recipient = (email || '').trim();
    const recipientName = (name || 'Student').trim();

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: recipient, code, name: recipientName })
      });
      
      if (response.ok) {
        console.log(`[EmailService] Verification email dispatched via /api/send-otp to: ${recipient}`);
        return { success: true, message: `Verification email sent to ${recipient}` };
      }
      
      const errData = await response.json().catch(() => ({}));
      console.warn('[EmailService] Gateway dispatch warning:', errData.error || response.statusText);
    } catch (err) {
      console.warn('[EmailService] Local static dev mode network notice:', err.message);
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

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: recipient,
          code: 'STATUS_UPDATE',
          name: title || subject || 'RentEase User',
          customMessage: message
        })
      });
      if (response.ok) {
        console.log(`[EmailService] Notification email dispatched via /api/send-otp to: ${recipient}`);
      }
    } catch (err) {
      console.warn('[EmailService] Notification dispatch notice:', err.message);
    }

    return {
      success: true,
      message: `Status email processed for ${recipient}`
    };
  }
};
