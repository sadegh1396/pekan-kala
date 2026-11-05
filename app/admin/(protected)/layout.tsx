import Link from "next/link";
import { requireAdmin } from "@/lib/server/auth";
import { logout } from "../actions";
export const dynamic = "force-dynamic";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link href="/admin" className="brand">
          پکن کالا <small>پنل مدیریت</small>
        </Link>
        <nav>
          {[
            ["/admin", "نمای کلی"],
            ["/admin/products", "محصولات"],
            ["/admin/orders", "سفارش‌ها"],
            ["/admin/reservations", "رزروهای تحویل"],
            ["/", "مشاهده فروشگاه"],
          ].map(([url, label]) => (
            <Link href={url} key={url}>
              {label}
            </Link>
          ))}
        </nav>
        <small dir="ltr">{admin.email}</small>
        <form action={logout}>
          <button className="button">خروج از حساب</button>
        </form>
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
