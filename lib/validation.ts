import { z } from "zod";
export const productSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,80}$/),
  name: z.string().trim().min(2).max(200),
  en: z.string().max(200),
  price: z.coerce.number().int().min(0).max(1_000_000_000),
  old: z.preprocess(
    (v) => (v === "" ? null : v),
    z.coerce.number().int().min(0).max(1_000_000_000).nullable(),
  ),
  stock: z.coerce.number().int().min(0).max(100000),
  category: z.enum(["scooter", "accessory"]),
  range: z.string().max(50),
  power: z.string().max(50),
  tag: z.string().max(100),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  image: z
    .string()
    .max(2048)
    .refine(
      (v) =>
        !v ||
        /^\/(?!\/)[\w/.-]+$/.test(v) ||
        (() => {
          try {
            return new URL(v).protocol === "https:";
          } catch {
            return false;
          }
        })(),
      "نشانی تصویر باید محلی یا HTTPS باشد",
    ),
});
export const checkoutSchema = z
  .object({
    customer: z.string().trim().min(2).max(120),
    phone: z.string().regex(/^09\d{9}$/),
    address: z.string().trim().max(1000),
    method: z.enum(["delivery", "pickup"]),
    requestedDate: z.string().max(10).optional(),
    items: z
      .array(
        z.object({
          id: z.string().max(80),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1)
      .max(50),
  })
  .superRefine((v, c) => {
    if (v.method === "delivery" && v.address.length < 10)
      c.addIssue({
        code: "custom",
        message: "نشانی کامل را وارد کنید",
        path: ["address"],
      });
    if (
      v.method === "pickup" &&
      (!v.requestedDate ||
        !/^\d{4}-\d{2}-\d{2}$/.test(v.requestedDate) ||
        Number.isNaN(Date.parse(v.requestedDate)) ||
        v.requestedDate < new Date().toISOString().slice(0, 10))
    )
      c.addIssue({
        code: "custom",
        message: "تاریخ معتبر آینده را انتخاب کنید",
        path: ["requestedDate"],
      });
    if (new Set(v.items.map((i) => i.id)).size !== v.items.length)
      c.addIssue({ code: "custom", message: "محصول تکراری", path: ["items"] });
  });
export const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;
export const reservationStatuses = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
export const statusLabels: Record<string, string> = {
  PENDING: "در انتظار بررسی",
  CONFIRMED: "تأییدشده",
  SHIPPED: "ارسال‌شده",
  COMPLETED: "تکمیل‌شده",
  CANCELLED: "لغوشده",
};
