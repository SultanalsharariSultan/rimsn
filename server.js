const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const User = require('./userModel');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'rimsn-development-secret';
let databaseConnection;

function connectToDatabase() {
  if (!MONGO_URI) return Promise.reject(new Error('MONGO_URI is not configured'));
  if (!databaseConnection) {
    databaseConnection = mongoose.connect(MONGO_URI).catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
  }
  return databaseConnection;
}

function createToken(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, expires: Date.now() + 7 * 86400000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return data.expires > Date.now() ? data.userId : null;
}

function authRequired(req, res, next) {
  try {
    const userId = verifyToken((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
    if (!userId) return res.status(401).json({ success: false, error: 'تسجيل الدخول مطلوب' });
    req.userId = userId;
    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'جلسة الدخول غير صالحة' });
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

async function passwordMatches(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = await hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(candidate.split(':')[1], 'hex'), Buffer.from(hash, 'hex'));
}

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'rimsn gaming hub', databaseConfigured: Boolean(MONGO_URI), databaseState: mongoose.connection.readyState });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ success: false, error: 'أدخل الاسم والبريد وكلمة مرور من 8 أحرف على الأقل' });
    }
    await connectToDatabase();
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ success: false, error: 'البريد مستخدم مسبقاً' });
    const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) });
    res.status(201).json({ success: true, token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email, settings: user.settings } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectToDatabase();
    const user = await User.findOne({ email: String(req.body.email || '').trim().toLowerCase() });
    if (!user || !(await passwordMatches(String(req.body.password || ''), user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'البريد أو كلمة المرور غير صحيحة' });
    }
    res.json({ success: true, token: createToken(user.id), user: { id: user.id, name: user.name, email: user.email, settings: user.settings } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/me', authRequired, async (req, res) => {
  try {
    await connectToDatabase();
    const user = await User.findById(req.userId).select('-passwordHash').lean();
    if (!user) return res.status(404).json({ success: false, error: 'المستخدم غير موجود' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/me/settings', authRequired, async (req, res) => {
  try {
    await connectToDatabase();
    const settings = req.body.settings || {};
    const user = await User.findByIdAndUpdate(req.userId, { $set: { settings } }, { new: true }).select('-passwordHash').lean();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const response = await fetch('https://www.eurogamer.net/feed');
    if (!response.ok) throw new Error(`News source returned ${response.status}`);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 12).map((match) => {
      const item = match[1];
      const value = (tag) => (item.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}>([\\s\\S]*?)<\\/${tag}>`)) || []).slice(1).find(Boolean) || '';
      return { title: value('title'), link: value('link'), description: value('description').replace(/<[^>]+>/g, '') };
    }).filter((item) => item.title && item.link);
    res.json({ success: true, source: 'Eurogamer RSS', items });
  } catch (error) {
    res.status(502).json({ success: false, error: 'تعذر تحميل أخبار الألعاب حالياً' });
  }
});

if (require.main === module) app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
module.exports = app;
