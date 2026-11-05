import type { Metadata } from "next";
import { StoreProvider, Header, Footer } from "@/components/Store";
import "./globals.css";
import { getProducts } from "@/lib/server/catalog";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  metadataBase: new URL("https://pekan-kala.ir"),
  title: {
    default: "پکن کالا | مسیر تازه‌ات را بساز",
    template: "%s | پکن کالا",
  },
  description:
    "فروشگاه اسکوتر برقی و لوازم جانبی پکن کالا؛ ارسال به سراسر ایران و تحویل از انبار تهران. نسخه نمایشی.",
  robots: { index: false, follow: false },
};
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <StoreProvider products={await getProducts()}>
          <div className="store-chrome">
            <Header />
          </div>
          {children}
          <div className="store-chrome">
            <Footer />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
