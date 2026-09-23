import crypto from 'node:crypto';
import { promisify } from 'node:util';
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

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algorithm, salt, key] = String(stored).split('$');
  if (algorithm !== 'scrypt' || !salt || !key) return false;
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
}

export async function requireUser(req: VercelRequest, res: VercelResponse, adminOnly = false) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : typeof req.query.token === 'string' ? req.query.token : null;
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

export { ObjectId, getDatabase };
