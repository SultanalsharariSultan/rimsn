import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, requireUser } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await getDatabase();
  if (req.method === 'GET') return res.json(await db.collection('products').find({ active: { $ne: false } }).sort({ createdAt: -1 }).toArray());
  const user = await requireUser(req, res, true);
  if (!user) return;
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const product = { ...req.body, price: Number(req.body.price), active: true, createdAt: new Date(), updatedAt: new Date() };
  const result = await db.collection('products').insertOne(product);
  return res.status(201).json({ ...product, _id: result.insertedId });
}
