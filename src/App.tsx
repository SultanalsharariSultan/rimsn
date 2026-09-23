import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './lib/supabase';

type Product = {
  id: string;
  slug: string;
  title: string;
  category: string;
  price: number;
  original_price: number | null;
  rating: number;
  reviews: number;
  image_url: string;
  description: string;
  short_description: string;
  tags: string[];
  features: string[];
  badge: string | null;
  file_size: string;
  format: string;
  level: string;
  storage_path: string;
};

type CartItem = { id: string; qty: number };
type Profile = { full_name: string | null; email: string | null };

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);

const usePageMeta = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [title, description]);
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !user) {
      setProfile(null);
      return;
    }
    void supabase.from('profiles').select('full_name,email').eq('id', user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);

  return (
    <BrowserRouter>
      <div className="site-shell">
        <Header user={user} profile={profile} />
        <main className="page-wrap">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductDetailPage user={user} />} />
            <Route path="/cart" element={<CartPage user={user} />} />
            <Route path="/checkout" element={<CheckoutPage user={user} />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<DashboardPage user={user} profile={profile} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header({ user, profile }: { user: User | null; profile: Profile | null }) {
  const [cartCount, setCartCount] = useState(0);
  useEffect(() => {
    const update = () => setCartCount(JSON.parse(localStorage.getItem('rimsn_cart') ?? '[]').reduce((sum: number, item: CartItem) => sum + item.qty, 0));
    update();
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  return (
    <header className="topbar glass-panel">
      <Link to="/" className="brand-mark">رِمْسَن</Link>
      <nav className="nav-menu" aria-label="التنقل الرئيسي">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>الرئيسية</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>المنتجات</NavLink>
        {user ? <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>لوحة التحكم</NavLink> : null}
      </nav>
      <div className="topbar-actions">
        <Link to={user ? '/dashboard' : '/auth'} className="ghost-btn small-btn">
          {user ? profile?.full_name || user.email : 'تسجيل الدخول'}
        </Link>
        <Link to="/cart" className="cart-pill"><span>السلة</span><strong>{cartCount}</strong></Link>
      </div>
    </header>
  );
}

function Footer() {
  return <footer className="footer glass-panel"><div><strong>رِمْسَن</strong><p>متجر المنتجات الرقمية العربي.</p></div><div className="footer-links"><Link to="/products">المنتجات</Link><Link to="/auth">الحساب</Link><Link to="/dashboard">مشترياتي</Link></div></footer>;
}

function ConfigNotice() {
  return <div className="empty-panel glass-panel error-panel"><h3>المتجر يحتاج إعداد قاعدة البيانات</h3><p>أضف VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في Vercel ثم نفّذ ملف supabase/schema.sql.</p><Link className="btn primary" to="/products">تصفح الواجهة</Link></div>;
}

function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const load = () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    void supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false })
      .then(({ data, error: queryError }) => { setProducts((data as Product[]) ?? []); setError(queryError?.message ?? null); setLoading(false); });
  };
  useEffect(load, []);
  return { products, loading, error, retry: load };
}

function HomePage() {
  usePageMeta('رِمْسَن | متجر المنتجات الرقمية', 'متجر عربي لبيع المنتجات الرقمية.');
  const { products, loading, error, retry } = useProducts();
  return <><section className="hero glass-panel"><div className="hero-copy"><span className="eyebrow">متجر رقمي عربي متكامل</span><h1>منتجات رقمية تصنع فرقًا حقيقيًا في مشروعك.</h1><p>تصفح منتجاتك، ادفع بأمان، وحمّل مشترياتك من حسابك في أي وقت.</p><div className="hero-actions"><Link to="/products" className="btn primary">تصفح المنتجات</Link><Link to="/auth" className="btn secondary">إنشاء حساب</Link></div></div><div className="hero-visual"><div className="hero-card glass-panel"><div className="chart-box"><div className="chart-bar" style={{ height: '30%' }} /><div className="chart-bar" style={{ height: '55%' }} /><div className="chart-bar" style={{ height: '80%' }} /><div className="chart-bar" style={{ height: '98%' }} /></div><div className="sale-pill">تحميل آمن بعد الشراء</div></div></div></section><section className="section-block"><div className="section-heading"><div><span className="eyebrow">منتجات المتجر</span><h2>أحدث المنتجات</h2></div><Link to="/products" className="inline-link">عرض الكل</Link></div><ProductResult products={products.slice(0, 3)} loading={loading} error={error} retry={retry} /></section></>;
}

function ProductsPage() {
  usePageMeta('منتجات رِمْسَن', 'تصفح المنتجات الرقمية المتاحة للشراء.');
  const { products, loading, error, retry } = useProducts();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('الكل');
  const categories = useMemo(() => ['الكل', ...Array.from(new Set(products.map((item) => item.category)))], [products]);
  const filtered = products.filter((item) => (category === 'الكل' || item.category === category) && (!search || `${item.title} ${item.category} ${item.tags.join(' ')}`.toLowerCase().includes(search.toLowerCase())));
  return <section className="section-block"><div className="section-heading"><div><span className="eyebrow">المكتبة</span><h2>منتجات رقمية</h2></div></div><div className="toolbar glass-panel"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث عن منتج..." /><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></div><ProductResult products={filtered} loading={loading} error={error} retry={retry} /></section>;
}

function ProductResult({ products, loading, error, retry }: { products: Product[]; loading: boolean; error: string | null; retry: () => void }) {
  if (!isSupabaseConfigured) return <ConfigNotice />;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="تعذر تحميل المنتجات من قاعدة البيانات." onRetry={retry} />;
  if (!products.length) return <EmptyState />;
  return <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}

function ProductCard({ product }: { product: Product }) {
  const add = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem('rimsn_cart') ?? '[]');
    const existing = cart.find((item) => item.id === product.id);
    localStorage.setItem('rimsn_cart', JSON.stringify(existing ? cart.map((item) => item.id === product.id ? { ...item, qty: Math.min(item.qty + 1, 10) } : item) : [...cart, { id: product.id, qty: 1 }]));
    window.dispatchEvent(new Event('storage'));
  };
  return <article className="product-card glass-panel"><div className="product-image-wrap"><img src={product.image_url} alt={product.title} className="product-image" />{product.badge ? <span className="product-badge">{product.badge}</span> : null}</div><div className="product-info"><div className="product-meta"><span>{product.category}</span><span>{product.rating} ★ ({product.reviews})</span></div><h3>{product.title}</h3><p>{product.short_description}</p><div className="tag-list">{product.tags?.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="price-row"><strong>{formatPrice(product.price)}</strong><button className="btn primary small" onClick={add}>أضف للسلة</button></div><Link to={`/product/${product.id}`} className="inline-link">عرض التفاصيل</Link></div></article>;
}

function ProductDetailPage({ user }: { user: User | null }) {
  const { id } = useParams();
  const { products, loading, error, retry } = useProducts();
  const product = products.find((item) => item.id === id);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="تعذر تحميل المنتج." onRetry={retry} />;
  if (!product) return <EmptyState />;
  usePageMeta(product.title, product.description);
  return <section className="section-block product-detail"><div className="product-detail-grid"><div className="glass-panel detail-visual"><img src={product.image_url} alt={product.title} /></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.title}</h1><div className="detail-meta"><span>⭐ {product.rating} ({product.reviews})</span><span>{product.format}</span><span>{product.file_size}</span></div><p>{product.description}</p><ul className="feature-list">{product.features?.map((feature) => <li key={feature}>{feature}</li>)}</ul><div className="price-panel"><strong>{formatPrice(product.price)}</strong><span className="level-badge">{product.level}</span></div><button className="btn primary" onClick={() => { const cart: CartItem[] = JSON.parse(localStorage.getItem('rimsn_cart') ?? '[]'); localStorage.setItem('rimsn_cart', JSON.stringify([...cart, { id: product.id, qty: 1 }])); window.dispatchEvent(new Event('storage')); }}>أضف إلى السلة</button>{user ? null : <p className="form-hint">ستحتاج إلى إنشاء حساب عند إتمام الشراء.</p>}</div></div></section>;
}

function CartPage({ user }: { user: User | null }) {
  const [items, setItems] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('rimsn_cart') ?? '[]'));
  const { products, loading } = useProducts();
  const update = (next: CartItem[]) => { setItems(next); localStorage.setItem('rimsn_cart', JSON.stringify(next)); window.dispatchEvent(new Event('storage')); };
  const rows = items.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const total = rows.reduce((sum, row) => sum + (row.product?.price ?? 0) * row.qty, 0);
  if (loading) return <LoadingState />;
  if (!rows.length) return <EmptyCartState />;
  return <section className="section-block checkout-shell"><div className="checkout-grid"><div className="glass-panel checkout-list">{rows.map((row) => <div className="cart-item-row" key={row.id}><img src={row.product?.image_url} alt={row.product?.title} /><div><h3>{row.product?.title}</h3><p>{row.product?.category}</p></div><div className="qty-box"><button onClick={() => update(items.map((item) => item.id === row.id ? { ...item, qty: item.qty - 1 } : item).filter((item) => item.qty > 0))}>-</button><span>{row.qty}</span><button onClick={() => update(items.map((item) => item.id === row.id ? { ...item, qty: item.qty + 1 } : item))}>+</button></div><strong>{formatPrice((row.product?.price ?? 0) * row.qty)}</strong></div>)}</div><aside className="glass-panel summary-panel"><h3>ملخص الطلب</h3><div className="summary-row total-row"><span>الإجمالي</span><strong>{formatPrice(total)}</strong></div>{user ? <Link to="/checkout" className="btn primary block-btn">متابعة للدفع</Link> : <Link to="/auth?redirect=checkout" className="btn primary block-btn">سجّل الدخول للشراء</Link>}</aside></div></section>;
}

function CheckoutPage({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const [items] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem('rimsn_cart') ?? '[]'));
  const { products, loading } = useProducts();
  const [busy, setBusy] = useState(false);
  const rows = items.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product);
  const total = rows.reduce((sum, row) => sum + (row.product?.price ?? 0) * row.qty, 0);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !user) { navigate('/auth?redirect=checkout'); return; }
    setBusy(true);
    const { data: order, error } = await supabase.from('orders').insert({ user_id: user.id, total, status: 'paid' }).select('id').single();
    if (!error && order) {
      await supabase.from('order_items').insert(rows.map((row) => ({ order_id: order.id, product_id: row.id, quantity: row.qty, unit_price: row.product?.price })));
      localStorage.removeItem('rimsn_cart');
      navigate('/dashboard');
    }
    setBusy(false);
  };
  if (!user) return <AuthRequired />;
  if (loading) return <LoadingState />;
  if (!rows.length) return <EmptyCartState />;
  return <section className="section-block checkout-shell"><div className="checkout-grid"><form className="glass-panel checkout-form" onSubmit={submit}><h2>إتمام الطلب</h2><p>هذه عملية دفع تجريبية. اربط Stripe أو Tap مكان هذا النموذج لاحقًا.</p><label>الاسم<input required defaultValue={user.user_metadata.full_name ?? ''} /></label><label>البريد الإلكتروني<input required type="email" defaultValue={user.email ?? ''} /></label><label>رقم الهاتف<input required /></label><button disabled={busy} className="btn primary block-btn">{busy ? 'جارٍ إنشاء الطلب...' : 'تأكيد الشراء التجريبي'}</button></form><aside className="glass-panel summary-panel"><h3>الإجمالي</h3><div className="summary-row total-row"><span>المبلغ</span><strong>{formatPrice(total)}</strong></div></aside></div></section>;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) { setMessage('أضف إعدادات Supabase أولًا.'); return; }
    setMessage('');
    if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth` });
      setMessage(error?.message ?? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك.');
      return;
    }
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (result.error) setMessage(result.error.message);
    else { setMessage(mode === 'register' ? 'تحقق من بريدك الإلكتروني لتفعيل الحساب.' : 'تم تسجيل الدخول.'); navigate('/dashboard'); }
  };
  return <section className="auth-wrap section-block"><div className="glass-panel auth-card"><div className="auth-tabs">{(['login', 'register', 'forgot'] as const).map((item) => <button key={item} type="button" className={mode === item ? 'tab active' : 'tab'} onClick={() => setMode(item)}>{item === 'login' ? 'تسجيل الدخول' : item === 'register' ? 'إنشاء حساب' : 'نسيت كلمة المرور'}</button>)}</div><form className="auth-form" onSubmit={submit}>{mode === 'register' ? <label>الاسم الكامل<input required value={name} onChange={(event) => setName(event.target.value)} /></label> : null}<label>البريد الإلكتروني<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>{mode !== 'forgot' ? <label>كلمة المرور<input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label> : null}<button className="btn primary block-btn">{mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء الحساب' : 'إرسال رابط الاستعادة'}</button>{message ? <p className="form-hint">{message}</p> : null}</form></div></section>;
}

function DashboardPage({ user, profile }: { user: User | null; profile: Profile | null }) {
  const [orders, setOrders] = useState<Array<{ id: string; total: number; created_at: string; order_items: Array<{ product: Product; quantity: number }> }>>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  usePageMeta('لوحة التحكم', 'مشتريات وتنزيلات العميل.');
  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return; }
    void supabase.from('orders').select('id,total,created_at,order_items(quantity,product:products(*))').eq('user_id', user.id).eq('status', 'paid').order('created_at', { ascending: false }).then(({ data }) => { setOrders((data as unknown as typeof orders) ?? []); setLoading(false); });
  }, [user]);
  const download = async (product: Product) => {
    if (!supabase || !user) return;
    const { data } = await supabase.storage.from('digital-products').createSignedUrl(product.storage_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    else setMessage('تعذر إنشاء رابط التحميل. تأكد من رفع الملف داخل التخزين.');
  };
  if (!user) return <AuthRequired />;
  if (loading) return <LoadingState />;
  const products = orders.flatMap((order) => order.order_items.map((item) => item.product)).filter(Boolean);
  return <section className="section-block dashboard-shell"><div className="dashboard-head glass-panel"><div><span className="eyebrow">حساب العميل</span><h2>{profile?.full_name || user.email}</h2><p>{user.email}</p></div><button className="btn secondary" onClick={() => void supabase?.auth.signOut()}>تسجيل الخروج</button></div><div className="dashboard-stats"><div className="glass-panel stat-card"><span>الطلبات المدفوعة</span><strong>{orders.length}</strong></div><div className="glass-panel stat-card"><span>المنتجات المملوكة</span><strong>{products.length}</strong></div><div className="glass-panel stat-card"><span>التحميل</span><strong>مؤمّن</strong></div></div><div className="glass-panel dashboard-list"><h3>مشترياتي والتنزيلات</h3>{message ? <p className="form-hint">{message}</p> : null}{products.length ? products.map((product) => <div className="dashboard-item" key={product.id}><div><h4>{product.title}</h4><small>{product.category}</small></div><button className="btn secondary small" onClick={() => void download(product)}>تحميل المنتج</button></div>) : <EmptyState compact />}</div></section>;
}

function AuthRequired() { return <div className="empty-panel glass-panel"><h3>سجّل الدخول أولًا</h3><p>أنشئ حسابًا أو سجّل الدخول حتى تشتري وتحصل على ملفاتك.</p><Link to="/auth" className="btn primary">الدخول للحساب</Link></div>; }
function LoadingState() { return <div className="loading-grid">{[1, 2, 3].map((item) => <div className="skeleton-card glass-panel" key={item} />)}</div>; }
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <div className="empty-panel glass-panel error-panel"><h3>حدث خطأ</h3><p>{message}</p><button className="btn primary" onClick={onRetry}>إعادة المحاولة</button></div>; }
function EmptyState({ compact = false }: { compact?: boolean }) { return <div className={compact ? 'empty-panel compact glass-panel' : 'empty-panel glass-panel'}><h3>لا توجد منتجات منشورة</h3><p>أضف أول منتج من لوحة Supabase ثم سيظهر هنا تلقائيًا.</p><Link to="/auth" className="btn secondary">دخول الإدارة</Link></div>; }
function EmptyCartState() { return <div className="empty-panel glass-panel"><h3>سلة المشتريات فارغة</h3><p>أضف منتجًا من المتجر للمتابعة.</p><Link to="/products" className="btn primary">تصفح المنتجات</Link></div>; }

export default App;
