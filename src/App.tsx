import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';

type Product = {
  id: number;
  slug: string;
  title: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  sku: string;
  image: string;
  description: string;
  shortDescription: string;
  tags: string[];
  features: string[];
  badge: string;
  fileSize: string;
  format: string;
  level: string;
  isPopular: boolean;
  isNew: boolean;
};

type CartItem = {
  id: number;
  qty: number;
};

type UserProfile = {
  name: string;
  email: string;
  purchased: number[];
  downloads: number[];
};

type CheckoutForm = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const products: Product[] = [
  {
    id: 1,
    slug: 'bundle-growth',
    title: 'باندل نمو متجر عربي',
    category: 'التسويق',
    price: 299,
    originalPrice: 499,
    rating: 4.9,
    reviews: 1280,
    sku: 'DIG-001',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
    description:
      'خطة تسويقية متكاملة لرفع المبيعات بتصميم متجر عربي احترافي، مع محتوى متجر، استهداف، وأداء إعلاني جاهز للمنصات الرقمية.',
    shortDescription: 'قوالب تسويق وتحليل، جاهز لتسريع نمو المتجر العربي.',
    tags: ['تسويق', 'تحليل', 'قوالب'],
    features: ['خطة محتوى شهرية', 'أسئلة متكررة', 'لوحات مؤشرات', 'ملفات قابلة للتعديل'],
    badge: 'الأكثر طلبًا',
    fileSize: '18 MB',
    format: 'ZIP',
    level: 'متوسط',
    isPopular: true,
    isNew: false,
  },
  {
    id: 2,
    slug: 'ai-automation-kit',
    title: 'مجموعة أتمتة الذكاء الاصطناعي',
    category: 'الذكاء الاصطناعي',
    price: 429,
    originalPrice: 599,
    rating: 4.8,
    reviews: 910,
    sku: 'AI-017',
    image:
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=900&q=80',
    description:
      'مكتبة عملية لإعداد أسئلة الذكاء الاصطناعي، نصوص التفاعل، وأتمتة خدمة العملاء داخل متجر عربي مع صياغة احترافية وقابلة للتخصيص.',
    shortDescription: 'أدوات ذكية لتقليل الوقت وتحسين خدمة العملاء.',
    tags: ['AI', 'أتمتة', 'خدمة العملاء'],
    features: ['محادثات جاهزة', 'سيناريوهات مخصصة', 'قوالب ردود', 'مخططات سير العمل'],
    badge: 'جديد',
    fileSize: '24 MB',
    format: 'PDF + ZIP',
    level: 'متقدم',
    isPopular: false,
    isNew: true,
  },
  {
    id: 3,
    slug: 'ux-ui-system',
    title: 'نظام تجربة مستخدم عربي',
    category: 'التصميم',
    price: 349,
    originalPrice: 520,
    rating: 5,
    reviews: 1510,
    sku: 'UX-043',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    description:
      'مجموعة من ملفات واجهة المستخدم، أنماط ألوان عربية، وباوربوينت تصميم شامل يضمن تجربة مستخدم متقدمة ومتناسقة عبر كل صفحة.',
    shortDescription: 'إطار تصميم احترافي للمتاجر الرقمية العربية.',
    tags: ['UI/UX', 'تصميم', 'واجهة'],
    features: ['أيقونات جاهزة', 'قوالب صفحات', 'لوحات ألوان', 'مكتبة مكونات'],
    badge: 'أفضل قيمة',
    fileSize: '12 MB',
    format: 'FIG + PNG',
    level: 'مبتدئ',
    isPopular: true,
    isNew: false,
  },
  {
    id: 4,
    slug: 'backend-setup-kit',
    title: 'حزمة إعداد متجر احترافي',
    category: 'البرمجة',
    price: 489,
    originalPrice: 680,
    rating: 4.7,
    reviews: 840,
    sku: 'DEV-090',
    image:
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
    description:
      'منظومة برمجية عملية تبني متجر احترافي مع الراحة للمطورين: بنية مشاريع، إعداد قاعدة بيانات، Next.js، وأدوات عمل متقدمة.',
    shortDescription: 'قوالب تقنية ومتقدمة للتنفيذ السريع للمشاريع.',
    tags: ['برمجة', 'تطوير', 'تكويد'],
    features: ['هيكل مشروع', 'قوالب API', 'تكويد قاعدة', 'ملفات تكوين'],
    badge: 'مميز',
    fileSize: '40 MB',
    format: 'ZIP',
    level: 'متقدم',
    isPopular: false,
    isNew: true,
  },
  {
    id: 5,
    slug: 'brand-playbook',
    title: 'دليل الهوية التجارية',
    category: 'الأعمال',
    price: 259,
    originalPrice: 420,
    rating: 4.9,
    reviews: 730,
    sku: 'BR-220',
    image:
      'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80',
    description:
      'حزمة كاملة لوضع هوية متجر عربي، من الشعار إلى الرسائل التسويقية، مع توظيف أسلوب احترافي موجه للسوق العربي.',
    shortDescription: 'هوية متجر مبنية على احترافية ومصداقية.',
    tags: ['هوية', 'علامة تجارية', 'استراتيجية'],
    features: ['هوية نصية', 'قوالب منشورات', 'رسائل', 'توجيه بصري'],
    badge: 'شائع',
    fileSize: '9 MB',
    format: 'PDF',
    level: 'مبتدئ',
    isPopular: true,
    isNew: false,
  },
  {
    id: 6,
    slug: 'ecommerce-growth',
    title: 'دليل نمو المتاجر الرقمية',
    category: 'الاستراتيجية',
    price: 379,
    originalPrice: 550,
    rating: 4.8,
    reviews: 680,
    sku: 'STR-304',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    description:
      'خطة تنفيذية لزيادة التحويلات، تحسين السلة، وتحليل الأداء مع توجيهات اقتصادية قوية للمتاجر العربية.',
    shortDescription: 'خطط عملية لتحسين الربحية والتسويق واستراتيجيات البيع.',
    tags: ['نمو', 'استراتيجية', 'تحويلات'],
    features: ['مؤشرات KPI', 'خطة نمو', 'تحليل سلة', 'استراتيجيات حجز'],
    badge: 'استراتيجي',
    fileSize: '14 MB',
    format: 'PDF + XLSX',
    level: 'متوسط',
    isPopular: false,
    isNew: false,
  },
];

const categories = ['الكل', ...Array.from(new Set(products.map((product) => product.category)))];

const formatPrice = (value: number) =>
  new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);

const usePageMeta = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }, [title, description]);
};

function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'سارة علي',
    email: 'sara@rimsn.store',
    purchased: [1, 3],
    downloads: [1],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!products.length) {
        setLoadError('تعذر تحميل المنتجات في هذه اللحظة. يرجى المحاولة لاحقًا.');
      }
      setIsLoading(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, []);

  const productMap = useMemo(() => Object.fromEntries(products.map((product) => [product.id, product])), []);

  const addToCart = (productId: number) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.id === productId);
      if (!existing) {
        return [...previous, { id: productId, qty: 1 }];
      }
      return previous.map((item) =>
        item.id === productId ? { ...item, qty: Math.min(item.qty + 1, 10) } : item,
      );
    });
  };

  const updateCartQuantity = (productId: number, nextQty: number) => {
    setCart((previous) => {
      if (nextQty <= 0) {
        return previous.filter((item) => item.id !== productId);
      }
      return previous.map((item) => (item.id === productId ? { ...item, qty: nextQty } : item));
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((previous) => previous.filter((item) => item.id !== productId));
  };

  const cartItems = cart.map((item) => ({ ...item, product: productMap[item.id] }));
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const isUserOwnerOf = (productId: number) => currentUser.purchased.includes(productId);

  const downloadProduct = (productId: number) => {
    const product = productMap[productId];
    if (!product || !isUserOwnerOf(productId)) return;

    const content = `اسم المنتج: ${product.title}\nنوع الملف: ${product.format}\nالحجم: ${product.fileSize}\n\nهذا ملف تجريبي تم إنشاؤه للتجربة فقط، جاهز للربط بنظام تخزين حقيقي لاحقًا.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${product.slug}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);

    setCurrentUser((previous) => ({
      ...previous,
      downloads: previous.downloads.includes(productId) ? previous.downloads : [...previous.downloads, productId],
    }));
  };

  const purchaseProducts = (productIds: number[]) => {
    setCurrentUser((previous) => ({
      ...previous,
      purchased: Array.from(new Set([...previous.purchased, ...productIds])),
      downloads: Array.from(new Set([...previous.downloads, ...productIds])),
    }));
  };

  return (
    <BrowserRouter>
      <div className="site-shell">
        <Header cartCount={totalItems} currentUser={currentUser} />
        <main className="page-wrap">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  products={products}
                  addToCart={addToCart}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRetry={() => {
                    setLoadError(null);
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 650);
                  }}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  products={products}
                  addToCart={addToCart}
                  isLoading={isLoading}
                  loadError={loadError}
                  onRetry={() => {
                    setLoadError(null);
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 650);
                  }}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailPage
                  products={products}
                  addToCart={addToCart}
                  currentUser={currentUser}
                  isUserOwnerOf={isUserOwnerOf}
                  downloadProduct={downloadProduct}
                />
              }
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cartItems}
                  subtotal={subtotal}
                  removeFromCart={removeFromCart}
                  updateCartQuantity={updateCartQuantity}
                />
              }
            />
            <Route
              path="/checkout"
              element={
                <CheckoutPage
                  cartItems={cartItems}
                  subtotal={subtotal}
                  currentUser={currentUser}
                  purchaseProducts={purchaseProducts}
                  clearCart={() => setCart([])}
                />
              }
            />
            <Route
              path="/auth"
              element={<AuthPage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
            />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  products={products}
                  currentUser={currentUser}
                  isUserOwnerOf={isUserOwnerOf}
                  downloadProduct={downloadProduct}
                />
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Header({ cartCount, currentUser }: { cartCount: number; currentUser: UserProfile }) {
  return (
    <header className="topbar glass-panel">
      <div className="brand-area">
        <Link to="/" className="brand-mark">رِمْسَن</Link>
      </div>
      <nav aria-label="التنقل الرئيسي" className="nav-menu">
        <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          الرئيسية
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          المنتجات
        </NavLink>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
          لوحة التحكم
        </NavLink>
      </nav>
      <div className="topbar-actions">
        <Link to="/auth" className="ghost-btn small-btn">
          {currentUser ? currentUser.name : 'تسجيل الدخول'}
        </Link>
        <Link to="/cart" className="cart-pill" aria-label="سلة المشتريات">
          <span>السلة</span>
          <strong>{cartCount}</strong>
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="footer glass-panel">
      <div>
        <strong>رِمْسَن</strong>
        <p>متجر عربي رقمي احترافي يفكّك المنتجات إلى تجربة شراء واضحة وخدمات قابلة للتوسع.</p>
      </div>
      <div className="footer-links">
        <Link to="/products">المنتجات</Link>
        <Link to="/checkout">الدفع</Link>
        <Link to="/dashboard">لوحة التحكم</Link>
      </div>
    </footer>
  );
}

function HomePage({
  products,
  addToCart,
  isLoading,
  loadError,
  onRetry,
}: {
  products: Product[];
  addToCart: (productId: number) => void;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
}) {
  usePageMeta('رِمْسَن | متجر المنتجات الرقمية', 'متجر عربي فاخر للمنتجات الرقمية مع تجربة شراء متكاملة، بحث، تصنيفات، لوحة تحكم، ودفع تجريبي.');

  const featured = products.slice(0, 3);

  return (
    <>
      <section className="hero glass-panel">
        <div className="hero-copy">
          <span className="eyebrow">متجر رقمي عربي متكامل</span>
          <h1>اكتشف حلولًا رقمية قوية تعزز حضورك وتزيد مبيعاتك.</h1>
          <p>
            قوالب، دروس، أدوات تسويق، وتصاميم جاهزة لرواد الأعمال والفرق الرقمية في السوق العربي.
          </p>
          <div className="hero-actions">
            <Link to="/products" className="btn primary">
              تصفح المنتجات
            </Link>
            <Link to="/dashboard" className="btn secondary">
              لوحة العميل
            </Link>
          </div>
          <ul className="mini-stats">
            <li>
              <strong>15k+</strong>
              <span>تحميل</span>
            </li>
            <li>
              <strong>4.9/5</strong>
              <span>تقييم</span>
            </li>
            <li>
              <strong>24/7</strong>
              <span>دعم</span>
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          <div className="hero-card glass-panel">
            <div className="card-head">
              <span className="dot green" />
              <span className="dot gold" />
              <span className="dot violet" />
            </div>
            <div className="chart-box" aria-hidden="true">
              <div className="chart-bar" style={{ height: '18%' }} />
              <div className="chart-bar" style={{ height: '32%' }} />
              <div className="chart-bar" style={{ height: '58%' }} />
              <div className="chart-bar" style={{ height: '72%' }} />
              <div className="chart-bar" style={{ height: '96%' }} />
            </div>
            <div className="sale-pill">+184% نمو مبيعات</div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <div className="glass-panel metric-card">
          <span>الطلب اليومي</span>
          <strong>1,240</strong>
        </div>
        <div className="glass-panel metric-card">
          <span>المشاريع النشطة</span>
          <strong>486</strong>
        </div>
        <div className="glass-panel metric-card">
          <span>معدل الربح</span>
          <strong>72%</strong>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">منتجات مختارة</span>
            <h2>أفضل العروض لهذا الأسبوع</h2>
          </div>
          <Link to="/products" className="inline-link">
            استعراض الكل
          </Link>
        </div>

        {isLoading ? <LoadingState /> : null}
        {loadError ? <ErrorState message={loadError} onRetry={onRetry} /> : null}

        {!isLoading && !loadError ? (
          <div className="product-grid compact-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">لماذا نحن؟</span>
            <h2>سلسلة قيم موجهة للنجاح الرقمي</h2>
          </div>
        </div>
        <div className="benefits-grid">
          <article className="glass-panel benefit-card">
            <span className="icon">⚡</span>
            <h3>تجربة شراء سريعة</h3>
            <p>واجهة ذكية واضحة تقود العميل من الزيارة إلى الشراء في خطوات قليلة.</p>
          </article>
          <article className="glass-panel benefit-card">
            <span className="icon">🛡️</span>
            <h3>أمان وتنظيم</h3>
            <p>منطق تحميل وتجربة مستخدم آمن يحافظ على محتوى المنتجات وحقوقه.</p>
          </article>
          <article className="glass-panel benefit-card">
            <span className="icon">📈</span>
            <h3>توسع مستقبلي</h3>
            <p>قابل للربط بقاعدة بيانات حقيقية، نظام مصادقة، ودفع إلكتروني لاحقًا.</p>
          </article>
        </div>
      </section>
    </>
  );
}

function ProductsPage({
  products,
  addToCart,
  isLoading,
  loadError,
  onRetry,
}: {
  products: Product[];
  addToCart: (productId: number) => void;
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => void;
}) {
  usePageMeta('منتجات رِمْسَن', 'تصفح جميع المنتجات الرقمية في متجر رِمْسَن بالبحث، التصنيفات، والتنظيم السريع.');

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'rating'>('popular');

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    let next = products.filter((product) => {
      const categoryMatch = selectedCategory === 'الكل' || product.category === selectedCategory;
      const searchMatch =
        !normalized ||
        product.title.toLowerCase().includes(normalized) ||
        product.tags.some((tag) => tag.toLowerCase().includes(normalized)) ||
        product.description.toLowerCase().includes(normalized);
      return categoryMatch && searchMatch;
    });

    switch (sortBy) {
      case 'price-asc':
        next = [...next].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        next = [...next].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        next = [...next].sort((a, b) => b.rating - a.rating);
        break;
      default:
        next = [...next].sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
        break;
    }

    return next;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <section className="section-block">
      <div className="section-heading">
        <div>
          <span className="eyebrow">المكتبة</span>
          <h2>منتجات رقمية عربية</h2>
        </div>
      </div>

      <div className="toolbar glass-panel">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ابحث عن منتج أو فئة..."
          aria-label="البحث في المنتجات"
        />
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value as 'popular' | 'price-asc' | 'price-desc' | 'rating')}>
          <option value="popular">الأكثر شعبية</option>
          <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
          <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
          <option value="rating">التقييم</option>
        </select>
      </div>

      <div className="chip-list">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === selectedCategory ? 'chip active' : 'chip'}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {isLoading ? <LoadingState /> : null}
      {loadError ? <ErrorState message={loadError} onRetry={onRetry} /> : null}

      {!isLoading && !loadError && filteredProducts.length === 0 ? <EmptyState /> : null}

      {!isLoading && !loadError && filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProductCard({ product, addToCart }: { product: Product; addToCart: (productId: number) => void }) {
  return (
    <article className="product-card glass-panel">
      <div className="product-image-wrap">
        <img src={product.image} alt={product.title} className="product-image" />
        {product.badge ? <span className="product-badge">{product.badge}</span> : null}
      </div>
      <div className="product-info">
        <div className="product-meta">
          <span>{product.category}</span>
          <span>
            {product.rating} ★ ({product.reviews})
          </span>
        </div>
        <h3>{product.title}</h3>
        <p>{product.shortDescription}</p>
        <div className="tag-list">
          {product.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="price-row">
          <div>
            <strong>{formatPrice(product.price)}</strong>
            <small>{formatPrice(product.originalPrice)}</small>
          </div>
          <button type="button" className="btn primary small" onClick={() => addToCart(product.id)}>
            أضف للسلة
          </button>
        </div>
        <Link to={`/product/${product.id}`} className="inline-link">
          عرض التفاصيل
        </Link>
      </div>
    </article>
  );
}

function ProductDetailPage({
  products,
  addToCart,
  currentUser,
  isUserOwnerOf,
  downloadProduct,
}: {
  products: Product[];
  addToCart: (productId: number) => void;
  currentUser: UserProfile;
  isUserOwnerOf: (productId: number) => boolean;
  downloadProduct: (productId: number) => void;
}) {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  const navigate = useNavigate();

  if (!product) {
    return <NotFoundState />;
  }

  usePageMeta(product.title, product.description);

  return (
    <section className="section-block product-detail">
      <div className="product-detail-grid">
        <div className="glass-panel detail-visual">
          <img src={product.image} alt={product.title} />
        </div>

        <div className="detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.title}</h1>
          <div className="detail-meta">
            <span>⭐ {product.rating} ({product.reviews} تقييم)</span>
            <span>{product.fileSize}</span>
            <span>{product.format}</span>
          </div>
          <p>{product.description}</p>
          <ul className="feature-list">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <div className="tag-list">
            {product.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="price-panel">
            <div>
              <strong>{formatPrice(product.price)}</strong>
              <small>{formatPrice(product.originalPrice)}</small>
            </div>
            <span className="level-badge">{product.level}</span>
          </div>

          <div className="detail-actions">
            <button type="button" className="btn primary" onClick={() => addToCart(product.id)}>
              أضف إلى السلة
            </button>
            <button type="button" className="btn secondary" onClick={() => navigate('/checkout')}>
              شراء الآن
            </button>
          </div>

          <button
            type="button"
            className={isUserOwnerOf(product.id) ? 'download-btn active' : 'download-btn disabled'}
            disabled={!isUserOwnerOf(product.id)}
            onClick={() => downloadProduct(product.id)}
          >
            {isUserOwnerOf(product.id) ? 'تحميل تجريبي' : 'يجب شراء المنتج أولًا'}
          </button>
        </div>
      </div>
    </section>
  );
}

function CartPage({
  cartItems,
  subtotal,
  removeFromCart,
  updateCartQuantity,
}: {
  cartItems: Array<CartItem & { product: Product }>;
  subtotal: number;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, nextQty: number) => void;
}) {
  usePageMeta('سلة المشتريات', 'راجع عناصر سلة المشتريات قبل الدفع التجريبي للمنتجات الرقمية.');

  if (cartItems.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <section className="checkout-shell section-block">
      <div className="checkout-grid">
        <div className="glass-panel checkout-list">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item-row">
              <img src={item.product.image} alt={item.product.title} />
              <div>
                <h3>{item.product.title}</h3>
                <p>{item.product.category}</p>
              </div>
              <div className="qty-box">
                <button type="button" onClick={() => updateCartQuantity(item.id, item.qty - 1)}>-</button>
                <span>{item.qty}</span>
                <button type="button" onClick={() => updateCartQuantity(item.id, item.qty + 1)}>+</button>
              </div>
              <strong>{formatPrice(item.product.price * item.qty)}</strong>
              <button type="button" className="text-btn" onClick={() => removeFromCart(item.id)}>
                حذف
              </button>
            </div>
          ))}
        </div>

        <aside className="glass-panel summary-panel">
          <h3>ملخص الطلب</h3>
          <div className="summary-row">
            <span>المجموع الفرعي</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>التوصيل</span>
            <strong>مجاني</strong>
          </div>
          <div className="summary-row total-row">
            <span>الإجمالي</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <Link to="/checkout" className="btn primary block-btn">
            متابعة إلى الدفع
          </Link>
        </aside>
      </div>
    </section>
  );
}

function CheckoutPage({
  cartItems,
  subtotal,
  currentUser,
  purchaseProducts,
  clearCart,
}: {
  cartItems: Array<CartItem & { product: Product }>;
  subtotal: number;
  currentUser: UserProfile;
  purchaseProducts: (productIds: number[]) => void;
  clearCart: () => void;
}) {
  usePageMeta('الدفع التجريبي', 'صفحة الدفع التجريبي للمنتجات الرقمية في متجر رِمْسَن جاهزة للربط ببوابة دفع حقيقية.');

  const navigate = useNavigate();
  const [form, setForm] = useState<CheckoutForm>({
    name: currentUser.name,
    email: currentUser.email,
    phone: '',
    notes: '',
  });

  if (cartItems.length === 0) {
    return <EmptyCartState />;
  }

  const completePurchase = (event: React.FormEvent) => {
    event.preventDefault();
    const productIds = cartItems.map((item) => item.id);
    purchaseProducts(productIds);
    clearCart();
    navigate('/dashboard');
  };

  return (
    <section className="section-block checkout-shell">
      <div className="checkout-grid">
        <form className="glass-panel checkout-form" onSubmit={completePurchase}>
          <h2>إتمام الطلب</h2>
          <div className="field-grid">
            <label>
              الاسم الكامل
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              البريد الإلكتروني
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
            <label>
              رقم الهاتف
              <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
            </label>
            <label>
              ملاحظات إضافية
              <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
            </label>
          </div>

          <div className="payment-box">
            <h3>طريقة الدفع</h3>
            <div className="payment-options">
              <label>
                <input type="radio" name="payment" defaultChecked /> بطاقة ائتمان
              </label>
              <label>
                <input type="radio" name="payment" /> Apple Pay
              </label>
              <label>
                <input type="radio" name="payment" /> تحويل بنكي
              </label>
            </div>
          </div>

          <button type="submit" className="btn primary block-btn">
            تأكيد الدفع التجريبي
          </button>
        </form>

        <aside className="glass-panel summary-panel">
          <h3>ملخص الطلب</h3>
          {cartItems.map((item) => (
            <div key={item.id} className="summary-item">
              <span>{item.product.title}</span>
              <strong>{formatPrice(item.product.price * item.qty)}</strong>
            </div>
          ))}
          <div className="summary-row total-row">
            <span>الإجمالي</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AuthPage({
  currentUser,
  setCurrentUser,
}: {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
}) {
  usePageMeta('حساب العميل', 'تسجيل الدخول، إنشاء حساب جديد، واستعادة كلمة المرور في متجر رِمْسَن.');

  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const nextUser = {
      name: form.name || 'مستخدم جديد',
      email: form.email || currentUser.email,
      purchased: currentUser.purchased,
      downloads: currentUser.downloads,
    };

    setCurrentUser(nextUser);
    navigate('/dashboard');
  };

  return (
    <section className="auth-wrap section-block">
      <div className="glass-panel auth-card">
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => setMode('login')}>
            تسجيل الدخول
          </button>
          <button type="button" className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => setMode('register')}>
            إنشاء حساب
          </button>
          <button type="button" className={mode === 'forgot' ? 'tab active' : 'tab'} onClick={() => setMode('forgot')}>
            نسيت كلمة المرور
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' ? (
            <label>
              الاسم الكامل
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
          ) : null}

          <label>
            البريد الإلكتروني
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          {mode !== 'forgot' ? (
            <label>
              كلمة المرور
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
          ) : null}

          <button type="submit" className="btn primary block-btn">
            {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء الحساب' : 'إعادة تعيين كلمة المرور'}
          </button>
        </form>
      </div>
    </section>
  );
}

function DashboardPage({
  products,
  currentUser,
  isUserOwnerOf,
  downloadProduct,
}: {
  products: Product[];
  currentUser: UserProfile;
  isUserOwnerOf: (productId: number) => boolean;
  downloadProduct: (productId: number) => void;
}) {
  usePageMeta('لوحة التحكم', 'لوحة العميل تعرض المشتريات والتنزيلات مع حماية منطقية للتحميل التجريبي.');

  if (!currentUser?.email) {
    return <NotAuthorizedState />;
  }

  const ownedProducts = products.filter((product) => isUserOwnerOf(product.id));

  return (
    <section className="section-block dashboard-shell">
      <div className="dashboard-head glass-panel">
        <div>
          <span className="eyebrow">مرحبًا</span>
          <h2>{currentUser.name}</h2>
        </div>
        <Link to="/products" className="btn secondary">
          تصفح المزيد
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="glass-panel stat-card">
          <span>المشتريات</span>
          <strong>{ownedProducts.length}</strong>
        </div>
        <div className="glass-panel stat-card">
          <span>التنزيلات</span>
          <strong>{currentUser.downloads.length}</strong>
        </div>
        <div className="glass-panel stat-card">
          <span>اشتراك</span>
          <strong>Pro</strong>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="glass-panel dashboard-list">
          <h3>مشترياتي</h3>
          {ownedProducts.length ? (
            ownedProducts.map((product) => (
              <div key={product.id} className="dashboard-item">
                <div>
                  <h4>{product.title}</h4>
                  <small>{product.category}</small>
                </div>
                <button type="button" className="btn secondary small" onClick={() => downloadProduct(product.id)}>
                  تنزيل
                </button>
              </div>
            ))
          ) : (
            <EmptyState compact />
          )}
        </div>

        <div className="glass-panel dashboard-list">
          <h3>آخر الأنشطة</h3>
          <ul className="activity-list">
            <li>تم شراء «باندل نمو متجر عربي» • قبل يومين</li>
            <li>تم تنزيل «نظام تجربة مستخدم عربي» • قبل 4 أيام</li>
            <li>تم تحديث الجهاز • قبل أسبوع</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="loading-grid">
      {[...Array(3)].map((_, index) => (
        <div className="skeleton-card glass-panel" key={index} />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="empty-panel glass-panel error-panel">
      <h3>حدث خطأ أثناء التحميل</h3>
      <p>{message}</p>
      <button type="button" className="btn primary" onClick={onRetry}>
        إعادة المحاولة
      </button>
    </div>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? 'empty-panel compact glass-panel' : 'empty-panel glass-panel'}>
      <h3>لا توجد نتائج الآن</h3>
      <p>حاول تعديل البحث أو اختيار تصنيف مختلف.</p>
      <Link to="/products" className="btn secondary">
        استعراض المنتجات
      </Link>
    </div>
  );
}

function EmptyCartState() {
  return (
    <section className="section-block">
      <div className="empty-panel glass-panel">
        <h3>سلة المشتريات فارغة</h3>
        <p>ابدأ بتصفح منتجاتنا الرقمية واختر ما يناسبك.</p>
        <Link to="/products" className="btn primary">
          اكتشف المنتجات
        </Link>
      </div>
    </section>
  );
}

function NotFoundState() {
  return (
    <section className="section-block">
      <div className="empty-panel glass-panel">
        <h3>الصفحة غير موجودة</h3>
        <p>المنتج المطلوب غير متاح أو تم حذفه.</p>
        <Link to="/products" className="btn secondary">
          العودة للمنتجات
        </Link>
      </div>
    </section>
  );
}

function NotAuthorizedState() {
  return (
    <section className="section-block">
      <div className="empty-panel glass-panel">
        <h3>يرجى تسجيل الدخول</h3>
        <p>للوصول إلى لوحة التحكم، تحتاج إلى إنشاء حساب أو تسجيل الدخول.</p>
        <Link to="/auth" className="btn primary">
          دخول إلى الحساب
        </Link>
      </div>
    </section>
  );
}

export default App;
