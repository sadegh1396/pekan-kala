# پکن کالا — Pekan Kala

Persian RTL demo storefront for the intended domain **pekan-kala.ir**. Built with Next.js App Router, TypeScript, Tailwind CSS 4, Lucide icons and a locally hosted Vazirmatn font (license in public/FONT-LICENSE.txt).

## Run

```sh
npm ci
npm run dev
```

## Check and build

```sh
npm run build
npm run typecheck
```

The production build exports the homepage, catalog, six product detail pages and cart to `out/`. No deployment or domain connection has been performed.

## Included

- Responsive black, gold and red visual design; Persian text and RTL layout.
- Sample scooters/accessories, prices in toman, category filters, search and price sorting.
- Product details and a browser-local persistent cart with quantity and removal controls.
- Nationwide delivery and Tehran warehouse pickup instructions.
- Pickup reservation demonstration with validated contact fields. Form data is never transmitted or saved; no actual reservation is made.
- Disabled payment button; no gateway, order backend or real payment integration.

## Before launch

Replace sample inventory, pricing, product illustrations and specifications with verified commercial information. Add real warehouse address, contact telephone, delivery rules, warranty/return policy and legal details. Connect a reservation backend and payment service only when authorized. Enable indexing after replacing the demo data (metadata currently disables indexing). The domain is metadata only and has not been registered or configured.
