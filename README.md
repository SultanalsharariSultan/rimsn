# رِمْسَن | متجر المنتجات الرقمية

متجر عربي RTL مبني بـ React وVite مع API serverless على Vercel وMongoDB. لم تعد المنتجات أو الحسابات التجريبية موجودة في الواجهة؛ المنتجات تظهر فقط بعد إدخالها في Collection `products`.

## التشغيل المحلي

```bash
npm install
copy .env.example .env
npm run dev
```

## متغيرات Vercel

أضفها في **Vercel → Settings → Environment Variables**، ولا تضع `MONGODB_URI` داخل GitHub:

```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=rimsn
JWT_SECRET=ضع-قيمة-عشوائية-طويلة
ADMIN_EMAIL=بريدك-الذي-سيصبح-أدمن
APP_URL=https://www.rimsn.com
```

## تشغيل MongoDB

1. اضبط `ADMIN_EMAIL` على بريدك قبل إنشاء الحساب.
2. أنشئ حسابك من نموذج إنشاء الحساب؛ سيحصل هذا البريد على `role: "admin"`.
3. Collection `users` تستخدم: `name`, `email`, `passwordHash`, `role`.
4. أضف المنتجات في `products` باستخدام: `title`, `price`, `imageUrl`, `description`, `fileUrl`, `active`.
5. `fileUrl` يجب أن يكون رابطًا خاصًا أو موقّتًا من مزود تخزين؛ لا تستخدم رابطًا عامًا دائمًا للملفات المدفوعة.
6. الطلبات تُحفظ في `orders`، ولا يسمح endpoint التحميل إلا لمستخدم يملك طلبًا بحالة `paid`.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot`
- `POST /api/auth/reset`
- `GET /api/products`
- `POST /api/products` للأدمن فقط
- `PATCH /api/admin/products/:id` للأدمن فقط
- `DELETE /api/admin/products/:id` للأدمن فقط
- `GET /api/orders` للمستخدم المسجل
- `POST /api/orders` للمستخدم المسجل
- `GET /api/download/:productId` بعد التحقق من الشراء

## الدفع

الطلب الحالي تجريبي. قبل استقبال أموال حقيقية، اربط Stripe أو Tap عبر Backend/Webhook، ولا تجعل المتصفح يحدد حالة الدفع `paid` بنفسه.

## البناء

```bash
npm run build
```
