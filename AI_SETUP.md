# إعداد مدار AI على الاستضافة

يعمل التطبيق في بيئة WebDev الحالية عبر المزود المدمج `مدار تلقائي`. عند نقل المشروع إلى استضافة خارجية، أضف المفاتيح في قسم **Secrets / Environment Variables** في الخادم، وليس في ملفات الواجهة.

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5-mini
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-6
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-3-flash-preview
```

تستخدم الطبقة الخلفية المتغير المناسب حسب المزود المختار. إذا لم يوجد مفتاح خارجي وكان `BUILT_IN_FORGE_API_KEY` متاحًا، يعود التطبيق تلقائيًا إلى المزود المدمج. لا يتم إرسال أي مفتاح إلى المتصفح.

يتطلب تشغيل المحادثات المحفوظة أيضًا `DATABASE_URL` وقيم المصادقة التي يوفرها قالب WebDev (`JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`). بعد إضافة المتغيرات أعد تشغيل الخدمة أو نفّذ Redeploy.
