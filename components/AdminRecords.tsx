import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/server/auth";
import { updateStatus } from "@/app/admin/actions";
import {
  orderStatuses,
  reservationStatuses,
  statusLabels,
} from "@/lib/validation";
import { money } from "@/lib/products";
export default async function Records({
  reservations = false,
}: {
  reservations?: boolean;
}) {
  await requireAdmin();
  const orders = await db.order.findMany({
    where: reservations ? { reservation: { isNot: null } } : {},
    include: { items: true, reservation: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <h1>{reservations ? "رزروهای تحویل حضوری" : "سفارش‌ها"}</h1>
      <p>۲۰۰ درخواست اخیر · مبالغ به تومان · زمان‌ها به وقت تهران</p>
      {!orders.length && (
        <div className="admin-panel">هنوز درخواستی ثبت نشده است.</div>
      )}
      {orders.map((o) => {
        const record = reservations ? o.reservation! : o;
        return (
          <article className="admin-panel" key={o.id}>
            <div className="admin-record-heading">
              <h2>{o.customer}</h2>
              <span className="admin-badge">{statusLabels[record.status]}</span>
            </div>
            <small dir="ltr">{o.id}</small>
            <p>
              <a href={"tel:" + o.phone}>{o.phone}</a> ·{" "}
              {o.createdAt.toLocaleString("fa-IR", { timeZone: "Asia/Tehran" })}
            </p>
            <p>
              {o.address || "تحویل حضوری"}{" "}
              {reservations &&
                ` · تاریخ درخواستی: ${o.reservation?.requestedDate}`}
            </p>
            <ul>
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.name} × {money(i.quantity)} — {money(i.price)} تومان
                </li>
              ))}
            </ul>
            <p>جمع: {money(o.total)} تومان · بدون پرداخت آنلاین</p>
            <form action={updateStatus} className="admin-inline">
              <input type="hidden" name="id" value={record.id} />
              <input
                type="hidden"
                name="kind"
                value={reservations ? "reservation" : "order"}
              />
              <label>
                وضعیت
                <select
                  name="status"
                  defaultValue={record.status}
                  disabled={o.status === "CANCELLED"}
                >
                  {(reservations ? reservationStatuses : orderStatuses).map(
                    (s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <button
                className="button gold-button"
                disabled={o.status === "CANCELLED"}
              >
                ثبت وضعیت
              </button>
            </form>
          </article>
        );
      })}
    </>
  );
}
