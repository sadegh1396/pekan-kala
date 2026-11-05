import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/server/auth";
import { saveProduct, deleteProduct } from "../../actions";
import { money } from "@/lib/products";
import Link from "next/link";
export default async function Products({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string; error?: string; saved?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const products = await db.product.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });
  const edit = query.edit
    ? await db.product.findUnique({ where: { id: query.edit } })
    : null;
  const fields = [
    ["id", "شناسه انگلیسی"],
    ["name", "نام فارسی"],
    ["en", "نام انگلیسی"],
    ["price", "قیمت (تومان)"],
    ["old", "قیمت قبل (اختیاری)"],
    ["stock", "موجودی"],
    ["range", "برد"],
    ["power", "توان"],
    ["tag", "برچسب"],
    ["color", "رنگ (#hex)"],
    ["image", "نشانی تصویر (محلی یا HTTPS)"],
  ];
  return (
    <>
      <h1>مدیریت محصولات</h1>
      {query.error && (
        <p role="alert">
          اطلاعات محصول معتبر نیست؛ قیمت، موجودی، شناسه و تصویر را بررسی کنید.
        </p>
      )}
      {query.saved && <p role="status">محصول ذخیره شد.</p>}
      <section className="admin-panel">
        <h2>{edit ? "ویرایش محصول" : "افزودن محصول"}</h2>
        <form
          action={saveProduct}
          className="admin-form"
          key={edit?.id ?? "new"}
        >
          {fields.map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                name={key}
                readOnly={key === "id" && !!edit}
                required={["id", "name", "price", "stock", "color"].includes(
                  key,
                )}
                type={
                  ["price", "old", "stock"].includes(key) ? "number" : "text"
                }
                min="0"
                max={key === "stock" ? 100000 : 1_000_000_000}
                defaultValue={String(
                  edit?.[key as keyof typeof edit] ??
                    (key === "color"
                      ? "#c5a35e"
                      : ["price", "stock"].includes(key)
                        ? 0
                        : ""),
                )}
              />
            </label>
          ))}
          <label>
            دسته‌بندی
            <select name="category" defaultValue={edit?.category ?? "scooter"}>
              <option value="scooter">اسکوتر</option>
              <option value="accessory">لوازم جانبی</option>
            </select>
          </label>
          <button className="button gold-button">ذخیره محصول</button>
          {edit && <Link href="/admin/products">انصراف</Link>}
        </form>
      </section>
      <div className="admin-table">
        <table>
          <thead>
            <tr>
              <th>محصول</th>
              <th>قیمت</th>
              <th>موجودی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{money(p.price)}</td>
                <td>{money(p.stock)}</td>
                <td>
                  <Link href={"/admin/products?edit=" + p.id}>ویرایش</Link>
                  <details>
                    <summary>حذف</summary>
                    <p>
                      محصول از فروشگاه حذف می‌شود؛ سابقه سفارش‌ها حفظ خواهد شد.
                    </p>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="button">تأیید حذف</button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products.length && <p>محصولی ثبت نشده است.</p>}
      </div>
    </>
  );
}
