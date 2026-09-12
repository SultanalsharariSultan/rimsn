# Structure: أفق السُرى

- `client/src/App.tsx` — مسار اللعبة الوحيد.
- `client/src/components/GameCanvas.tsx` — إطار React، canvas Babylon، وHUD العربي؛ لا يحتوي قواعد العالم.
- `client/src/game/scene.ts` — مدخل إنشاء المشهد، العالم الإجرائي، المركبة، الإدخال، المهمة، التحديث ودورة الليل/النهار.
- `client/src/index.css` — نظام التصميم للـHUD وشاشة البداية.
- `PLAN.md` — المخاطر ومعايير التحقق.
- `ASSETS.md` — سجل الأصول المولدة وروابط التخزين.
- `MEMORY.md` — قرارات التنفيذ والملاحظات.

## Ownership

`scene.ts` يملك `Scene` و`FreeCamera` ومواد Babylon. المركبة تملك عقدها الإجرائية وحالتها، بينما حلقة التحديث تملك قواعد العالم والمهمة. React يملك فقط حالة العرض التي تصل إليه عبر `CustomEvent('ow:update')`; لا توجد تبعية من كود اللعب إلى React.

## Runtime contract

`createGameScene(engine, canvas)` ينشئ مشهدًا جديدًا ويعيد `{ scene, dispose() }`. كل مستمع DOM يضاف في الدالة يزال في `dispose()`. مقياس canvas وإعادة التحجيم مملوكان لـ`GameCanvas`.
