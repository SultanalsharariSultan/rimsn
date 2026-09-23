import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, requireUser } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res, true);
  if (!user) return;
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });
  const orders = await (await getDatabase()).collection('orders').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  return res.json(orders);
}
