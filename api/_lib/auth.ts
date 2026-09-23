import * as crypto from 'node:crypto';
import { promisify } from 'node:util';
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
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 }));
  const data = `${header}.${body}`;
  const signature = base64url(crypto.createHmac('sha256', secret()).update(data).digest());
  return `${data}.${signature}`;
}

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString('base64url');
}

function verifyToken(token: string): TokenPayload {
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('invalid token');
  const data = `${header}.${body}`;
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload & { exp?: number };
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('expired token');
  return payload;
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
    const payload = verifyToken(token);
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
