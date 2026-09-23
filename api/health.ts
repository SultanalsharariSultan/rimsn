import type { VercelRequest, VercelResponse } from '@vercel/node';
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const missing = ['MONGODB_URI', 'JWT_SECRET', 'ADMIN_EMAIL'].filter((name) => !process.env[name]);
  if (missing.length) return res.status(503).json({ ok: false, message: 'متغيرات Vercel ناقصة', missing });
  try {
    const { getDatabase } = await import('./_lib/mongodb');
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return res.json({ ok: true, database: 'connected' });
  } catch (error) {
    console.error('health check failed', error);
    return res.status(503).json({ ok: false, message: 'MongoDB غير متصلة. تحقق من الرابط وNetwork Access في MongoDB Atlas.' });
  }
}
