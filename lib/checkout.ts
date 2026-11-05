import { db } from "./db";
import { checkoutSchema } from "./validation";
export async function placeOrder(input: unknown) {
  const data = checkoutSchema.parse(input);
  return db.$transaction(async (tx) => {
    const items = [];
    let total = 0;
    for (const item of data.items) {
      const p = await tx.product.findUnique({ where: { id: item.id } });
      if (!p || !p.active) throw Error("محصول موجود نیست");
      const updated = await tx.product.updateMany({
        where: { id: p.id, active: true, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) throw Error("موجودی محصول کافی نیست");
      total += p.price * item.quantity;
      if (!Number.isSafeInteger(total) || total > 2_000_000_000)
        throw Error("مبلغ سفارش بیش از حد مجاز است");
      items.push({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: item.quantity,
      });
    }
    return tx.order.create({
      data: {
        customer: data.customer,
        phone: data.phone,
        address: data.method === "delivery" ? data.address : "",
        total,
        items: { create: items },
        ...(data.method === "pickup"
          ? { reservation: { create: { requestedDate: data.requestedDate! } } }
          : {}),
      },
      select: { id: true },
    });
  });
}
