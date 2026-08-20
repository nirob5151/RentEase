/* eslint-env node */
/**
 * Vercel Serverless Function: Verify OTP Code (Server-side using Service Role Key)
 * Endpoint: POST /api/verify-otp
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export function generateVerificationToken(email) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'rentease_verification_secret_key';
  const timestamp = Date.now();
  const payload = `${email.toLowerCase()}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
}

export function verifyVerificationToken(email, token) {
  if (!email || !token) return false;
  try {
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || 'rentease_verification_secret_key';
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return false;
    const [tokenEmail, timestampStr, hmac] = parts;
    if (tokenEmail.toLowerCase() !== email.toLowerCase()) return false;
    const timestamp = Number(timestampStr);
    // Token valid for 15 minutes
    if (Date.now() - timestamp > 15 * 60 * 1000) return false;
    const expectedHmac = crypto.createHmac('sha256', secret).update(`${tokenEmail}:${timestampStr}`).digest('hex');
    return hmac === expectedHmac;
  } catch (err) {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, code } = req.body || {};

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const enteredCode = (code || '').trim();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.warn('[Serverless /api/verify-otp] Supabase URL or SUPABASE_SERVICE_ROLE_KEY missing on server.');
    return res.status(500).json({ error: 'Server authentication configuration missing.' });
  }

  try {
    const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

    const { data, error } = await supabaseServer
      .from('email_verifications')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error || !data) {
      return res.status(200).json({ valid: false, message: 'No active verification code found for this email. Please request a new code.' });
    }

    const expiresAtMs = new Date(data.expires_at).getTime();
    if (Date.now() > expiresAtMs) {
      return res.status(200).json({ valid: false, message: 'Verification code has expired. Please click Resend Code for a new code.' });
    }

    if (data.code !== enteredCode) {
      return res.status(200).json({ valid: false, message: 'Invalid verification code. Please check and try again.' });
    }

    // Code is valid and matches! Delete from email_verifications server-side so it cannot be reused.
    await supabaseServer
      .from('email_verifications')
      .delete()
      .eq('email', cleanEmail);

    // Issue short-lived proof token for password reset or signup verification
    const token = generateVerificationToken(cleanEmail);

    return res.status(200).json({
      valid: true,
      token,
      message: 'OTP verified successfully.',
      signupData: data.signup_data
    });
  } catch (err) {
    console.error('[Serverless /api/verify-otp] Exception error:', err);
    return res.status(500).json({ error: 'Internal server error while verifying code.' });
  }
}
