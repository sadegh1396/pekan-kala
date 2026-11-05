import { db } from "../lib/db";
import { importLegacyProducts } from "../lib/import-products";
async function main() {
  console.log(
    `Imported ${await importLegacyProducts()} legacy products without overwriting existing records.`,
  );
}
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
