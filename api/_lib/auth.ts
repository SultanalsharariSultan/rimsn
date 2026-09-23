import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

type TokenPayload = { sub: string; role: 'customer' | 'admin'; email: string };

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error('JWT_SECRET is not configured');
  return value;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, secret(), { expiresIn: '7d' });
}

export async function requireUser(req: VercelRequest, res: VercelResponse, adminOnly = false) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ message: 'يجب تسجيل الدخول' });
    return null;
  }
  try {
    const payload = jwt.verify(token, secret()) as TokenPayload;
    if (adminOnly && payload.role !== 'admin') {
      res.status(403).json({ message: 'غير مصرح' });
      return null;
    }
    return payload;
  } catch {
    res.status(401).json({ message: 'جلسة الدخول غير صالحة' });
    return null;
  }
}

export { bcrypt, ObjectId, getDatabase };
