import crypto from 'node:crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bcrypt, getDatabase } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, token, password } = req.body ?? {};
  if (!email || !token || !password || String(password).length < 8) return res.status(400).json({ message: 'بيانات الاستعادة غير صالحة' });
  try {
    const db = await getDatabase();
    const user = await db.collection('users').findOne({ email: String(email).toLowerCase(), resetTokenHash: crypto.createHash('sha256').update(String(token)).digest('hex'), resetTokenExpiresAt: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'الرابط غير صالح أو منتهي' });
    await db.collection('users').updateOne({ _id: user._id }, { $set: { passwordHash: await bcrypt.hash(password, 12) }, $unset: { resetTokenHash: '', resetTokenExpiresAt: '' } });
    return res.json({ message: 'تم تغيير كلمة المرور' });
  } catch (error) {
    console.error('reset password failed', error);
    return res.status(503).json({ message: 'تعذر الاتصال بقاعدة البيانات. تحقق من إعدادات MongoDB في Vercel.' });
  }
}
