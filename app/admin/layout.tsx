import "./admin.css";
export const metadata = {
  title: "مدیریت پکن کالا",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
