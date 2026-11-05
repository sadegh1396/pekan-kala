"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { digest, verifyPassword, hashPassword } from "@/lib/password";
import { createSession, destroySession, requireAdmin } from "@/lib/server/auth";
import {
  productSchema,
  orderStatuses,
  reservationStatuses,
} from "@/lib/validation";
const dummy = hashPassword("dummy-password-for-timing-only");
export async function login(form: FormData) {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(form.get("password") || "");
  if (email.length > 254 || password.length > 256)
    redirect("/admin/login?error=1");
  const key = digest(email);
  const now = new Date();
  const attempt = await db.loginAttempt.upsert({
    where: { key },
    create: { key, count: 1, resetAt: new Date(Date.now() + 15 * 60_000) },
    update: { count: { increment: 1 } },
  });
  if (attempt.resetAt < now)
    await db.loginAttempt.update({
      where: { key },
      data: { count: 1, resetAt: new Date(Date.now() + 15 * 60_000) },
    });
  else if (attempt.count > 5) redirect("/admin/login?error=1");
  const admin = await db.admin.findUnique({ where: { email } });
  const valid = verifyPassword(password, admin?.passwordHash ?? dummy);
  if (!admin || !valid || admin.role !== "ADMIN")
    redirect("/admin/login?error=1");
  await db.loginAttempt.deleteMany({ where: { key } });
  await createSession(admin.id);
  redirect("/admin");
}
export async function logout() {
  await requireAdmin();
  await destroySession();
  redirect("/admin/login");
}
export async function saveProduct(form: FormData) {
  await requireAdmin();
  const result = productSchema.safeParse(Object.fromEntries(form));
  if (!result.success) redirect("/admin/products?error=1");
  const { id, ...data } = result.data;
  await db.product.upsert({
    where: { id },
    create: { id, ...data },
    update: { ...data, active: true },
  });
  revalidatePath("/", "layout");
  redirect("/admin/products?saved=1");
}
export async function deleteProduct(form: FormData) {
  await requireAdmin();
  await db.product.update({
    where: { id: String(form.get("id")) },
    data: { active: false },
  });
  revalidatePath("/", "layout");
  redirect("/admin/products");
}
export async function updateStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id")),
    status = String(form.get("status")),
    kind = String(form.get("kind"));
  if (
    kind === "order" &&
    orderStatuses.includes(status as (typeof orderStatuses)[number])
  ) {
    await db.$transaction(async (tx) => {
      const order = await tx.order.findUniqueOrThrow({
        where: { id },
        include: { items: true },
      });
      if (order.status === "CANCELLED" && status !== "CANCELLED") return;
      if (order.status !== "CANCELLED" && status === "CANCELLED") {
        for (const item of order.items)
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        await tx.reservation.updateMany({
          where: { orderId: id },
          data: { status: "CANCELLED" },
        });
      }
      await tx.order.update({ where: { id }, data: { status } });
    });
  } else if (
    kind === "reservation" &&
    reservationStatuses.includes(status as (typeof reservationStatuses)[number])
  ) {
    const reservation = await db.reservation.findUnique({
      where: { id },
      include: { order: true },
    });
    if (reservation && reservation.order.status !== "CANCELLED")
      await db.reservation.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin", "layout");
}
