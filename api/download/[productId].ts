import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDatabase, ObjectId, requireUser } from '../_lib/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req, res);
  if (!user) return;
  const productId = String(req.query.productId);
  const db = await getDatabase();
  const owned = await db.collection('orders').findOne({ userId: new ObjectId(user.sub), status: 'paid', 'items.productId': new ObjectId(productId) });
  if (!owned) return res.status(403).json({ message: 'هذا المنتج غير موجود ضمن مشترياتك' });
  const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
  if (!product?.fileUrl) return res.status(404).json({ message: 'ملف المنتج غير متاح' });
  return res.redirect(302, product.fileUrl);
}
