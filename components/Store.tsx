"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  ArrowLeft,
  Truck,
  MapPin,
  ShieldCheck,
  Zap,
  Menu,
  X,
  Plus,
  Minus,
  Trash2,
  Phone,
  Check,
} from "lucide-react";
import { money, Product } from "@/lib/products";
import Art from "./Art";
import CheckoutForm from "./CheckoutForm";
type Cart = Record<string, number>;
const Context = createContext<{
  cart: Cart;
  update: (id: string, n: number) => void;
  products: Product[];
}>({ cart: {}, update: () => {}, products: [] });
export function StoreProvider({
  children,
  products,
}: {
  children: ReactNode;
  products: Product[];
}) {
  const [cart, setCart] = useState<Cart>({});
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("pekan-cart") || "{}");
      setCart(
        Object.fromEntries(
          Object.entries(c).filter(
            ([id, n]) =>
              products.some((p) => p.id === id) &&
              Number.isInteger(n) &&
              Number(n) > 0 &&
              Number(n) <= 99,
          ),
        ) as Cart,
      );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("pekan-cart", JSON.stringify(cart));
      } catch {}
    }
  }, [cart, ready]);
  return (
    <Context.Provider
      value={{
        cart,
        products,
        update: (id, n) =>
          setCart((c) => {
            const next = { ...c };
            if (n <= 0) delete next[id];
            else next[id] = Math.min(n, 99);
            return next;
          }),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function Header() {
  const { cart } = useContext(Context);
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="topbar">
        مسیر تازه، تجربه‌ای متفاوت{" "}
        <span>
          ارسال به سراسر ایران <Truck size={14} />
        </span>
      </div>
      <header>
        <div className="header-main wrap">
          <Link href="/" className="brand">
            <span className="brand-mark">
              <Zap fill="currentColor" />
            </span>
            <span>
              پکن کالا<small>PEKAN KALA</small>
            </span>
          </Link>
          <nav className={open ? "nav open" : "nav"}>
            <Link href="/" onClick={() => setOpen(false)}>
              خانه
            </Link>
            <Link href="/products" onClick={() => setOpen(false)}>
              اسکوتر برقی
            </Link>
            <Link
              href="/products?category=accessory"
              onClick={() => setOpen(false)}
            >
              لوازم جانبی
            </Link>
            <Link href="/#delivery" onClick={() => setOpen(false)}>
              ارسال و تحویل
            </Link>
          </nav>
          <div className="header-actions">
            <Link
              className="icon-button"
              href="/products"
              aria-label="جستجوی محصولات"
            >
              <Search size={21} />
            </Link>
            <Link className="cart-link" href="/cart">
              <ShoppingBag size={21} />
              <span className="cart-label">سبد خرید</span>
              <b>{money(Object.values(cart).reduce((a, b) => a + b, 0))}</b>
            </Link>
            <button
              className="mobile-menu icon-button"
              aria-label="فهرست"
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="brand">
            پکن کالا <Zap className="gold" />
          </Link>
          <p>
            همراه شما در مسیرهای تازه.
            <br />
            اسکوتر برقی و لوازم جانبی برای زندگی شهری.
          </p>
          <span dir="ltr" className="gold">
            pekan-kala.ir
          </span>
        </div>
        <div>
          <h3>مسیرهای دسترسی</h3>
          <Link href="/products">همه محصولات</Link>
          <Link href="/cart">سبد خرید</Link>
          <Link href="/#delivery">راهنمای تحویل</Link>
        </div>
        <div>
          <h3>خرید آگاهانه</h3>
          <p>
            قیمت و موجودی توسط فروشگاه مدیریت می‌شوند.
            <br />
            پیش از خرید نهایی، اطلاعات باید تأیید شوند.
            <br />
            پرداخت آنلاین در این نسخه فعال نیست.
          </p>
        </div>
      </div>
      <div className="wrap footer-bottom">
        © پکن کالا <span>ساخته‌شده برای مسیر فردا</span>
      </div>
    </footer>
  );
}
export function Benefits() {
  return (
    <div className="benefits wrap">
      {[
        [Truck, "ارسال به سراسر ایران", "تحویل در هر کجای مسیر شما"],
        [MapPin, "تحویل از انبار تهران", "با رزرو آنلاین یا هماهنگی تلفنی"],
        [ShieldCheck, "انتخاب با اطمینان", "مشخصات روشن، انتخاب آگاهانه"],
        [Zap, "همراه زندگی شهری", "رفت‌وآمدی آسان‌تر و متفاوت"],
      ].map(([Icon, title, sub]) => {
        const I = Icon as typeof Truck;
        return (
          <div key={String(title)}>
            <I size={26} />
            <span>
              <strong>{String(title)}</strong>
              <small>{String(sub)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
export function ProductCard({ p }: { p: Product }) {
  return (
    <article className="product-card">
      <Link href={"/products/" + p.id} className="product-image">
        <span className={p.old ? "tag sale" : "tag"}>{p.tag}</span>
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        ) : (
          <Art product={p} />
        )}
        <span className="view-product">
          مشاهده محصول <ArrowLeft size={16} />
        </span>
      </Link>
      <div className="product-content">
        <small className="english">{p.en}</small>
        <Link href={"/products/" + p.id}>
          <h3>{p.name}</h3>
        </Link>
        <div className="mini-specs">
          {p.category === "scooter" ? (
            <>
              <span>برد {p.range} کیلومتر</span>
              <span>توان {p.power} وات</span>
            </>
          ) : (
            <span>مناسب استفاده روزمره</span>
          )}
        </div>
        <div className="price-row">
          <div>
            {p.old && <del>{money(p.old)}</del>}
            <strong>
              {money(p.price)} <small>تومان</small>
            </strong>
          </div>
          <Link
            href={"/products/" + p.id}
            aria-label={"مشاهده " + p.name}
            className="square-button"
          >
            <ArrowLeft size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
export function Catalog() {
  const { products } = useContext(Context);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  useEffect(() => {
    if (new URLSearchParams(location.search).get("category") === "accessory")
      setCategory("accessory");
  }, []);
  const list = products
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        (p.name + " " + p.en).toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  return (
    <main className="wrap page-main">
      <div className="eyebrow">انتخاب مسیر تازه</div>
      <h1>فروشگاه پکن کالا</h1>
      <p className="muted">
        اسکوتر مناسب خودتان را پیدا کنید؛ با جزئیات مقایسه کنید و آگاهانه انتخاب
        کنید.
      </p>
      <div className="catalog-controls">
        <div className="tabs">
          {[
            ["all", "همه محصولات"],
            ["scooter", "اسکوتر برقی"],
            ["accessory", "لوازم جانبی"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={category === id ? "active" : ""}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={18} />
          <input
            aria-label="جستجوی محصول"
            placeholder="جستجو در محصولات…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="مرتب‌سازی"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">پیشنهاد پکن کالا</option>
          <option value="low">ارزان‌ترین</option>
          <option value="high">گران‌ترین</option>
        </select>
      </div>
      <p className="muted">{money(list.length)} محصول</p>
      <div className="product-grid">
        {list.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
      {!list.length && (
        <div className="empty">محصولی پیدا نشد. عبارت دیگری را جستجو کنید.</div>
      )}
    </main>
  );
}
export function AddToCart({ p }: { p: Product }) {
  const { cart, update } = useContext(Context);
  const [added, setAdded] = useState(false);
  return (
    <>
      <button
        className="button gold-button"
        disabled={(p.stock ?? 0) < 1}
        onClick={() => {
          update(p.id, (cart[p.id] || 0) + 1);
          setAdded(true);
        }}
      >
        {added ? <Check size={20} /> : <ShoppingBag size={20} />}{" "}
        {added ? "به سبد اضافه شد" : "افزودن به سبد خرید"}
      </button>
      {added && (
        <Link className="text-link" href="/cart">
          مشاهده سبد خرید ←
        </Link>
      )}
    </>
  );
}
export function CartPage() {
  const { cart, update, products } = useContext(Context);
  const [method, setMethod] = useState("delivery");
  const [reserved, setReserved] = useState(false);
  const total = products.reduce((s, p) => s + p.price * (cart[p.id] || 0), 0);
  return (
    <main className="wrap page-main">
      <div className="eyebrow">یک قدم تا مسیر تازه</div>
      <h1>سبد خرید شما</h1>
      <p className="notice">
        سفارش و رزرو ذخیره می‌شوند؛ پرداخت آنلاین فعال نیست.
      </p>
      {!total ? (
        <div className="empty">
          <ShoppingBag size={48} />
          <h2>سبد شما هنوز خالی است</h2>
          <p>مسیر تازه‌تان را با انتخاب یک محصول شروع کنید.</p>
          <Link className="button gold-button" href="/products">
            مشاهده محصولات <ArrowLeft size={18} />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {products
              .filter((p) => cart[p.id])
              .map((p) => (
                <div className="cart-item" key={p.id}>
                  <Link href={"/products/" + p.id} className="cart-art">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Art product={p} />
                    )}
                  </Link>
                  <div>
                    <Link href={"/products/" + p.id}>
                      <h3>{p.name}</h3>
                    </Link>
                    <p>{money(p.price)} تومان</p>
                    <div className="quantity">
                      <button
                        aria-label="افزایش تعداد"
                        onClick={() => update(p.id, cart[p.id] + 1)}
                      >
                        <Plus size={16} />
                      </button>
                      <span>{money(cart[p.id])}</span>
                      <button
                        aria-label="کاهش تعداد"
                        onClick={() => update(p.id, cart[p.id] - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <button
                        aria-label="حذف محصول"
                        onClick={() => update(p.id, 0)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <aside className="summary">
            <h2>خلاصه سبد</h2>
            <div className="summary-line">
              <span>جمع محصولات</span>
              <strong>{money(total)} تومان</strong>
            </div>
            <fieldset>
              <legend>روش تحویل</legend>
              <label>
                <input
                  type="radio"
                  checked={method === "delivery"}
                  onChange={() => {
                    setMethod("delivery");
                    setReserved(false);
                  }}
                />{" "}
                ارسال به سراسر ایران
              </label>
              <label>
                <input
                  type="radio"
                  checked={method === "pickup"}
                  onChange={() => {
                    setMethod("pickup");
                    setReserved(false);
                  }}
                />{" "}
                تحویل از انبار تهران
              </label>
            </fieldset>
            <p className="muted">
              {method === "delivery"
                ? "هزینه و زمان ارسال پس از تأیید مقصد و موجودی مشخص می‌شود."
                : "مراجعه فقط با رزرو آنلاین یا هماهنگی تلفنی قبلی امکان‌پذیر است. شماره و آدرس واقعی هنوز تنظیم نشده‌اند."}
            </p>
            <CheckoutForm
              cart={cart}
              method={method}
              onSuccess={() => setReserved(true)}
            />
            {reserved && (
              <p className="success">درخواست برای بررسی فروشگاه ثبت شد.</p>
            )}
            <button className="button disabled" disabled>
              پرداخت آنلاین — به‌زودی
            </button>
            <small>بدون اتصال به درگاه پرداخت</small>
          </aside>
        </div>
      )}
    </main>
  );
}
