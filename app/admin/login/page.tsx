import { login } from "../actions";
import { getAdmin } from "@/lib/server/auth";
import { redirect } from "next/navigation";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getAdmin()) redirect("/admin");
  const { error } = await searchParams;
  return (
    <main className="admin-login">
      <div className="admin-panel">
        <span className="eyebrow">پکن کالا · مدیریت</span>
        <h1>ورود مدیر</h1>
        <p>برای مدیریت فروشگاه وارد حساب خود شوید.</p>
        {error && (
          <p role="alert">
            ورود ناموفق بود. اطلاعات را بررسی کنید یا ۱۵ دقیقه بعد تلاش کنید.
          </p>
        )}
        <form action={login}>
          <label>
            ایمیل
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              dir="ltr"
              maxLength={254}
            />
          </label>
          <label>
            رمز عبور
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={256}
              dir="ltr"
            />
          </label>
          <button className="button gold-button">ورود امن</button>
        </form>
      </div>
    </main>
  );
}
