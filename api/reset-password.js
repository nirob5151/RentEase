/* eslint-env node */
/**
 * Vercel Serverless Function: Reset Password (Server-side using Service Role Key)
 * Endpoint: POST /api/reset-password
 */

import { createClient } from '@supabase/supabase-js';
import { verifyVerificationToken } from './verify-otp.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, newPassword, verificationToken } = req.body || {};

  if (!email || !newPassword || !verificationToken) {
    return res.status(400).json({ error: 'Email, new password, and verification token are required.' });
  }

  const cleanEmail = (email || '').trim().toLowerCase();

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  // 1. Verify proof token issued by /api/verify-otp
  const isTokenValid = verifyVerificationToken(cleanEmail, verificationToken);
  if (!isTokenValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP verification token. Please verify your OTP code again.' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[Serverless /api/reset-password] Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL.');
    return res.status(500).json({ error: 'Server authentication configuration missing.' });
  }

  try {
    const supabaseServer = createClient(supabaseUrl, serviceRoleKey);

    // 2. Find user in Supabase Auth via admin API
    const { data: usersData, error: listErr } = await supabaseServer.auth.admin.listUsers();
    if (listErr) {
      console.error('[Serverless /api/reset-password] listUsers error:', listErr);
      return res.status(500).json({ error: 'Failed to query user records.' });
    }

    const user = (usersData?.users || []).find(u => (u.email || '').toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    // 3. Update user password via admin API
    const { error: updateErr } = await supabaseServer.auth.admin.updateUserById(user.id, {
      password: newPassword
    });

    if (updateErr) {
      console.error('[Serverless /api/reset-password] updateUserById error:', updateErr);
      return res.status(500).json({ error: `Password update failed: ${updateErr.message}` });
    }

    return res.status(200).json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('[Serverless /api/reset-password] Server exception:', err);
    return res.status(500).json({ error: 'Internal server error while resetting password.' });
  }
}
