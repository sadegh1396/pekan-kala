import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, digest } from "../lib/password";
import { checkoutSchema, productSchema } from "../lib/validation";
import { products } from "../lib/products";
import { db } from "../lib/db";
import { importLegacyProducts } from "../lib/import-products";
import { placeOrder } from "../lib/checkout";
assert.match(
  process.env.DATABASE_URL ?? "",
  /test\.db$/,
  "Use a separate test.db database",
);
test("legacy import preserves every original field and does not overwrite existing data", async () => {
  await importLegacyProducts();
  for (const original of products) {
    const saved = await db.product.findUniqueOrThrow({
      where: { id: original.id },
    });
    for (const [key, value] of Object.entries(original))
      assert.equal(saved[key as keyof typeof saved], value);
  }
  await db.product.update({
    where: { id: products[0].id },
    data: { price: 123, stock: 7 },
  });
  await importLegacyProducts();
  const saved = await db.product.findUniqueOrThrow({
    where: { id: products[0].id },
  });
  assert.equal(saved.price, 123);
  assert.equal(saved.stock, 7);
  await db.product.update({
    where: { id: products[0].id },
    data: { price: products[0].price, stock: 0 },
  });
});
test("passwords use independent salts and reject incorrect passwords", () => {
  const a = hashPassword("a-long-secure-password");
  assert.notEqual(a, hashPassword("a-long-secure-password"));
  assert.ok(verifyPassword("a-long-secure-password", a));
  assert.equal(verifyPassword("wrong", a), false);
  assert.equal(verifyPassword("wrong", "invalid"), false);
  assert.equal(digest("token").length, 64);
});
test("validation rejects negative stock, unsafe images, duplicate items and invalid pickup dates", () => {
  assert.equal(
    productSchema.safeParse({
      ...products[0],
      old: "",
      stock: -1,
      image: "",
      color: "#abcdef",
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...products[0],
      old: "",
      stock: 1,
      image: "javascript:alert(1)",
    }).success,
    false,
  );
  const input = {
    customer: "مشتری تست",
    phone: "09123456789",
    address: "نشانی کامل آزمایشی",
    method: "delivery",
    items: [{ id: "test", quantity: 1 }],
  };
  assert.ok(checkoutSchema.safeParse(input).success);
  assert.equal(
    checkoutSchema.safeParse({
      ...input,
      items: [...input.items, ...input.items],
    }).success,
    false,
  );
  assert.equal(
    checkoutSchema.safeParse({
      ...input,
      method: "pickup",
      requestedDate: "2000-01-01",
    }).success,
    false,
  );
});
test("checkout persists orders and reservations, trusts database prices and atomically enforces inventory", async () => {
  assert.match(
    process.env.DATABASE_URL ?? "",
    /test\.db$/,
    "Run integration tests with a separate test.db database",
  );
  const id = "integration-test-product";
  await db.product.upsert({
    where: { id },
    create: { ...products[0], id, price: 12345, stock: 2 },
    update: { price: 12345, stock: 2, active: true },
  });
  const input = {
    customer: "integration-test",
    phone: "09123456789",
    address: "نشانی تست سفارش",
    method: "pickup",
    requestedDate: "2099-01-01",
    items: [{ id, quantity: 1 }],
    total: 1,
  };
  try {
    const created = await placeOrder(input);
    const order = await db.order.findUniqueOrThrow({
      where: { id: created.id },
      include: { items: true, reservation: true },
    });
    assert.equal(order.total, 12345);
    assert.equal(order.items[0].price, 12345);
    assert.ok(order.reservation);
    await assert.rejects(
      placeOrder({ ...input, items: [{ id, quantity: 3 }] }),
    );
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id } })).stock,
      1,
    );
    const results = await Promise.allSettled([
      placeOrder(input),
      placeOrder(input),
    ]);
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(
      (await db.product.findUniqueOrThrow({ where: { id } })).stock,
      0,
    );
  } finally {
    const orders = await db.order.findMany({
      where: { customer: "integration-test" },
      select: { id: true },
    });
    await db.reservation.deleteMany({
      where: { orderId: { in: orders.map((o) => o.id) } },
    });
    await db.order.deleteMany({
      where: { id: { in: orders.map((o) => o.id) } },
    });
    await db.product.delete({ where: { id } });
    await db.$disconnect();
  }
});
