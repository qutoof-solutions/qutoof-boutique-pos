'use client';

import { useEffect, useMemo, useState, type ComponentProps, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft, ArrowUpRight, BarChart3, Barcode, Boxes, Check, ChevronDown,
  CircleHelp, CreditCard, Languages, LayoutDashboard, Minus,
  Moon, Package, Plus, Printer, RotateCcw, Search, ShoppingBag, Sun,
  TrendingUp, Wallet, X,
} from 'lucide-react';
import {
  createSeedStore, DemoStore, Invoice, InvoiceLine, MAX_INVOICES, MAX_PRODUCTS,
  persistStore, piecesSold, Product, ProductVariant, PRODUCT_LIMIT_MESSAGE,
  INVOICE_LIMIT_MESSAGE, PRINT_NOTICE, SaleUnit, STORAGE_KEY, totalStock,
} from '@/lib/boutique/demo-store';

type Locale = 'ar' | 'en';
type Page = 'dashboard' | 'inventory' | 'pos' | 'sales' | 'returns' | 'reports';
type CartLine = { productId: string; variantId: string; quantity: number; unit: SaleUnit };
type CategoryFilter = 'all' | Product['category'];

const copy = {
  ar: {
    brand: 'Qutoof Solutions', brandTag: 'BOUTIQUE POS', dashboard: 'الرئيسية', inventory: 'المخزون', pos: 'الكاشير السريع', sales: 'المبيعات', returns: 'المرتجعات', reports: 'التقارير',
    branch: 'بوتيك قطوف · الفرع الرئيسي', today: 'اليوم', welcome: 'أهلاً بك في بوتيك قطوف', dashboardSub: 'نظرة سريعة على أداء متجرك اليوم.', todaySales: 'مبيعات اليوم', invoiceCount: 'الفواتير', totalProducts: 'الأصناف', stockValue: 'قيمة المخزون', lowStock: 'مخزون منخفض',
    quickActions: 'اختصارات سريعة', startSale: 'ابدأ عملية بيع', manageStock: 'إدارة الأصناف', seeReports: 'عرض التقارير', recentSales: 'آخر المبيعات', viewAll: 'عرض الكل', salesTrend: 'حركة المبيعات', topProducts: 'الأكثر مبيعاً', unitsLeft: 'وحدة متاحة',
    catalog: 'كتالوج المنتجات', catalogSub: 'تابع الأصناف والمقاسات والألوان والباركود من مكان واحد.', searchProducts: 'ابحث عن منتج أو باركود...', addProduct: 'إضافة صنف', all: 'الكل', clothing: 'ملابس', shoes: 'أحذية', accessories: 'إكسسوارات', product: 'الصنف', variant: 'المقاس · اللون', barcode: 'الباركود', stock: 'المخزون', price: 'السعر', action: 'الإجراء', noProducts: 'لا توجد أصناف مطابقة للبحث.',
    posTitle: 'الكاشير السريع', posSub: 'امسح الباركود أو اختر المنتجات لإضافتها إلى الفاتورة.', scanCode: 'امسح الباركود أو اكتب اسم المنتج...', scannerHint: 'قارئ الباركود يعمل مباشرة — امسح الرمز ثم اضغط Enter.', chooseVariant: 'اختر المقاس واللون', addToCart: 'أضف', cart: 'سلة البيع', emptyCart: 'السلة فارغة', quantity: 'الكمية', subtotal: 'المجموع', total: 'الإجمالي', paymentMethod: 'طريقة الدفع', cash: 'نقداً', card: 'بطاقة', transfer: 'تحويل', completePayment: 'إتمام الدفع', invoiceLimitTitle: 'وصلت إلى حد التجربة', invoiceLimitSub: 'اكتملت 20 فاتورة تجريبية. ترقَّ للنسخة الكاملة لمتابعة البيع.', sellBy: 'البيع حسب', piece: 'القطعة', dozen: 'الدستة', pieces: 'قطعة', remove: 'حذف',
    salesTitle: 'سجل المبيعات', salesSub: 'كل فواتير البوتيك محفوظة محلياً على هذا الجهاز.', invoice: 'رقم الفاتورة', date: 'التاريخ والوقت', customer: 'العميل', items: 'الأصناف', payment: 'الدفع', status: 'الحالة', completed: 'مكتملة', print: 'طباعة', noSales: 'لا توجد فواتير بعد.',
    returnsTitle: 'المرتجعات', returnsSub: 'سجّل إرجاع القطع إلى المخزون مع ربطها بالفاتورة الأصلية.', returnHistory: 'سجل المرتجعات', returnable: 'فواتير قابلة للإرجاع', returnOne: 'إرجاع قطعة', returnAmount: 'قيمة المرتجع', noReturns: 'لا توجد مرتجعات حتى الآن.', nothingToReturn: 'لا توجد قطع متاحة للإرجاع.', returned: 'تم إرجاع القطعة إلى المخزون.',
    reportsTitle: 'تقارير البوتيك', reportsSub: 'ملخص الأداء والمخزون من بيانات التجربة المحلية.', netSales: 'صافي المبيعات', returnsValue: 'قيمة المرتجعات', averageOrder: 'متوسط الفاتورة', unitsSold: 'القطع المباعة', dailyTrend: 'المبيعات خلال 7 أيام', inventoryMix: 'توزيع المخزون', topFive: 'أفضل المنتجات',
    productName: 'اسم الصنف', productNameAr: 'اسم الصنف بالعربية', productNameEn: 'اسم الصنف بالإنجليزية', category: 'التصنيف', sizes: 'المقاسات (افصل بفاصلة)', colors: 'الألوان (افصل بفاصلة)', unitPrice: 'سعر القطعة (ر.س)', dozenPrice: 'سعر الدستة (ر.س)', openingStock: 'الكمية لكل مقاس/لون', saveProduct: 'حفظ الصنف', cancel: 'إلغاء', productCap: 'حد التجربة: 15 صنفاً', inventoryCap: 'مخزون تجريبي',
    printed: 'طباعة الفاتورة', paymentSuccess: 'تمت عملية البيع بنجاح', receipt: 'فاتورة بيع', taxNote: 'الأسعار شاملة الضريبة التجريبية', reset: 'إعادة بيانات العرض', resetConfirm: 'سيتم استعادة البيانات التجريبية وحذف التغييرات المحلية. هل تريد المتابعة؟', language: 'English', themeDark: 'الوضع الليلي', themeLight: 'الوضع النهاري', demoNotice: 'نسخة تجريبية — البيانات محفوظة على هذا الجهاز فقط',
    search: 'بحث...', day0: 'الأحد', day1: 'الإثنين', day2: 'الثلاثاء', day3: 'الأربعاء', day4: 'الخميس', day5: 'الجمعة', day6: 'السبت',
    productAdded: 'تمت إضافة الصنف إلى المخزون.', stockShort: 'الكمية المتاحة لا تكفي لإتمام البيع.', scanNotFound: 'لم نعثر على هذا الباركود. تحقق من الرمز وحاول مجدداً.', pieceWord: 'قطعة', dozenWord: 'دستة', size: 'المقاس', color: 'اللون',
  },
  en: {
    brand: 'Qutoof Solutions', brandTag: 'BOUTIQUE POS', dashboard: 'Dashboard', inventory: 'Inventory', pos: 'Quick POS', sales: 'Sales', returns: 'Returns', reports: 'Reports',
    branch: 'Qutoof Boutique · Main branch', today: 'Today', welcome: 'Welcome to Qutoof Boutique', dashboardSub: 'A quick look at your store performance today.', todaySales: "Today's sales", invoiceCount: 'Invoices', totalProducts: 'Products', stockValue: 'Stock value', lowStock: 'Low stock',
    quickActions: 'Quick actions', startSale: 'Start a sale', manageStock: 'Manage products', seeReports: 'View reports', recentSales: 'Recent sales', viewAll: 'View all', salesTrend: 'Sales activity', topProducts: 'Top sellers', unitsLeft: 'units available',
    catalog: 'Product catalog', catalogSub: 'Manage products, sizes, colors and barcodes in one place.', searchProducts: 'Search products or barcode...', addProduct: 'Add product', all: 'All', clothing: 'Clothing', shoes: 'Shoes', accessories: 'Accessories', product: 'Product', variant: 'Size · color', barcode: 'Barcode', stock: 'Stock', price: 'Price', action: 'Action', noProducts: 'No products match your search.',
    posTitle: 'Quick POS', posSub: 'Scan a barcode or choose items to add them to the cart.', scanCode: 'Scan barcode or search products...', scannerHint: 'Barcode scanners work directly — scan a code and press Enter.', chooseVariant: 'Choose size & color', addToCart: 'Add', cart: 'Current sale', emptyCart: 'Your cart is empty', quantity: 'Quantity', subtotal: 'Subtotal', total: 'Total', paymentMethod: 'Payment method', cash: 'Cash', card: 'Card', transfer: 'Transfer', completePayment: 'Complete payment', invoiceLimitTitle: 'Demo limit reached', invoiceLimitSub: 'Your 20 demo invoices are used. Upgrade to the full version to continue selling.', sellBy: 'Sell by', piece: 'Piece', dozen: 'Dozen', pieces: 'pcs', remove: 'Remove',
    salesTitle: 'Sales history', salesSub: 'Boutique invoices are stored locally on this device.', invoice: 'Invoice', date: 'Date & time', customer: 'Customer', items: 'Items', payment: 'Payment', status: 'Status', completed: 'Completed', print: 'Print', noSales: 'No invoices yet.',
    returnsTitle: 'Returns', returnsSub: 'Return pieces to stock and link each return to its original invoice.', returnHistory: 'Return history', returnable: 'Eligible invoices', returnOne: 'Return one piece', returnAmount: 'Refund amount', noReturns: 'No returns yet.', nothingToReturn: 'No pieces remain eligible for return.', returned: 'The piece was returned to stock.',
    reportsTitle: 'Boutique reports', reportsSub: 'Sales and stock summaries from local demo data.', netSales: 'Net sales', returnsValue: 'Returns value', averageOrder: 'Average order', unitsSold: 'Units sold', dailyTrend: 'Sales over 7 days', inventoryMix: 'Inventory mix', topFive: 'Top products',
    productName: 'Product name', productNameAr: 'Product name in Arabic', productNameEn: 'Product name in English', category: 'Category', sizes: 'Sizes (comma separated)', colors: 'Colors (comma separated)', unitPrice: 'Price per piece (SAR)', dozenPrice: 'Price per dozen (SAR)', openingStock: 'Stock per size/color', saveProduct: 'Save product', cancel: 'Cancel', productCap: 'Demo cap: 15 products', inventoryCap: 'Demo inventory',
    printed: 'Print invoice', paymentSuccess: 'Sale completed successfully', receipt: 'Sales receipt', taxNote: 'Prices include demo tax', reset: 'Reset demo data', resetConfirm: 'This will restore demo data and remove local changes. Continue?', language: 'العربية', themeDark: 'Dark mode', themeLight: 'Light mode', demoNotice: 'Demo version — data is stored on this device only',
    search: 'Search...', day0: 'Sun', day1: 'Mon', day2: 'Tue', day3: 'Wed', day4: 'Thu', day5: 'Fri', day6: 'Sat',
    productAdded: 'Product added to inventory.', stockShort: 'Available stock is not enough to complete this sale.', scanNotFound: 'Barcode not found. Check the code and try again.', pieceWord: 'piece', dozenWord: 'dozen', size: 'Size', color: 'Color',
  },
} as const;

const pageLinks: { page: Page; href: string; icon: typeof LayoutDashboard }[] = [
  { page: 'dashboard', href: '/', icon: LayoutDashboard },
  { page: 'inventory', href: '/inventory/', icon: Boxes },
  { page: 'pos', href: '/pos/', icon: Barcode },
  { page: 'sales', href: '/sales/', icon: Wallet },
  { page: 'returns', href: '/returns/', icon: RotateCcw },
  { page: 'reports', href: '/reports/', icon: BarChart3 },
];

const pageTitleKey: Record<Page, keyof typeof copy.ar> = {
  dashboard: 'dashboard', inventory: 'inventory', pos: 'pos', sales: 'sales', returns: 'returns', reports: 'reports',
};
const routeFor = (page: Page) => pageLinks.find((item) => item.page === page)?.href ?? '/';
const productName = (product: Product, locale: Locale) => locale === 'ar' ? product.nameAr : product.nameEn;
const formatDayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

export function BoutiqueApp({ page }: { page: Page }) {
  const [locale, setLocale] = useState<Locale>('ar');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [store, setStore] = useState<DemoStore>(() => createSeedStore());
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [scanTerm, setScanTerm] = useState('');
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [saleUnit, setSaleUnit] = useState<SaleUnit>('piece');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [payment, setPayment] = useState<Invoice['payment']>('cash');
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState({ nameAr: '', nameEn: '', category: 'clothing' as Product['category'], sizes: 'S, M, L', colors: 'أسود, كحلي', unitPrice: '99', dozenPrice: '1050', stock: '8' });
  const [printTarget, setPrintTarget] = useState<Invoice | null>(null);

  const isEn = locale === 'en';
  const t = (key: keyof typeof copy.ar) => copy[locale][key];
  const money = (value: number) => new Intl.NumberFormat(isEn ? 'en-SA' : 'ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 0 }).format(value);
  const dateTime = (value: string) => new Intl.DateTimeFormat(isEn ? 'en' : 'ar-SA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  const categoryLabel = (category: Product['category']) => category === 'clothing' ? t('clothing') : category === 'shoes' ? t('shoes') : t('accessories');

  useEffect(() => {
    try {
      const savedLocale = window.localStorage.getItem('qutoof-demo-locale');
      const savedTheme = window.localStorage.getItem('qutoof-demo-theme');
      if (savedLocale === 'en' || savedLocale === 'ar') setLocale(savedLocale);
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    } catch { /* Keep Arabic and dark mode when browser storage is unavailable. */ }
    setStore(loadInitialStore());
    setReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem('qutoof-demo-locale', locale);
      window.localStorage.setItem('qutoof-demo-theme', theme);
    } catch { /* Preference storage is optional. */ }
  }, [locale, theme]);

  useEffect(() => {
    if (ready) persistStore(store);
  }, [store, ready]);

  const filteredProducts = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return store.products.filter((product) => {
      const categoryMatch = filter === 'all' || product.category === filter;
      const textMatch = !needle || [product.nameAr, product.nameEn, product.sku, ...product.variants.map((variant) => variant.barcode)].some((text) => text.toLowerCase().includes(needle));
      return categoryMatch && textMatch;
    });
  }, [filter, searchTerm, store.products]);

  const todayKey = formatDayKey(new Date());
  const todayInvoices = store.invoices.filter((invoice) => formatDayKey(new Date(invoice.date)) === todayKey);
  const todayGross = todayInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const returnedValue = store.returns.reduce((sum, item) => sum + item.amount, 0);
  const netSales = store.invoices.reduce((sum, invoice) => sum + invoice.total, 0) - returnedValue;
  const stockValue = store.products.reduce((sum, product) => sum + product.variants.reduce((inner, variant) => inner + variant.stock * product.unitPrice, 0), 0);
  const lowStockVariants = store.products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))).filter(({ variant }) => variant.stock <= 3);
  const cartLines = cart.map((line) => {
    const product = store.products.find((item) => item.id === line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    return product && variant ? { ...line, product, variant, unitPrice: line.unit === 'dozen' ? product.dozenPrice : product.unitPrice } : null;
  }).filter((line): line is NonNullable<typeof line> => line !== null);
  const cartTotal = cartLines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const unitCount = cartLines.reduce((sum, line) => sum + line.quantity * (line.unit === 'dozen' ? 12 : 1), 0);
  const invoiceLimitReached = store.invoices.length >= MAX_INVOICES;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3600);
  }

  function addToCart(product: Product, variant: ProductVariant, unit: SaleUnit = saleUnit) {
    const multiplier = unit === 'dozen' ? 12 : 1;
    const existing = cart.find((line) => line.productId === product.id && line.variantId === variant.id && line.unit === unit);
    const nextQuantity = (existing?.quantity ?? 0) + 1;
    if (variant.stock < nextQuantity * multiplier) {
      notify(t('stockShort'));
      return;
    }
    setCart((current) => existing
      ? current.map((line) => line.productId === product.id && line.variantId === variant.id && line.unit === unit ? { ...line, quantity: line.quantity + 1 } : line)
      : [...current, { productId: product.id, variantId: variant.id, quantity: 1, unit }]);
  }

  function adjustCart(line: CartLine, delta: number) {
    const key = (item: CartLine) => item.productId === line.productId && item.variantId === line.variantId && item.unit === line.unit;
    const product = store.products.find((item) => item.id === line.productId);
    const variant = product?.variants.find((item) => item.id === line.variantId);
    const current = cart.find(key)?.quantity ?? 0;
    const next = current + delta;
    if (next <= 0) {
      setCart((items) => items.filter((item) => !key(item)));
    } else if (variant && next * (line.unit === 'dozen' ? 12 : 1) <= variant.stock) {
      setCart((items) => items.map((item) => key(item) ? { ...item, quantity: next } : item));
    } else notify(t('stockShort'));
  }

  function handleScan(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const code = scanTerm.trim().toLowerCase();
    const match = store.products.flatMap((product) => product.variants.map((variant) => ({ product, variant }))).find(({ product, variant }) => variant.barcode.toLowerCase() === code || product.nameAr.toLowerCase() === code || product.nameEn.toLowerCase() === code);
    if (match) {
      addToCart(match.product, match.variant, 'piece');
      setScanTerm('');
      setSearchTerm('');
    } else notify(t('scanNotFound'));
  }

  function completeSale() {
    if (store.invoices.length >= MAX_INVOICES) {
      window.alert(INVOICE_LIMIT_MESSAGE);
      return;
    }
    if (!cartLines.length) return;
    const changes = new Map<string, number>();
    for (const line of cartLines) changes.set(line.variant.id, (changes.get(line.variant.id) ?? 0) + line.quantity * (line.unit === 'dozen' ? 12 : 1));
    for (const [variantId, quantity] of changes) {
      const variant = store.products.flatMap((product) => product.variants).find((item) => item.id === variantId);
      if (!variant || variant.stock < quantity) {
        notify(t('stockShort'));
        return;
      }
    }
    const number = `QT-${String(Date.now()).slice(-6)}`;
    const items: InvoiceLine[] = cartLines.map((line, index) => ({
      id: `${number}-${index + 1}`, productId: line.productId, variantId: line.variantId,
      nameAr: line.product.nameAr, nameEn: line.product.nameEn, size: line.variant.size,
      color: line.variant.color, barcode: line.variant.barcode, quantity: line.quantity,
      unit: line.unit, unitPrice: line.unitPrice, amount: line.unitPrice * line.quantity, returnedPieces: 0,
    }));
    const total = items.reduce((sum, item) => sum + item.amount, 0);
    const invoice: Invoice = { id: `inv-${number}`, number, date: new Date().toISOString(), items, subtotal: total, total, payment, customer: isEn ? 'Walk-in customer' : 'عميل نقدي' };
    const updatedProducts = store.products.map((product) => ({
      ...product,
      variants: product.variants.map((variant) => ({ ...variant, stock: variant.stock - (changes.get(variant.id) ?? 0) })),
    }));
    const next = { ...store, products: updatedProducts, invoices: [invoice, ...store.invoices] };
    setStore(next);
    setCart([]);
    setPrintTarget(invoice);
    notify(t('paymentSuccess'));
  }

  function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (store.products.length >= MAX_PRODUCTS) {
      window.alert(PRODUCT_LIMIT_MESSAGE);
      return;
    }
    const sizes = productForm.sizes.split(',').map((value) => value.trim()).filter(Boolean);
    const colors = productForm.colors.split(',').map((value) => value.trim()).filter(Boolean);
    const stock = Math.max(0, Number(productForm.stock) || 0);
    if (!productForm.nameAr.trim() || !productForm.nameEn.trim() || !sizes.length || !colors.length) return;
    const id = `product-${Date.now()}`;
    const base = Date.now().toString().slice(-8);
    let index = 0;
    const variants = colors.flatMap((color) => sizes.map((size) => {
      index += 1;
      return { id: `${id}-${index}`, size, color, barcode: `629${base}${String(index).padStart(2, '0')}`, stock };
    }));
    const product: Product = {
      id, nameAr: productForm.nameAr.trim(), nameEn: productForm.nameEn.trim(), category: productForm.category,
      sku: `QT-${id.slice(-6).toUpperCase()}`, unitPrice: Number(productForm.unitPrice) || 0,
      dozenPrice: Number(productForm.dozenPrice) || (Number(productForm.unitPrice) || 0) * 12,
      accent: ['#4c6b61', '#466482', '#8b5862', '#886b4e'][Math.floor(Math.random() * 4)], glyph: productForm.category === 'shoes' ? '◡' : '◒', variants,
    };
    setStore((current) => ({ ...current, products: [product, ...current.products] }));
    setShowProductForm(false);
    setProductForm({ nameAr: '', nameEn: '', category: 'clothing', sizes: 'S, M, L', colors: 'أسود, كحلي', unitPrice: '99', dozenPrice: '1050', stock: '8' });
    notify(t('productAdded'));
  }

  function returnOnePiece(invoice: Invoice) {
    const available = invoice.items.find((item) => item.returnedPieces < piecesSold(item));
    if (!available) {
      notify(t('nothingToReturn'));
      return;
    }
    const amount = available.unit === 'dozen' ? available.unitPrice / 12 : available.unitPrice;
    const event = {
      id: `return-${Date.now()}`, invoiceId: invoice.id, invoiceNumber: invoice.number,
      date: new Date().toISOString(), productNameAr: available.nameAr, productNameEn: available.nameEn,
      size: available.size, color: available.color, quantity: 1, amount,
    };
    setStore((current) => ({
      ...current,
      invoices: current.invoices.map((entry) => entry.id !== invoice.id ? entry : { ...entry, items: entry.items.map((item) => item.id === available.id ? { ...item, returnedPieces: item.returnedPieces + 1 } : item) }),
      products: current.products.map((product) => ({ ...product, variants: product.variants.map((variant) => variant.id === available.variantId ? { ...variant, stock: variant.stock + 1 } : variant) })),
      returns: [event, ...current.returns],
    }));
    notify(t('returned'));
  }

  function resetDemo() {
    if (!window.confirm(t('resetConfirm'))) return;
    const fresh = createSeedStore();
    setStore(fresh);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* No-op. */ }
    setCart([]);
    setPrintTarget(null);
    notify(t('paymentSuccess'));
  }

  function triggerPrint(invoice: Invoice) {
    setPrintTarget(invoice);
    window.setTimeout(() => window.print(), 120);
  }

  const invoiceDays = useMemo(() => Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const value = store.invoices.filter((invoice) => formatDayKey(new Date(invoice.date)) === formatDayKey(date)).reduce((sum, invoice) => sum + invoice.total, 0);
    const dayNames = isEn ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
    return { label: dayNames[date.getDay()], value };
  }), [isEn, store.invoices]);

  const totalDaySales = Math.max(1, ...invoiceDays.map((item) => item.value));
  const totalUnitsSold = store.invoices.reduce((sum, invoice) => sum + invoice.items.reduce((inner, item) => inner + piecesSold(item), 0), 0);
  const topProducts = store.products.map((product) => ({
    product,
    count: store.invoices.reduce((sum, invoice) => sum + invoice.items.filter((item) => item.productId === product.id).reduce((inner, item) => inner + piecesSold(item), 0), 0),
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const pageHeading = page === 'dashboard' ? t('welcome') : page === 'inventory' ? t('catalog') : page === 'pos' ? t('posTitle') : page === 'sales' ? t('salesTitle') : page === 'returns' ? t('returnsTitle') : t('reportsTitle');

  return (
    <div className={`app-shell ${isEn ? 'is-english' : ''}`}>
      <aside className="sidebar no-print">
        <Link className="brand" href="/" aria-label={t('brand')}>
          <span className="brand-mark">Q</span><span className="brand-copy"><strong>Qutoof</strong><small>Solutions</small></span>
        </Link>
        <div className="brand-divider" />
        <div className="sidebar-caption">{t('brandTag')}</div>
        <nav className="main-nav" aria-label={t('brandTag')}>
          {pageLinks.map(({ page: itemPage, href, icon: Icon }) => (
            <a key={itemPage} href={href} className={`nav-link ${page === itemPage ? 'active' : ''}`}>
              <Icon size={19} strokeWidth={1.8} /><span>{t(pageTitleKey[itemPage])}</span>{page === itemPage && <span className="active-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="store-chip"><span className="store-avatar">Q</span><span><strong>{isEn ? 'Qutoof Boutique' : 'بوتيك قطوف'}</strong><small>{t('branch')}</small></span><ChevronDown size={15} /></div>
          <div className="sidebar-footnote"><span className="status-pulse" />{isEn ? 'Local demo mode' : 'نسخة محلية تجريبية'}</div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar no-print">
          <div className="topbar-context"><span>{t('branch')}</span><span className="context-divider">/</span><strong>{t(pageTitleKey[page])}</strong></div>
          <div className="topbar-actions">
            <span className="local-indicator"><span />{t('today')}</span>
            <button className="icon-button" onClick={() => setLocale(isEn ? 'ar' : 'en')} aria-label={t('language')} title={t('language')}><Languages size={18} /><span className="action-word">{t('language')}</span></button>
            <button className="icon-button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? t('themeLight') : t('themeDark')} title={theme === 'dark' ? t('themeLight') : t('themeDark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</button>
            <button className="reset-button" onClick={resetDemo}><RotateCcw size={15} /><span>{t('reset')}</span></button>
          </div>
        </header>

        <div className="content-wrap">
          <div className="page-intro no-print"><div><div className="eyebrow"><span className="eyebrow-line" />{t('brandTag')}</div><h1>{pageHeading}</h1><p>{page === 'dashboard' ? t('dashboardSub') : page === 'inventory' ? t('catalogSub') : page === 'pos' ? t('posSub') : page === 'sales' ? t('salesSub') : page === 'returns' ? t('returnsSub') : t('reportsSub')}</p></div>
            {page === 'inventory' && <button className="button button-primary" onClick={() => { if (store.products.length >= MAX_PRODUCTS) window.alert(PRODUCT_LIMIT_MESSAGE); else setShowProductForm(true); }}><Plus size={17} />{t('addProduct')}</button>}
            {page === 'pos' && <span className="limit-pill"><span className="limit-dot" />{store.invoices.length}/{MAX_INVOICES} {t('invoiceCount')}</span>}
          </div>

          {notice && <div role="status" className="toast no-print"><Check size={16} />{notice}<button onClick={() => setNotice('')} aria-label="Close"><X size={15} /></button></div>}
          <div className="demo-banner no-print"><CircleHelp size={16} /><span>{t('demoNotice')}</span><span className="banner-spacer" />{page === 'inventory' && <strong>{store.products.length}/{MAX_PRODUCTS} {t('productCap')}</strong>}</div>

          {page === 'dashboard' && <DashboardView {...{ t, money, dateTime, todayGross, todayInvoices, store, lowStockVariants, stockValue, invoiceDays, totalDaySales, topProducts, isEn, routeFor, triggerPrint }} />}
          {page === 'inventory' && <InventoryView {...{ t, money, isEn, store, filter, setFilter, searchTerm, setSearchTerm, filteredProducts, categoryLabel, setShowProductForm }} />}
          {page === 'pos' && <PosView {...{ t, money, isEn, filter, setFilter, searchTerm, setSearchTerm, filteredProducts, categoryLabel, selectedVariants, setSelectedVariants, addToCart, cartLines, cart, adjustCart, unitCount, cartTotal, saleUnit, setSaleUnit, payment, setPayment, completeSale, invoiceLimitReached, scanTerm, setScanTerm, handleScan }} />}
          {page === 'sales' && <SalesView {...{ t, money, dateTime, isEn, store, triggerPrint }} />}
          {page === 'returns' && <ReturnsView {...{ t, money, dateTime, isEn, store, returnOnePiece }} />}
          {page === 'reports' && <ReportsView {...{ t, money, store, netSales, returnedValue, totalUnitsSold, invoiceDays, totalDaySales, topProducts, isEn, categoryLabel }} />}

          <footer className="site-footer no-print"><span>© {new Date().getFullYear()} Qutoof Solutions</span><span>{t('demoNotice')}</span></footer>
        </div>
      </main>

      {showProductForm && <div className="modal-backdrop no-print" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowProductForm(false); }}><form className="modal-card product-modal" onSubmit={addProduct}>
        <div className="modal-heading"><div><span className="eyebrow">{t('inventory')}</span><h2>{t('addProduct')}</h2></div><button type="button" className="icon-button" onClick={() => setShowProductForm(false)}><X size={18} /></button></div>
        <div className="form-grid"><label>{t('productNameAr')}<input required autoFocus value={productForm.nameAr} onChange={(event) => setProductForm({ ...productForm, nameAr: event.target.value })} placeholder={t('productNameAr')} /></label><label>{t('productNameEn')}<input required value={productForm.nameEn} onChange={(event) => setProductForm({ ...productForm, nameEn: event.target.value })} placeholder={t('productNameEn')} /></label></div>
        <label>{t('category')}<select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value as Product['category'] })}><option value="clothing">{t('clothing')}</option><option value="shoes">{t('shoes')}</option><option value="accessories">{t('accessories')}</option></select></label>
        <div className="form-grid"><label>{t('sizes')}<input value={productForm.sizes} onChange={(event) => setProductForm({ ...productForm, sizes: event.target.value })} /></label><label>{t('colors')}<input value={productForm.colors} onChange={(event) => setProductForm({ ...productForm, colors: event.target.value })} /></label></div>
        <div className="form-grid"><label>{t('unitPrice')}<input type="number" min="0" required value={productForm.unitPrice} onChange={(event) => setProductForm({ ...productForm, unitPrice: event.target.value })} /></label><label>{t('dozenPrice')}<input type="number" min="0" required value={productForm.dozenPrice} onChange={(event) => setProductForm({ ...productForm, dozenPrice: event.target.value })} /></label></div>
        <label>{t('openingStock')}<input type="number" min="0" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label>
        <div className="modal-actions"><button type="button" className="button button-quiet" onClick={() => setShowProductForm(false)}>{t('cancel')}</button><button className="button button-primary" type="submit"><Plus size={16} />{t('saveProduct')}</button></div>
      </form></div>}

      {printTarget && <ReceiptPrint invoice={printTarget} isEn={isEn} money={money} dateTime={dateTime} t={t} />}
    </div>
  );
}

function loadInitialStore(): DemoStore {
  if (typeof window === 'undefined') return createSeedStore();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const seed = createSeedStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const store = JSON.parse(saved) as DemoStore;
    if (store.version !== 1 || !Array.isArray(store.products) || !Array.isArray(store.invoices) || !Array.isArray(store.returns)) throw new Error('Invalid demo data');
    return store;
  } catch {
    const seed = createSeedStore();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed)); } catch { /* Continue with in-memory data. */ }
    return seed;
  }
}

type CommonProps = { t: (key: keyof typeof copy.ar) => string; money: (value: number) => string; isEn: boolean };

function DashboardView(props: CommonProps & {
  dateTime: (value: string) => string; todayGross: number; todayInvoices: Invoice[]; store: DemoStore;
  lowStockVariants: { product: Product; variant: ProductVariant }[]; stockValue: number;
  invoiceDays: { label: string; value: number }[]; totalDaySales: number;
  topProducts: { product: Product; count: number }[]; routeFor: (page: Page) => string;
  triggerPrint: (invoice: Invoice) => void;
}) {
  const { t, money, dateTime, todayGross, todayInvoices, store, lowStockVariants, stockValue, invoiceDays, totalDaySales, topProducts, isEn, routeFor, triggerPrint } = props;
  const metricCards = [
    { label: t('todaySales'), value: money(todayGross), icon: Wallet, trend: '+12.8%', tone: 'gold' },
    { label: t('invoiceCount'), value: String(todayInvoices.length), icon: ReceiptIcon, trend: isEn ? 'Today' : 'اليوم', tone: 'blue' },
    { label: t('totalProducts'), value: String(store.products.length), icon: ShoppingBag, trend: `${store.products.reduce((sum, product) => sum + product.variants.length, 0)} ${isEn ? 'variants' : 'متغير'}`, tone: 'violet' },
    { label: t('stockValue'), value: money(stockValue), icon: Boxes, trend: `${lowStockVariants.length} ${t('lowStock')}`, tone: 'green' },
  ];
  return <>
    <section className="metrics-grid no-print">{metricCards.map(({ label, value, icon: Icon, trend, tone }) => <article className={`metric-card metric-${tone}`} key={label}><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={18} /></span></div><strong>{value}</strong><div className="metric-foot"><TrendingUp size={14} /><span>{trend}</span></div></article>)}</section>
    <section className="dashboard-grid no-print">
      <article className="panel chart-panel"><div className="section-heading"><div><h2>{t('salesTrend')}</h2><p>{isEn ? 'A seven-day view of store activity' : 'مؤشر المبيعات اليومية لآخر أسبوع'}</p></div><span className="tag-small">{isEn ? '7 days' : '7 أيام'}</span></div><div className="bar-chart">{invoiceDays.map((day, index) => <div className="bar-column" key={`${day.label}-${index}`}><div className="bar-value">{day.value ? money(day.value) : ''}</div><div className="bar-track"><div className={`bar-fill ${index === invoiceDays.length - 1 ? 'bar-today' : ''}`} style={{ height: `${Math.max(5, (day.value / totalDaySales) * 100)}%` }} /></div><span>{day.label}</span></div>)}</div></article>
      <article className="panel quick-panel"><div className="section-heading"><div><h2>{t('quickActions')}</h2><p>{isEn ? 'Jump right into daily work' : 'اختصارات تساعدك على إنجاز المهام'}</p></div></div><a className="quick-action quick-action-main" href={routeFor('pos')}><span className="quick-icon"><Barcode size={19} /></span><span><strong>{t('startSale')}</strong><small>{isEn ? 'Scan and check out' : 'امسح الباركود وأكمل البيع'}</small></span><ArrowUpRight size={17} /></a><a className="quick-action" href={routeFor('inventory')}><span className="quick-icon"><Package size={18} /></span><span><strong>{t('manageStock')}</strong><small>{isEn ? 'Sizes, colors and stock' : 'المقاسات والألوان والكمية'}</small></span><ArrowUpRight size={17} /></a><a className="quick-action" href={routeFor('reports')}><span className="quick-icon"><BarChart3 size={18} /></span><span><strong>{t('seeReports')}</strong><small>{isEn ? 'Track your sales' : 'تابع أداء بوتيكك'}</small></span><ArrowUpRight size={17} /></a></article>
    </section>
    <section className="dashboard-grid lower-grid no-print"><article className="panel table-panel"><div className="section-heading"><div><h2>{t('recentSales')}</h2><p>{isEn ? 'Latest transactions in your boutique' : 'أحدث عمليات البيع المسجلة'}</p></div><a className="text-link" href={routeFor('sales')}>{t('viewAll')}<ArrowUpRight size={14} /></a></div><InvoiceTable {...{ t, money, dateTime, isEn, invoices: store.invoices.slice(0, 5), onPrint: triggerPrint }} compact /></article>
      <article className="panel top-products-panel"><div className="section-heading"><div><h2>{t('topProducts')}</h2><p>{isEn ? 'By units sold' : 'حسب عدد القطع المباعة'}</p></div><ShoppingBag size={17} className="muted-icon" /></div><div className="rank-list">{topProducts.slice(0, 4).map(({ product, count }, index) => <div className="rank-row" key={product.id}><span className={`rank-number rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span><span className="rank-glyph" style={{ background: product.accent }}>{product.glyph}</span><span className="rank-name"><strong>{productName(product, isEn ? 'en' : 'ar')}</strong><small>{categoryLabelFor(product.category, isEn)}</small></span><b>{count} {t('pieces')}</b></div>)}</div><div className="low-stock-note"><span className="warning-dot" /><span>{lowStockVariants.length} {t('lowStock')}</span><span className="banner-spacer" /><a href={routeFor('inventory')}>{t('manageStock')}</a></div></article></section>
  </>;
}

function ReceiptIcon(props: ComponentProps<typeof Wallet>) { return <Wallet {...props} />; }
function categoryLabelFor(category: Product['category'], isEn: boolean) { return category === 'clothing' ? (isEn ? 'Clothing' : 'ملابس') : category === 'shoes' ? (isEn ? 'Shoes' : 'أحذية') : (isEn ? 'Accessories' : 'إكسسوارات'); }

function InventoryView(props: CommonProps & {
  store: DemoStore; filter: CategoryFilter; setFilter: (filter: CategoryFilter) => void;
  searchTerm: string; setSearchTerm: (value: string) => void; filteredProducts: Product[];
  categoryLabel: (category: Product['category']) => string; setShowProductForm: (show: boolean) => void;
}) {
  const { t, money, isEn, store, filter, setFilter, searchTerm, setSearchTerm, filteredProducts, categoryLabel } = props;
  return <section className="panel inventory-panel no-print"><div className="inventory-toolbar"><div className="search-field"><Search size={17} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={t('searchProducts')} /></div><div className="filter-tabs">{(['all', 'clothing', 'shoes', 'accessories'] as CategoryFilter[]).map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'all' ? t('all') : categoryLabel(item)}</button>)}</div></div>
    <div className="inventory-meta"><span>{filteredProducts.length} {t('totalProducts')}</span><span>{isEn ? 'Stored locally' : 'محفوظ محلياً'} · {store.products.length}/{MAX_PRODUCTS}</span></div>
    {filteredProducts.length ? <div className="product-grid">{filteredProducts.map((product) => <article className="product-card" key={product.id}><div className="product-card-head"><span className="product-glyph" style={{ background: product.accent }}>{product.glyph}</span><div className="product-card-name"><strong>{productName(product, isEn ? 'en' : 'ar')}</strong><span>{product.sku} · {categoryLabel(product.category)}</span></div><button className="mini-more" aria-label={t('action')}><ChevronDown size={16} /></button></div><div className="product-price-line"><strong>{money(product.unitPrice)}</strong><span>/{t('piece')}</span><span className="dozen-price">{money(product.dozenPrice)} / {t('dozen')}</span></div><div className="variant-list">{product.variants.map((variant) => <div className="variant-row" key={variant.id}><span className="variant-size">{variant.size}</span><span className="color-name"><i className={`swatch swatch-${Math.abs(variant.color.length * 7) % 5}`} />{variant.color}</span><span className="variant-stock">{variant.stock} {t('pieces')}</span><span className="variant-barcode"><Barcode size={13} />{variant.barcode}</span></div>)}</div><div className="product-card-foot"><span className={`stock-status ${totalStock(product) < 15 ? 'stock-warn' : ''}`}><i />{totalStock(product)} {t('unitsLeft')}</span><span>{product.variants.length} {isEn ? 'variants' : 'مقاس/لون'}</span></div></article>)}</div> : <div className="empty-state"><Package size={30} /><strong>{t('noProducts')}</strong></div>}
  </section>;
}

function PosView(props: CommonProps & {
  filter: CategoryFilter; setFilter: (filter: CategoryFilter) => void; searchTerm: string; setSearchTerm: (value: string) => void;
  filteredProducts: Product[]; categoryLabel: (category: Product['category']) => string; selectedVariants: Record<string, string>; setSelectedVariants: (value: Record<string, string>) => void;
  addToCart: (product: Product, variant: ProductVariant, unit?: SaleUnit) => void; cartLines: (CartLine & { product: Product; variant: ProductVariant; unitPrice: number })[];
  cart: CartLine[]; adjustCart: (line: CartLine, delta: number) => void; unitCount: number; cartTotal: number; saleUnit: SaleUnit; setSaleUnit: (unit: SaleUnit) => void;
  payment: Invoice['payment']; setPayment: (payment: Invoice['payment']) => void; completeSale: () => void; invoiceLimitReached: boolean;
  scanTerm: string; setScanTerm: (value: string) => void; handleScan: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  const { t, money, isEn, filter, setFilter, searchTerm, setSearchTerm, filteredProducts, categoryLabel, selectedVariants, setSelectedVariants, addToCart, cartLines, cart, adjustCart, unitCount, cartTotal, saleUnit, setSaleUnit, payment, setPayment, completeSale, invoiceLimitReached, scanTerm, setScanTerm, handleScan } = props;
  return <section className="pos-layout no-print"><div className="pos-catalog panel"><div className="pos-search-row"><div className="search-field scan-search"><Barcode size={18} /><input value={scanTerm || searchTerm} onChange={(event) => { setScanTerm(event.target.value); setSearchTerm(event.target.value); }} onKeyDown={handleScan} placeholder={t('scanCode')} autoFocus /><kbd>ENTER</kbd></div><div className="scanner-tip"><Check size={14} />{t('scannerHint')}</div></div><div className="filter-tabs pos-filters">{(['all', 'clothing', 'shoes', 'accessories'] as CategoryFilter[]).map((item) => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'all' ? t('all') : categoryLabel(item)}</button>)}</div><div className="pos-product-grid">{filteredProducts.map((product) => { const selectedId = selectedVariants[product.id] ?? product.variants[0]?.id; const selected = product.variants.find((variant) => variant.id === selectedId) ?? product.variants[0]; return <article className="pos-product-card" key={product.id}><div className="pos-product-visual" style={{ background: `linear-gradient(145deg, ${product.accent} 0%, #1b1c20 90%)` }}><span>{product.glyph}</span><small>{categoryLabel(product.category)}</small></div><div className="pos-product-info"><strong>{productName(product, isEn ? 'en' : 'ar')}</strong><span>{money(saleUnit === 'dozen' ? product.dozenPrice : product.unitPrice)} / {saleUnit === 'dozen' ? t('dozen') : t('piece')}</span><select value={selected?.id ?? ''} onChange={(event) => setSelectedVariants({ ...selectedVariants, [product.id]: event.target.value })} aria-label={t('chooseVariant')}>{product.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.size} · {variant.color} · {variant.stock} {t('pieces')}</option>)}</select><button className="button button-card-add" onClick={() => selected && addToCart(product, selected, saleUnit)} disabled={!selected || selected.stock < (saleUnit === 'dozen' ? 12 : 1)}><Plus size={15} />{t('addToCart')}</button></div></article>; })}</div></div>
    <aside className="cart-panel panel"><div className="cart-head"><div><h2>{t('cart')}</h2><span>{cart.length} {isEn ? 'lines' : 'بنود'} · {unitCount} {t('pieces')}</span></div><span className="cart-count">{cart.length}</span></div><div className="cart-unit-toggle"><span>{t('sellBy')}</span><div><button className={saleUnit === 'piece' ? 'active' : ''} onClick={() => setSaleUnit('piece')}>{t('piece')}</button><button className={saleUnit === 'dozen' ? 'active' : ''} onClick={() => setSaleUnit('dozen')}>{t('dozen')}</button></div></div>
      {invoiceLimitReached && <div className="limit-warning"><strong>{t('invoiceLimitTitle')}</strong><span>{t('invoiceLimitSub')}</span></div>}
      <div className="cart-lines">{cartLines.length ? cartLines.map((line) => <div className="cart-line" key={`${line.productId}-${line.variantId}-${line.unit}`}><span className="cart-line-glyph" style={{ background: line.product.accent }}>{line.product.glyph}</span><div className="cart-line-main"><strong>{productName(line.product, isEn ? 'en' : 'ar')}</strong><span>{line.variant.size} · {line.variant.color} · {line.unit === 'dozen' ? t('dozen') : t('piece')}</span><small>{money(line.unitPrice)} × {line.quantity}</small></div><div className="cart-line-actions"><strong>{money(line.unitPrice * line.quantity)}</strong><div className="quantity-control"><button onClick={() => adjustCart(line, -1)} aria-label={t('remove')}><Minus size={12} /></button><span>{line.quantity}</span><button onClick={() => adjustCart(line, 1)} aria-label={t('quantity')}><Plus size={12} /></button></div></div></div>) : <div className="cart-empty"><span><ShoppingBag size={25} /></span><strong>{t('emptyCart')}</strong><small>{t('scanCode')}</small></div>}</div>
      <div className="cart-checkout"><div className="payment-label">{t('paymentMethod')}</div><div className="payment-options">{(['cash', 'card', 'transfer'] as Invoice['payment'][]).map((item) => { const Icon = item === 'cash' ? Wallet : item === 'card' ? CreditCard : ArrowDownLeft; return <button key={item} className={payment === item ? 'selected' : ''} onClick={() => setPayment(item)}><Icon size={15} />{t(item)}</button>; })}</div><div className="total-line"><span>{t('subtotal')}</span><span>{money(cartTotal)}</span></div><div className="total-line total-final"><strong>{t('total')}</strong><strong>{money(cartTotal)}</strong></div><button className="button button-primary checkout-button" onClick={completeSale} disabled={!cart.length || invoiceLimitReached}><span>{t('completePayment')}</span><span>{money(cartTotal)}<ArrowUpRight size={16} /></span></button><small className="checkout-note"><Check size={13} />{t('taxNote')}</small></div>
    </aside></section>;
}

function SalesView(props: CommonProps & { dateTime: (value: string) => string; store: DemoStore; triggerPrint: (invoice: Invoice) => void }) {
  const { t, money, dateTime, isEn, store, triggerPrint } = props;
  return <section className="panel table-panel full-table no-print"><div className="section-heading"><div><h2>{t('salesTitle')}</h2><p>{store.invoices.length}/{MAX_INVOICES} {isEn ? 'demo invoices used' : 'فاتورة من حد التجربة'}</p></div><span className="tag-small tag-green"><span />{isEn ? 'Local data' : 'بيانات محلية'}</span></div>{store.invoices.length ? <InvoiceTable {...{ t, money, dateTime, isEn, invoices: store.invoices, onPrint: triggerPrint }} /> : <div className="empty-state"><Wallet size={30} /><strong>{t('noSales')}</strong></div>}</section>;
}

function InvoiceTable(props: { t: (key: keyof typeof copy.ar) => string; money: (value: number) => string; dateTime: (value: string) => string; isEn: boolean; invoices: Invoice[]; onPrint: (invoice: Invoice) => void; compact?: boolean }) {
  const { t, money, dateTime, invoices, onPrint, compact } = props;
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>{t('invoice')}</th><th>{t('date')}</th>{!compact && <th>{t('customer')}</th>}<th>{t('items')}</th><th>{t('payment')}</th><th>{t('total')}</th><th>{t('action')}</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td><strong className="invoice-code">{invoice.number}</strong></td><td>{dateTime(invoice.date)}</td>{!compact && <td>{invoice.customer}</td>}<td><span className="count-pill">{invoice.items.reduce((sum, item) => sum + piecesSold(item), 0)} {t('pieces')}</span></td><td><span className="pay-type">{t(invoice.payment)}</span></td><td><strong>{money(invoice.total)}</strong></td><td><button className="table-action" onClick={() => onPrint(invoice)}><Printer size={14} />{t('print')}</button></td></tr>)}</tbody></table></div>;
}

function ReturnsView(props: CommonProps & { dateTime: (value: string) => string; store: DemoStore; returnOnePiece: (invoice: Invoice) => void }) {
  const { t, money, dateTime, isEn, store, returnOnePiece } = props;
  const eligibleInvoices = store.invoices.filter((invoice) => invoice.items.some((item) => item.returnedPieces < piecesSold(item)));
  return <div className="returns-layout no-print"><section className="panel table-panel full-table"><div className="section-heading"><div><h2>{t('returnable')}</h2><p>{isEn ? 'Select an invoice to return one piece' : 'اختر فاتورة لتسجيل إرجاع قطعة واحدة'}</p></div><span className="tag-small">{eligibleInvoices.length} {t('invoiceCount')}</span></div>{eligibleInvoices.length ? <div className="return-invoice-list">{eligibleInvoices.map((invoice) => { const item = invoice.items.find((line) => line.returnedPieces < piecesSold(line))!; return <article className="return-invoice-card" key={invoice.id}><span className="return-icon"><RotateCcw size={18} /></span><div className="return-invoice-info"><strong>{invoice.number} · {isEn ? item.nameEn : item.nameAr}</strong><span>{dateTime(invoice.date)} · {item.size} · {item.color}</span><small>{t('total')}: {money(invoice.total)}</small></div><button className="button button-quiet" onClick={() => returnOnePiece(invoice)}><RotateCcw size={15} />{t('returnOne')}</button></article>; })}</div> : <div className="empty-state"><RotateCcw size={30} /><strong>{t('nothingToReturn')}</strong></div>}</section>
    <section className="panel table-panel full-table"><div className="section-heading"><div><h2>{t('returnHistory')}</h2><p>{isEn ? 'Returned pieces are added back to inventory' : 'تُضاف القطع المرتجعة مجدداً إلى المخزون'}</p></div><span className="tag-small tag-orange">{store.returns.length} {isEn ? 'returns' : 'مرتجع'}</span></div>{store.returns.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>{t('invoice')}</th><th>{t('date')}</th><th>{t('product')}</th><th>{t('variant')}</th><th>{t('quantity')}</th><th>{t('returnAmount')}</th></tr></thead><tbody>{store.returns.map((item) => <tr key={item.id}><td><strong className="invoice-code">{item.invoiceNumber}</strong></td><td>{dateTime(item.date)}</td><td>{isEn ? item.productNameEn : item.productNameAr}</td><td>{item.size} · {item.color}</td><td>{item.quantity} {t('pieces')}</td><td><strong className="return-amount">− {money(item.amount)}</strong></td></tr>)}</tbody></table></div> : <div className="empty-state"><RotateCcw size={30} /><strong>{t('noReturns')}</strong></div>}</section></div>;
}

function ReportsView(props: CommonProps & { store: DemoStore; netSales: number; returnedValue: number; totalUnitsSold: number; invoiceDays: { label: string; value: number }[]; totalDaySales: number; topProducts: { product: Product; count: number }[]; categoryLabel: (category: Product['category']) => string }) {
  const { t, money, store, netSales, returnedValue, totalUnitsSold, invoiceDays, totalDaySales, topProducts, isEn, categoryLabel } = props;
  const average = store.invoices.length ? Math.round(store.invoices.reduce((sum, invoice) => sum + invoice.total, 0) / store.invoices.length) : 0;
  const categoryCounts = (['clothing', 'shoes', 'accessories'] as Product['category'][]).map((category) => ({ category, count: store.products.filter((product) => product.category === category).reduce((sum, product) => sum + totalStock(product), 0) }));
  const totalStockCount = Math.max(1, categoryCounts.reduce((sum, item) => sum + item.count, 0));
  return <div className="reports-page no-print"><section className="report-metrics"><article className="report-metric"><span>{t('netSales')}</span><strong>{money(netSales)}</strong><small><TrendingUp size={13} />{store.invoices.length} {t('invoiceCount')}</small></article><article className="report-metric"><span>{t('returnsValue')}</span><strong>{money(returnedValue)}</strong><small><RotateCcw size={13} />{store.returns.length} {isEn ? 'returns' : 'مرتجع'}</small></article><article className="report-metric"><span>{t('averageOrder')}</span><strong>{money(average)}</strong><small><Wallet size={13} />{t('completed')}</small></article><article className="report-metric"><span>{t('unitsSold')}</span><strong>{totalUnitsSold}</strong><small><ShoppingBag size={13} />{t('pieces')}</small></article></section>
    <section className="dashboard-grid report-grid"><article className="panel chart-panel"><div className="section-heading"><div><h2>{t('dailyTrend')}</h2><p>{isEn ? 'Daily gross sales before returns' : 'إجمالي المبيعات اليومية قبل المرتجعات'}</p></div><span className="tag-small">7 {isEn ? 'days' : 'أيام'}</span></div><div className="bar-chart tall-chart">{invoiceDays.map((day, index) => <div className="bar-column" key={`${day.label}-${index}`}><div className="bar-value">{day.value ? money(day.value) : '—'}</div><div className="bar-track"><div className={`bar-fill ${index === invoiceDays.length - 1 ? 'bar-today' : ''}`} style={{ height: `${Math.max(4, day.value / totalDaySales * 100)}%` }} /></div><span>{day.label}</span></div>)}</div></article>
      <article className="panel inventory-mix"><div className="section-heading"><div><h2>{t('inventoryMix')}</h2><p>{totalStockCount} {t('unitsLeft')}</p></div><Boxes size={17} className="muted-icon" /></div>{categoryCounts.map(({ category, count }, index) => <div className="mix-row" key={category}><div><span>{categoryLabel(category)}</span><strong>{count}</strong></div><div className="mix-track"><span className={`mix-fill mix-${index}`} style={{ width: `${count / totalStockCount * 100}%` }} /></div></div>)}<div className="mix-total"><span>{t('stockValue')}</span><strong>{money(store.products.reduce((sum, product) => sum + product.variants.reduce((inner, variant) => inner + variant.stock * product.unitPrice, 0), 0))}</strong></div></article></section>
    <section className="panel table-panel top-table"><div className="section-heading"><div><h2>{t('topFive')}</h2><p>{isEn ? 'Products ranked by units sold' : 'ترتيب الأصناف حسب القطع المباعة'}</p></div><BarChart3 size={18} className="muted-icon" /></div><div className="rank-list report-rank">{topProducts.map(({ product, count }, index) => <div className="rank-row" key={product.id}><span className={`rank-number rank-${index + 1}`}>{String(index + 1).padStart(2, '0')}</span><span className="rank-glyph" style={{ background: product.accent }}>{product.glyph}</span><span className="rank-name"><strong>{productName(product, isEn ? 'en' : 'ar')}</strong><small>{categoryLabel(product.category)}</small></span><div className="rank-bar"><span style={{ width: `${Math.max(5, count / Math.max(1, topProducts[0]?.count ?? 1) * 100)}%` }} /></div><b>{count} {t('pieces')}</b></div>)}</div></section></div>;
}

function ReceiptPrint(props: { invoice: Invoice; isEn: boolean; money: (amount: number) => string; dateTime: (value: string) => string; t: (key: keyof typeof copy.ar) => string }) {
  const { invoice, isEn, money, dateTime, t } = props;
  return <div className="receipt-print"><div className="receipt-brand"><span className="brand-mark">Q</span><strong>Qutoof Solutions</strong><small>{isEn ? 'Boutique POS' : 'نقطة بيع البوتيك'}</small></div><div className="receipt-divider" /><div className="receipt-meta"><span>{t('invoice')}: <strong>{invoice.number}</strong></span><span>{dateTime(invoice.date)}</span><span>{t('customer')}: {invoice.customer}</span></div><div className="receipt-divider" /><div className="receipt-items">{invoice.items.map((item) => <div className="receipt-item" key={item.id}><div><strong>{isEn ? item.nameEn : item.nameAr}</strong><small>{item.size} · {item.color} · {item.quantity} {item.unit === 'dozen' ? t('dozen') : t('piece')}</small></div><strong>{money(item.amount)}</strong></div>)}</div><div className="receipt-divider" /><div className="receipt-total"><span>{t('total')}</span><strong>{money(invoice.total)}</strong></div><div className="receipt-payment">{t('paymentMethod')}: {t(invoice.payment)}</div><div className="receipt-thanks">{isEn ? 'Thank you for shopping with us' : 'شكراً لتسوقكم من بوتيك قطوف'}</div><div className="receipt-watermark">{PRINT_NOTICE}</div></div>;
}
