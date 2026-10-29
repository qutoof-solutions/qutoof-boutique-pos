export type Category = "clothing" | "shoes" | "accessories";
export type SaleUnit = "piece" | "dozen";

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  barcode: string;
  stock: number;
};

export type Product = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: Category;
  sku: string;
  unitPrice: number;
  dozenPrice: number;
  accent: string;
  glyph: string;
  variants: ProductVariant[];
};

export type InvoiceLine = {
  id: string;
  productId: string;
  variantId: string;
  nameAr: string;
  nameEn: string;
  size: string;
  color: string;
  barcode: string;
  quantity: number;
  unit: SaleUnit;
  unitPrice: number;
  amount: number;
  returnedPieces: number;
};

export type Invoice = {
  id: string;
  number: string;
  date: string;
  items: InvoiceLine[];
  subtotal: number;
  total: number;
  payment: "cash" | "card" | "transfer";
  customer: string;
};

export type ReturnEvent = {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  productNameAr: string;
  productNameEn: string;
  size: string;
  color: string;
  quantity: number;
  amount: number;
};

export type DemoStore = {
  version: 1;
  products: Product[];
  invoices: Invoice[];
  returns: ReturnEvent[];
};

export const STORAGE_KEY = "qutoof-boutique-demo-v1";
export const MAX_PRODUCTS = 15;
export const MAX_INVOICES = 20;
export const PRINT_NOTICE = "نسخة تجريبية Qutoof Solutions - غير مخصصة للاستخدام التجاري الرسمي";
export const PRODUCT_LIMIT_MESSAGE = "هذه نسخة تجريبية، يرجى الترقية للنسخة الكاملة لعدد لا محدود من الأصناف.";
export const INVOICE_LIMIT_MESSAGE = "هذه نسخة تجريبية، يرجى الترقية للنسخة الكاملة لإنشاء عدد لا محدود من الفواتير.";

const ago = (days: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 20, 0, 0);
  return date.toISOString();
};

function variants(product: string, prefix: string, sizes: string[], colors: string[], baseStock: number): ProductVariant[] {
  let index = 1;
  return colors.flatMap((color) => sizes.map((size) => {
    const id = `${product}-${color.toLowerCase().replace(/\s+/g, "-")}-${size.toLowerCase()}`;
    const barcode = `${prefix}${String(index++).padStart(5, "0")}`;
    return { id, size, color, barcode, stock: baseStock + index % 5 };
  }));
}

const polo: Product = {
  id: "prod-polo", nameAr: "تيشيرت بولو كلاسيك", nameEn: "Classic Polo Shirt", category: "clothing", sku: "QT-POLO-01", unitPrice: 89, dozenPrice: 960, accent: "#4c6b61", glyph: "◒",
  variants: variants("polo", "6291001", ["S", "M", "L", "XL"], ["أسود", "كحلي"], 7),
};
const jeans: Product = {
  id: "prod-jeans", nameAr: "بنطلون جينز ستريت", nameEn: "Street Denim Jeans", category: "clothing", sku: "QT-JEAN-02", unitPrice: 179, dozenPrice: 1940, accent: "#466482", glyph: "▤",
  variants: variants("jeans", "6291002", ["30", "32", "34", "36"], ["أزرق دنيم", "أسود"], 5),
};
const sneakers: Product = {
  id: "prod-sneakers", nameAr: "حذاء سنيكرز يومي", nameEn: "Everyday Sneakers", category: "shoes", sku: "QT-SNK-03", unitPrice: 249, dozenPrice: 2740, accent: "#80705f", glyph: "◡",
  variants: variants("sneakers", "6291003", ["40", "41", "42", "43", "44"], ["أبيض", "رمادي"], 4),
};
const dress: Product = {
  id: "prod-dress", nameAr: "فستان ميدي ناعم", nameEn: "Soft Midi Dress", category: "clothing", sku: "QT-DRS-04", unitPrice: 229, dozenPrice: 2480, accent: "#8b5862", glyph: "♧",
  variants: variants("dress", "6291004", ["S", "M", "L", "XL"], ["وردي ترابي", "أسود"], 4),
};
const hoodie: Product = {
  id: "prod-hoodie", nameAr: "هودي قطني يومي", nameEn: "Everyday Cotton Hoodie", category: "clothing", sku: "QT-HDY-05", unitPrice: 159, dozenPrice: 1680, accent: "#74705e", glyph: "⌂",
  variants: variants("hoodie", "6291005", ["S", "M", "L", "XL"], ["زيتي", "رمادي"], 6),
};
const abaya: Product = {
  id: "prod-abaya", nameAr: "عباية لينن خفيفة", nameEn: "Light Linen Abaya", category: "clothing", sku: "QT-ABA-06", unitPrice: 319, dozenPrice: 3480, accent: "#615b73", glyph: "◌",
  variants: variants("abaya", "6291006", ["54", "56", "58", "60"], ["أسود", "موكا"], 3),
};
const socks: Product = {
  id: "prod-socks", nameAr: "جوارب قطنية يومية", nameEn: "Daily Cotton Socks", category: "accessories", sku: "QT-SOC-07", unitPrice: 19, dozenPrice: 180, accent: "#6f7e91", glyph: "≋",
  variants: variants("socks", "6291007", ["مقاس موحد"], ["أبيض", "أسود"], 12),
};
const bag: Product = {
  id: "prod-bag", nameAr: "حقيبة كتف صغيرة", nameEn: "Mini Shoulder Bag", category: "accessories", sku: "QT-BAG-08", unitPrice: 139, dozenPrice: 1440, accent: "#886b4e", glyph: "▱",
  variants: variants("bag", "6291008", ["مقاس موحد"], ["جملي", "أسود"], 4),
};

const allProducts = [polo, jeans, sneakers, dress, hoodie, abaya, socks, bag];

function line(productId: string, variantId: string, quantity: number, unit: SaleUnit = "piece"): InvoiceLine {
  const product = allProducts.find((entry) => entry.id === productId)!;
  const variant = product.variants.find((entry) => entry.id === variantId)!;
  const unitPrice = unit === "dozen" ? product.dozenPrice : product.unitPrice;
  return {
    id: `${productId}-${variantId}-${Math.random().toString(36).slice(2, 7)}`,
    productId, variantId, nameAr: product.nameAr, nameEn: product.nameEn,
    size: variant.size, color: variant.color, barcode: variant.barcode, quantity, unit, unitPrice,
    amount: unitPrice * quantity, returnedPieces: 0,
  };
}

function invoice(number: string, daysAgo: number, hour: number, items: InvoiceLine[], payment: Invoice["payment"], customer: string): Invoice {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return { id: `inv-${number}`, number, date: ago(daysAgo, hour), items, subtotal: total, total, payment, customer };
}

export function createSeedStore(): DemoStore {
  const invoices: Invoice[] = [
    invoice("QT-1024", 0, 10, [line(polo.id, polo.variants[1].id, 1), line(socks.id, socks.variants[0].id, 2)], "cash", "عميل نقدي"),
    invoice("QT-1023", 0, 9, [line(jeans.id, jeans.variants[2].id, 1)], "card", "سارة م."),
    invoice("QT-1022", 1, 18, [line(sneakers.id, sneakers.variants[4].id, 1), line(bag.id, bag.variants[0].id, 1)], "transfer", "عميل نقدي"),
    invoice("QT-1021", 1, 15, [line(dress.id, dress.variants[3].id, 1)], "cash", "ريم ع."),
    invoice("QT-1020", 2, 13, [line(polo.id, polo.variants[5].id, 2, "piece"), line(hoodie.id, hoodie.variants[2].id, 1)], "card", "عميل نقدي"),
    invoice("QT-1019", 3, 11, [line(abaya.id, abaya.variants[4].id, 1), line(socks.id, socks.variants[1].id, 3)], "cash", "نورة س."),
  ];
  const returnedLine = invoices[3].items[0];
  returnedLine.returnedPieces = 1;
  const returns: ReturnEvent[] = [{
    id: "return-demo-1", invoiceId: invoices[3].id, invoiceNumber: invoices[3].number,
    date: ago(0, 12), productNameAr: returnedLine.nameAr, productNameEn: returnedLine.nameEn,
    size: returnedLine.size, color: returnedLine.color, quantity: 1, amount: returnedLine.unitPrice,
  }];
  return { version: 1, products: allProducts, invoices, returns };
}

export function loadStore(): DemoStore {
  if (typeof window === "undefined") return createSeedStore();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const fresh = createSeedStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const parsed = JSON.parse(saved) as DemoStore;
    if (parsed.version !== 1 || !Array.isArray(parsed.products) || !Array.isArray(parsed.invoices) || !Array.isArray(parsed.returns)) {
      const fresh = createSeedStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return parsed;
  } catch {
    const fresh = createSeedStore();
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh)); } catch { /* Storage may be blocked in private browsing. */ }
    return fresh;
  }
}

export function persistStore(store: DemoStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new CustomEvent("qutoof-boutique-change"));
  } catch {
    // The UI remains usable for the current session if browser storage is unavailable.
  }
}

export const totalStock = (product: Product) => product.variants.reduce((sum, variant) => sum + variant.stock, 0);
export const variantLabel = (variant: ProductVariant) => `${variant.size} · ${variant.color}`;
export const piecesSold = (item: InvoiceLine) => item.quantity * (item.unit === "dozen" ? 12 : 1);
