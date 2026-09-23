import type { VercelRequest, VercelResponse } from '@vercel/node';
import { bcrypt } from '../_lib/auth';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.json({ ok: true, bcrypt: typeof bcrypt.hash });
}
