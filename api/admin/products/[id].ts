import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, ObjectId, requireUser } from '../../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res, true);
  if (!user) return;
  const id = String(req.query.id);
  if (!ObjectId.isValid(id)) return res.status(400).json({ message: 'معرف المنتج غير صالح' });
  const db = await getDatabase();
  if (req.method === 'PATCH') {
    const { _id: _ignored, ...changes } = req.body ?? {};
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...changes, updatedAt: new Date() } },
      { returnDocument: 'after' },
    );
    return result ? res.json(result) : res.status(404).json({ message: 'المنتج غير موجود' });
  }
  if (req.method === 'DELETE') {
    await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: { active: false, updatedAt: new Date() } });
    return res.status(204).end();
  }
  return res.status(405).json({ message: 'Method not allowed' });
}
