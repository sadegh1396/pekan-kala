require("tsx/cjs");
const { chromium } = require("playwright-core");
const { db } = require("../lib/db.ts");
const { hashPassword } = require("../lib/password.ts");
const { randomBytes } = require("node:crypto");
const assert = require("node:assert/strict");
(async () => {
  assert.match(
    process.env.DATABASE_URL ?? "",
    /test\.db$/,
    "Use a separate seeded test.db",
  );
  const password = randomBytes(24).toString("hex"),
    email = "browser-test@example.invalid";
  const admin = await db.admin.create({
    data: { email, passwordHash: hashPassword(password) },
  });
  const product = await db.product.findUniqueOrThrow({
    where: { id: "helmet" },
  });
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
      headless: true,
      args: ["--no-sandbox"],
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
      }),
      page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:3000/admin/products");
    assert.ok(page.url().endsWith("/admin/login"));
    await page.getByLabel("ایمیل").fill(email);
    await page.getByLabel("رمز عبور").fill(password);
    await page.getByRole("button", { name: "ورود امن" }).click();
    await page.waitForURL("**/admin");
    const cookie = (await context.cookies()).find(
      (c) => c.name === "pekan_admin",
    );
    assert.ok(
      cookie &&
        cookie.secure &&
        cookie.httpOnly &&
        cookie.sameSite === "Strict",
    );
    await page.goto("http://localhost:3000/admin/products?edit=helmet");
    await page.getByLabel("موجودی", { exact: true }).fill("4");
    await page.getByRole("button", { name: "ذخیره محصول" }).click();
    await page.waitForURL("**/admin/products?saved=1");
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id: "helmet" } })).stock,
      4,
    );
    await page.goto("http://localhost:3000/products/helmet");
    await page.getByRole("button", { name: "افزودن به سبد خرید" }).click();
    await page.goto("http://localhost:3000/cart");
    await page.getByLabel("نام و نام خانوادگی").fill("browser-test");
    await page.getByLabel("شماره موبایل").fill("09123456789");
    await page.getByLabel("نشانی کامل").fill("نشانی کامل آزمایش مرورگر تهران");
    await page.getByRole("button", { name: "ثبت سفارش بدون پرداخت" }).click();
    await page.getByRole("status").waitFor();
    assert.match(await page.getByRole("status").textContent(), /کد پیگیری/);
    const order = await db.order.findFirstOrThrow({
      where: { customer: "browser-test" },
    });
    assert.equal(order.total, product.price);
    await page.goto("http://localhost:3000/admin/orders");
    await page
      .locator("article")
      .filter({ hasText: "browser-test" })
      .getByLabel("وضعیت")
      .selectOption("CANCELLED");
    await page
      .locator("article")
      .filter({ hasText: "browser-test" })
      .getByRole("button", { name: "ثبت وضعیت" })
      .click();
    await page.waitForTimeout(400);
    assert.equal(
      (await db.order.findUniqueOrThrow({ where: { id: order.id } })).status,
      "CANCELLED",
    );
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id: "helmet" } })).stock,
      4,
    );
    await page.goto("http://localhost:3000/admin");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.getByRole("button", { name: "خروج از حساب" }).click();
    await page.waitForURL("**/admin/login");
    await page.goto("http://localhost:3000/admin/orders");
    assert.ok(page.url().endsWith("/admin/login"));
    const bad = await context.request.post(
      "http://localhost:3000/api/checkout",
      { headers: { Origin: "https://evil.example" }, data: {} },
    );
    assert.equal(bad.status(), 403);
    assert.deepEqual(errors, []);
    console.log(
      "PASS: mobile admin guard, login, Secure/HttpOnly/Strict cookie, product edit, storefront order persistence, cancellation stock restoration, logout, cross-origin rejection, no browser exceptions.",
    );
  } finally {
    await browser?.close();
    await db.session.deleteMany({ where: { adminId: admin.id } });
    await db.admin.delete({ where: { id: admin.id } });
    await db.order.deleteMany({ where: { customer: "browser-test" } });
    await db.product.update({
      where: { id: product.id },
      data: { stock: product.stock },
    });
    await db.$disconnect();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
