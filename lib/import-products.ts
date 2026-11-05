import { db } from "./db";
import { products } from "./products";
export async function importLegacyProducts() {
  for (const p of products)
    await db.product.upsert({ where: { id: p.id }, update: {}, create: p });
  return products.length;
}
