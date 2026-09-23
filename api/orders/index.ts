import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, ObjectId, requireUser } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res);
  if (!user) return;
  const db = await getDatabase();
  if (req.method === 'GET') return res.json(await db.collection('orders').find({ userId: new ObjectId(user.sub), status: 'paid' }).sort({ createdAt: -1 }).toArray());
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });
  const items = Array.isArray(req.body?.items) ? req.body.items : [];
  const products = await db.collection('products').find({ _id: { $in: items.map((item: { productId: string }) => new ObjectId(item.productId)) } }).toArray() as unknown as Array<{ _id: ObjectId; title: string; price: number; storagePath?: string }>;
  const lineItems = products.map((product: { _id: ObjectId; title: string; price: number; storagePath?: string }) => {
    const requested = items.find((item: { productId: string }) => item.productId === product._id.toString());
    return { productId: product._id, title: product.title, quantity: Math.max(1, Number(requested?.quantity || 1)), unitPrice: product.price, storagePath: product.storagePath };
  });
  const total = lineItems.reduce((sum: number, item: { unitPrice: number; quantity: number }) => sum + item.unitPrice * item.quantity, 0);
  const result = await db.collection('orders').insertOne({ userId: new ObjectId(user.sub), items: lineItems, total, status: 'paid', createdAt: new Date() });
  return res.status(201).json({ id: result.insertedId, total, status: 'paid' });
}
