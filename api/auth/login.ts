import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bcrypt, getDatabase, signToken } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const { email, password } = req.body ?? {};
  const db = await getDatabase();
  const user = await db.collection('users').findOne({ email: String(email || '').trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) return res.status(401).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
  const token = signToken({ sub: user._id.toString(), role: user.role, email: user.email });
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
