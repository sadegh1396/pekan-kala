import "server-only";
import { db } from "../db";
import { Product } from "../products";
export async function getProducts(): Promise<Product[]> {
  const rows = await db.product.findMany({
    where: { active: true },
    orderBy: { id: "asc" },
  });
  return rows.map((p) => ({
    ...p,
    old: p.old ?? undefined,
    category: p.category as Product["category"],
  }));
}
