import type {Metadata} from 'next';
import {StoreProvider,Header,Footer} from '@/components/Store';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://pekan-kala.ir'),title:{default:'پکن کالا | مسیر تازه‌ات را بساز',template:'%s | پکن کالا'},description:'فروشگاه اسکوتر برقی و لوازم جانبی پکن کالا؛ ارسال به سراسر ایران و تحویل از انبار تهران. نسخه نمایشی.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="fa" dir="rtl"><body><StoreProvider><Header/>{children}<Footer/></StoreProvider></body></html>}
