export type Product={id:string;name:string;en:string;price:number;old?:number;category:'scooter'|'accessory';range:string;power:string;tag:string;color:string;stock?:number;image?:string};
export const products:Product[]=[
{id:'xiaomi-4-pro',name:'اسکوتر برقی شیائومی ۴ پرو',en:'XIAOMI ELECTRIC SCOOTER 4 PRO',price:48500000,old:53000000,category:'scooter',range:'۵۵',power:'۷۰۰',tag:'پیشنهاد پکن کالا',color:'#c5a35e'},
{id:'ninebot-max-g2',name:'اسکوتر برقی ناین‌بات مکس G2',en:'SEGWAY NINEBOT MAX G2',price:72900000,category:'scooter',range:'۷۰',power:'۹۰۰',tag:'انتخاب حرفه‌ای‌ها',color:'#dcaa33'},
{id:'xiaomi-4-lite',name:'اسکوتر برقی شیائومی ۴ لایت',en:'XIAOMI ELECTRIC SCOOTER 4 LITE',price:29800000,category:'scooter',range:'۲۰',power:'۳۰۰',tag:'سبک و شهری',color:'#dd4c3d'},
{id:'helmet',name:'کلاه ایمنی شهری راک‌براز',en:'ROCKBROS URBAN HELMET',price:2450000,category:'accessory',range:'—',power:'—',tag:'همراه امن سفر',color:'#bfa26a'},
{id:'lock',name:'قفل کابلی اسکوتر',en:'SCOOTER SECURITY LOCK',price:850000,category:'accessory',range:'—',power:'—',tag:'لوازم جانبی',color:'#dd4c3d'},
{id:'phone-holder',name:'پایه نگهدارنده موبایل',en:'UNIVERSAL PHONE HOLDER',price:680000,category:'accessory',range:'—',power:'—',tag:'لوازم جانبی',color:'#c5a35e'}];
export const money=(n:number)=>new Intl.NumberFormat('fa-IR').format(n);
