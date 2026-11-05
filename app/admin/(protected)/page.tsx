import Link from "next/link";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/server/auth";
import { money } from "@/lib/products";
export default async function Dashboard() {
  await requireAdmin();
  const [products, orders, reservations, total, low] = await Promise.all([
    db.product.count({ where: { active: true } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.reservation.count({ where: { status: "PENDING" } }),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: "COMPLETED" },
    }),
    db.product.count({ where: { active: true, stock: { lte: 3 } } }),
  ]);
  return (
    <>
      <div className="eyebrow">مدیریت فروشگاه</div>
      <h1>نمای کلی</h1>
      <p>وضعیت امروز فروشگاه، در یک نگاه</p>
      <div className="admin-stats">
        {[
          ["محصول فعال", products, "/admin/products"],
          ["سفارش در انتظار", orders, "/admin/orders"],
          ["رزرو در انتظار", reservations, "/admin/reservations"],
          ["موجودی کم یا ناموجود", low, "/admin/products"],
        ].map(([label, count, url]) => (
          <Link href={String(url)} className="admin-panel" key={label}>
            <span>{label}</span>
            <strong>{money(Number(count))}</strong>
          </Link>
        ))}
      </div>
      <section className="admin-panel">
        <h2>ارزش سفارش‌های تکمیل‌شده</h2>
        <strong>{money(total._sum.total ?? 0)} تومان</strong>
        <p>پرداخت آنلاین فعال نیست؛ ثبت درخواست به معنی دریافت وجه نیست.</p>
      </section>
    </>
  );
}
