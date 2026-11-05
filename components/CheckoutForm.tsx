"use client";
import { useState } from "react";
export default function CheckoutForm({
  cart,
  method,
  onSuccess,
}: {
  cart: Record<string, number>;
  method: string;
  onSuccess: () => void;
}) {
  const [pending, setPending] = useState(false),
    [message, setMessage] = useState(""),
    [done, setDone] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (pending || done) return;
        const form = new FormData(e.currentTarget);
        setPending(true);
        setMessage("");
        try {
          const response = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customer: form.get("customer"),
              phone: form.get("phone"),
              address: form.get("address") ?? "",
              requestedDate: form.get("requestedDate") ?? undefined,
              method,
              items: Object.entries(cart).map(([id, quantity]) => ({
                id,
                quantity,
              })),
            }),
          });
          const result = await response.json();
          if (!response.ok) throw Error(result.error);
          setDone(true);
          setMessage(
            "درخواست شما ثبت شد. کد پیگیری: " +
              result.id +
              " — برای تأیید نهایی منتظر هماهنگی فروشگاه باشید.",
          );
          onSuccess();
        } catch (error) {
          setMessage(
            error instanceof Error
              ? error.message
              : "خطا در ارتباط؛ دوباره تلاش کنید.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="form-label">
        نام و نام خانوادگی
        <input
          name="customer"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
        />
      </label>
      <label className="form-label">
        شماره موبایل
        <input
          name="phone"
          required
          pattern="09[0-9]{9}"
          maxLength={11}
          dir="ltr"
          autoComplete="tel"
          placeholder="09123456789"
        />
      </label>
      {method === "delivery" ? (
        <label className="form-label">
          نشانی کامل
          <input
            name="address"
            minLength={10}
            maxLength={1000}
            required
            autoComplete="street-address"
          />
        </label>
      ) : (
        <label className="form-label">
          تاریخ درخواستی تحویل
          <input
            name="requestedDate"
            type="date"
            required
            min={new Date().toISOString().slice(0, 10)}
          />
        </label>
      )}
      <p>این درخواست در فروشگاه ذخیره می‌شود. پرداخت آنلاین انجام نمی‌شود.</p>
      <button className="button gold-button" disabled={pending || done}>
        {pending
          ? "در حال ثبت…"
          : done
            ? "ثبت شد"
            : method === "pickup"
              ? "ثبت سفارش و رزرو تحویل"
              : "ثبت سفارش بدون پرداخت"}
      </button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
