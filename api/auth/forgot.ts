import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const email = String(req.body?.email || '').trim().toLowerCase();
  const db = await getDatabase();
  const token = crypto.randomBytes(32).toString('hex');
  await db.collection('users').updateOne({ email }, { $set: { resetTokenHash: crypto.createHash('sha256').update(token).digest('hex'), resetTokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
  const baseUrl = process.env.APP_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/auth?reset=${token}&email=${encodeURIComponent(email)}`;
  return res.json({ message: 'إذا كان البريد موجودًا فسيصلك رابط الاستعادة', ...(process.env.NODE_ENV !== 'production' ? { resetUrl } : {}) });
}
