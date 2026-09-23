import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, hashPassword, signToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  try {
    const { name, email, password } = req.body ?? {};
    if (!email || !password || String(password).length < 8) return res.status(400).json({ message: 'البيانات أو كلمة المرور غير صالحة' });
    const db = await getDatabase();
    const normalizedEmail = String(email).trim().toLowerCase();
    const exists = await db.collection('users').findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ message: 'البريد مستخدم مسبقًا' });
    const role = normalizedEmail === String(process.env.ADMIN_EMAIL || '').trim().toLowerCase() ? 'admin' : 'customer';
    const result = await db.collection('users').insertOne({
      name: String(name || 'عميل'),
      email: normalizedEmail,
      passwordHash: await hashPassword(String(password)),
      role,
      createdAt: new Date(),
    });
    const token = signToken({ sub: result.insertedId.toString(), role, email: normalizedEmail });
    return res.status(201).json({ token, user: { id: result.insertedId, name: String(name || 'عميل'), email: normalizedEmail, role } });
  } catch (error) {
    console.error('register failed', error);
    return res.status(503).json({ message: 'تعذر الاتصال بقاعدة البيانات. تحقق من MONGODB_URI وNetwork Access في MongoDB Atlas.' });
  }
}
