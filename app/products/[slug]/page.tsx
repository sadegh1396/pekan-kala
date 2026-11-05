import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, MapPin, Check, ArrowLeft } from "lucide-react";
import { money } from "@/lib/products";
import { getProducts } from "@/lib/server/catalog";
import Art from "@/components/Art";
import { AddToCart, ProductCard } from "@/components/Store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  return {
    title: products.find((p) => p.id === slug)?.name || "محصول پیدا نشد",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const products = await getProducts();
  const p = products.find((p) => p.id === slug);
  if (!p) notFound();
  return (
    <main className="wrap page-main">
      <div className="breadcrumbs">
        <Link href="/">خانه</Link> / <Link href="/products">فروشگاه</Link> /{" "}
        {p.name}
      </div>
      <div className="detail-grid">
        <div className="detail-art">
          <span className="tag">{p.tag}</span>
          {p.image ? (
            <img
              src={p.image}
              alt={p.name}
              style={{ width: "100%", objectFit: "contain" }}
            />
          ) : (
            <Art product={p} />
          )}
          <small>تصویرسازی نمایشی محصول</small>
        </div>
        <div className="detail-copy">
          <div className="eyebrow">
            {p.category === "scooter" ? "اسکوتر برقی" : "لوازم جانبی"}
          </div>
          <h1>{p.name}</h1>
          <p className="english">{p.en}</p>
          <span className="stock">
            <Check size={16} /> {(p.stock ?? 0) > 0 ? "موجود" : "ناموجود"}
          </span>
          <p className="description">
            {p.category === "scooter"
              ? "همراهی هوشمند برای رفت‌وآمد روزانه. طراحی تاشو، حرکت برقی و تجربه‌ای متفاوت از کشف شهر. مشخصات و قیمت این محصول نمونه‌اند و باید پیش از خرید تأیید شوند."
              : "برای تجربه‌ای راحت‌تر در مسیرهای روزانه. پیش از خرید، سازگاری این محصول با اسکوتر خود را بررسی کنید. اطلاعات محصول نمونه است."}
          </p>
          <div className="detail-specs">
            {(p.category === "scooter"
              ? [
                  [p.range + " کیلومتر", "برد نمونه"],
                  [p.power + " وات", "توان نمونه"],
                  ["تاشو", "طراحی بدنه"],
                ]
              : [
                  ["روزمره", "کاربری"],
                  ["مشکی", "رنگ نمونه"],
                ]
            ).map(([a, b]) => (
              <div key={b}>
                <strong>{a}</strong>
                <small>{b}</small>
              </div>
            ))}
          </div>
          <div className="detail-price">
            {p.old && <del>{money(p.old)} تومان</del>}
            <strong>
              {money(p.price)} <small>تومان</small>
            </strong>
          </div>
          <AddToCart p={p} />
          <div className="detail-delivery">
            <span>
              <Truck size={18} /> ارسال به سراسر ایران
            </span>
            <span>
              <MapPin size={18} /> تحویل تهران با رزرو یا هماهنگی تلفنی
            </span>
          </div>
        </div>
      </div>
      <section className="spec-section">
        <h2>پیش از انتخاب بدانید</h2>
        <p>
          برد اسکوتر به وزن راکب، شیب مسیر، دما و شیوه رانندگی بستگی دارد. برای
          استفاده، تجهیزات ایمنی مناسب تهیه کنید. شرایط ضمانت، موجودی واقعی،
          آدرس انبار و اطلاعات تماس پیش از فعال‌سازی فروش تکمیل می‌شوند.
        </p>
        <p className="notice">
          ثبت سفارش و رزرو فعال است؛ پرداخت آنلاین انجام نمی‌شود.
        </p>
      </section>
      <section className="featured">
        <div className="section-heading">
          <h2>همراه‌های دیگر مسیر</h2>
          <Link href="/products" className="text-link">
            همه محصولات <ArrowLeft size={18} />
          </Link>
        </div>
        <div className="product-grid">
          {products
            .filter((x) => x.id !== p.id)
            .slice(0, 3)
            .map((x) => (
              <ProductCard p={x} key={x.id} />
            ))}
        </div>
      </section>
    </main>
  );
}
