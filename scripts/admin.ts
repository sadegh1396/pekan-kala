import { db } from "../lib/db";
import { hashPassword } from "../lib/password";
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
    password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 14)
    throw Error("Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 14 characters).");
  const admin = await db.admin.upsert({
    where: { email },
    create: { email, passwordHash: hashPassword(password) },
    update: { passwordHash: hashPassword(password) },
  });
  await db.session.deleteMany({ where: { adminId: admin.id } });
  console.log("Administrator saved; existing sessions revoked.");
}
main().finally(() => db.$disconnect());
