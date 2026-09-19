(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const toast = $('.toast');
  let toastTimer;
  const showToast = message => { if (!toast) return; toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2800); };

  const products = $$('.product-card').map((card, index) => ({
    id: card.querySelector('h3')?.textContent.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi, '-') || `product-${index}`,
    name: card.querySelector('h3')?.textContent.trim() || 'منتج رقمي',
    description: card.querySelector('p')?.textContent.trim() || 'منتج رقمي احترافي للمبدعين.',
    price: Number((card.querySelector('.product-info strong')?.textContent || '0').replace(/[^0-9.]/g, '')),
    category: card.dataset.category || 'all',
    art: [...(card.querySelector('.product-art')?.classList || [])].find(c => c.startsWith('art-')) || 'art-one',
    card
  }));
  let cart = read('rimsn_cart', []);
  let favorites = read('rimsn_favorites', []);
  const persist = () => { write('rimsn_cart', cart); updateCartCount(); };
  const updateCartCount = () => { const badge = $('.cart-count'); if (!badge) return; const count = cart.reduce((n, item) => n + item.quantity, 0); badge.textContent = count; badge.style.display = count ? 'flex' : 'none'; };
  const total = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const style = document.createElement('style');
  style.textContent = `.dynamic-drawer,.product-modal,.mobile-menu{position:fixed;inset:0;z-index:35;background:#03050ccc;backdrop-filter:blur(12px);display:none}.dynamic-drawer.open,.product-modal.open,.mobile-menu.open{display:block}.dynamic-panel{position:absolute;inset-block:0;left:0;width:min(440px,100%);background:#111625;border-right:1px solid var(--line);padding:26px;overflow:auto;box-shadow:20px 0 80px #0008}.dynamic-head{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line);padding-bottom:18px}.dynamic-head h2{margin:0;font-size:24px}.close-dynamic,.fav-button{border:0;background:none;color:var(--muted);font-size:26px}.cart-row{display:grid;grid-template-columns:56px 1fr auto;gap:12px;align-items:center;padding:15px 0;border-bottom:1px solid var(--line)}.cart-row .product-art{height:56px;border-radius:9px}.cart-row h3{font-size:13px;margin:0}.cart-row small{color:var(--muted)}.cart-row strong{font:600 14px 'Space Grotesk'}.qty{display:flex;gap:7px;align-items:center;margin-top:6px}.qty button{width:23px;height:23px;border:1px solid var(--line);border-radius:5px;background:none;color:var(--text)}.dynamic-total{display:flex;justify-content:space-between;margin:24px 0;font-size:18px}.dynamic-panel .button{width:100%}.product-modal{place-items:center;padding:20px}.product-modal.open{display:grid}.product-modal .dynamic-panel{position:relative;inset:auto;left:auto;width:min(700px,100%);max-height:90vh;border:1px solid var(--line);border-radius:22px}.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:center}.detail-art{height:260px;border-radius:15px}.detail-copy h2{font-size:31px;margin:0 0 8px}.detail-copy p{color:var(--muted)}.favorite{position:absolute;top:12px;left:12px;border:1px solid #fff3;background:#0b1020aa;color:#fff;border-radius:50%;width:34px;height:34px}.product-card{position:relative}.product-card .favorite{opacity:0;transition:.2s}.product-card:hover .favorite,.product-card .favorite.active{opacity:1}.favorite.active{color:var(--orange);border-color:var(--orange)}.mobile-menu{padding:88px 24px}.mobile-menu nav{display:grid;gap:18px;font-size:22px}.mobile-menu a{padding:12px 0;border-bottom:1px solid var(--line)}.newsletter{display:flex;gap:8px;margin-top:18px}.newsletter input{min-width:0;flex:1;padding:11px;border:1px solid var(--line);border-radius:9px;background:#ffffff08;color:var(--text)}@media(max-width:600px){.detail-grid{grid-template-columns:1fr}.detail-art{height:190px}}`;
  document.head.appendChild(style);

  const make = (tag, className, html = '') => { const el = document.createElement(tag); if (className) el.className = className; el.innerHTML = html; return el; };
  function renderCards() {
    products.forEach(product => {
      if (product.card.querySelector('.favorite')) return;
      const favorite = make('button', `favorite ${favorites.includes(product.id) ? 'active' : ''}`, favorites.includes(product.id) ? '♥' : '♡');
      favorite.setAttribute('aria-label', 'إضافة للمفضلة'); favorite.addEventListener('click', e => { e.stopPropagation(); toggleFavorite(product, favorite); }); product.card.appendChild(favorite);
      product.card.addEventListener('click', e => { if (!e.target.closest('.add-cart') && !e.target.closest('.favorite')) openProduct(product); });
    });
  }
  function toggleFavorite(product, button) { favorites = favorites.includes(product.id) ? favorites.filter(id => id !== product.id) : [...favorites, product.id]; write('rimsn_favorites', favorites); button.classList.toggle('active', favorites.includes(product.id)); button.textContent = favorites.includes(product.id) ? '♥' : '♡'; showToast(favorites.includes(product.id) ? 'تمت إضافة المنتج إلى المفضلة' : 'تمت إزالة المنتج من المفضلة'); }
  function openProduct(product) { const modal = make('div', 'product-modal open'); modal.innerHTML = `<section class="dynamic-panel"><button class="close-dynamic" aria-label="إغلاق">×</button><div class="detail-grid"><div class="product-art detail-art ${product.art}"></div><div class="detail-copy"><p class="kicker">منتج رقمي مختار</p><h2>${product.name}</h2><p>${product.description}. صُمم بعناية ليساعدك على بناء تجربة أسرع وأكثر تميزاً.</p><strong class="detail-price">$${product.price.toFixed(2)}</strong><button class="button button-primary detail-add">أضف إلى السلة <span>+</span></button></div></div></section>`; document.body.appendChild(modal); const close = () => modal.remove(); modal.addEventListener('click', e => { if (e.target === modal || e.target.closest('.close-dynamic')) close(); }); modal.querySelector('.detail-add').addEventListener('click', () => { addToCart(product); close(); }); }

  function buildCart() { const drawer = make('div', 'dynamic-drawer', `<aside class="dynamic-panel"><div class="dynamic-head"><h2>سلة المنتجات</h2><button class="close-dynamic" aria-label="إغلاق">×</button></div><div class="cart-list"></div><div class="dynamic-total"><span>الإجمالي</span><strong>$0.00</strong></div><button class="button button-primary checkout">إتمام الطلب <span>↗</span></button></aside>`); document.body.appendChild(drawer); drawer.addEventListener('click', e => { if (e.target === drawer || e.target.closest('.close-dynamic')) drawer.classList.remove('open'); }); drawer.querySelector('.checkout').addEventListener('click', () => showToast('السلة جاهزة — أضف بوابة الدفع عند الإطلاق')); return drawer; }
  const drawer = buildCart();
  function renderCart() { const list = $('.cart-list', drawer); list.innerHTML = cart.length ? cart.map(item => `<div class="cart-row"><div class="product-art ${item.art}"></div><div><h3>${item.name}</h3><small>$${item.price.toFixed(2)}</small><div class="qty"><button data-action="minus" data-id="${item.id}">−</button><span>${item.quantity}</span><button data-action="plus" data-id="${item.id}">+</button><button data-action="remove" data-id="${item.id}">×</button></div></div><strong>$${(item.price * item.quantity).toFixed(2)}</strong></div>`).join('') : '<p class="cart-empty">سلتك فارغة. أضف أول منتج رقمي لك ✦</p>'; $('.dynamic-total strong', drawer).textContent = `$${total().toFixed(2)}`; $$('.qty button', drawer).forEach(button => button.addEventListener('click', () => { const item = cart.find(x => x.id === button.dataset.id); if (button.dataset.action === 'remove') cart = cart.filter(x => x.id !== button.dataset.id); else if (item) item.quantity += button.dataset.action === 'plus' ? 1 : -1; cart = cart.filter(x => x.quantity > 0); persist(); renderCart(); })); }
  function addToCart(product) { const item = cart.find(x => x.id === product.id); if (item) item.quantity += 1; else cart.push({ id: product.id, name: product.name, price: product.price, art: product.art, quantity: 1 }); persist(); renderCart(); showToast('تمت إضافة المنتج إلى سلتك'); }
  $$('.add-cart').forEach((button, index) => button.addEventListener('click', e => { e.stopPropagation(); addToCart(products[index]); button.textContent = 'تمت الإضافة ✓'; }));
  $('.cart-button')?.addEventListener('click', () => { renderCart(); drawer.classList.add('open'); });
  updateCartCount(); renderCards(); renderCart();

  // Filters and instant search.
  $$('.pill').forEach(pill => pill.addEventListener('click', () => { $$('.pill').forEach(x => x.classList.remove('active')); pill.classList.add('active'); products.forEach(p => p.card.classList.toggle('hidden', pill.dataset.filter !== 'all' && p.category !== pill.dataset.filter)); }));
  const heading = $('.section-heading'); if (heading && !$('.product-search')) { const search = make('input', 'search-input product-search'); search.placeholder = 'ابحث عن منتج...'; search.setAttribute('aria-label', 'البحث عن منتج'); heading.appendChild(search); search.addEventListener('input', () => { const q = search.value.trim().toLowerCase(); products.forEach(p => p.card.classList.toggle('hidden', q && !`${p.name} ${p.description}`.toLowerCase().includes(q))); }); }
  $('.menu-button')?.addEventListener('click', () => { const menu = make('div', 'mobile-menu open', '<nav><a href="#explore">استكشف المنتجات</a><a href="#categories">التصنيفات</a><a href="#how-it-works">كيف يعمل RIMSN؟</a><a href="#creators">ابدأ البيع</a></nav>'); document.body.appendChild(menu); menu.addEventListener('click', e => { if (e.target === menu || e.target.tagName === 'A') menu.remove(); }); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { drawer.classList.remove('open'); $$('.product-modal.open,.mobile-menu.open').forEach(x => x.remove()); } });

  // Account flow: local state is intentionally limited to UI continuity; replace with a real Auth provider before launch.
  const authModal = $('#authModal'), form = $('#authForm'), success = $('#authSuccess'); let mode = 'login';
  function setMode(next) { mode = next; $$('[data-mode]').forEach(x => x.classList.toggle('selected', x.dataset.mode === mode)); const signup = mode === 'signup'; $('#nameField').style.display = signup ? 'block' : 'none'; $('#nameField input').required = signup; $('#authTitle').textContent = signup ? 'اصنع حسابك.' : 'أهلاً بعودتك.'; $('#authSubtitle').textContent = signup ? 'ابدأ ببناء مستقبلك الرقمي.' : 'سجّل الدخول لتكمل رحلتك.'; $('.submit-auth').innerHTML = signup ? 'إنشاء الحساب <span>↗</span>' : 'تسجيل الدخول <span>↗</span>'; }
  function openAuth(next = 'login') { authModal.classList.add('open'); authModal.setAttribute('aria-hidden', 'false'); setMode(next); setTimeout(() => form.email.focus(), 50); }
  function closeAuth() { authModal.classList.remove('open'); authModal.setAttribute('aria-hidden', 'true'); form.reset(); form.hidden = false; success.hidden = true; $('.forgot-link').hidden = false; }
  $$('[data-auth]').forEach(button => button.addEventListener('click', e => { e.preventDefault(); openAuth(button.dataset.auth); }));
  $$('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode))); $('.modal-close')?.addEventListener('click', closeAuth); authModal?.addEventListener('click', e => { if (e.target === authModal) closeAuth(); });
  form?.addEventListener('submit', e => { e.preventDefault(); const data = Object.fromEntries(new FormData(form)); const users = read('rimsn_users', []); if (mode === 'signup') { if (users.some(u => u.email === data.email)) return showToast('هذا البريد مسجل بالفعل'); users.push({ name: data.name, email: data.email, password: data.password }); write('rimsn_users', users); write('rimsn_session', { name: data.name, email: data.email }); } else { const user = users.find(u => u.email === data.email && u.password === data.password); if (!user) return showToast('بيانات الدخول غير صحيحة'); write('rimsn_session', { name: user.name, email: user.email }); } form.hidden = true; $('.forgot-link').hidden = true; success.textContent = mode === 'signup' ? 'تم إنشاء حسابك بنجاح.' : 'تم تسجيل الدخول بنجاح.'; success.hidden = false; setTimeout(closeAuth, 1800); });
  $('#forgotPassword')?.addEventListener('click', () => showToast('اربط مزود البريد لإرسال رابط الاستعادة عند الإطلاق'));
  $('#languageButton')?.addEventListener('click', () => showToast('النسخة الإنجليزية قيد الإعداد')); updateCartCount();
})();
