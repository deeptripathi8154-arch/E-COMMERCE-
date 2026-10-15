<div align="center">

<img src="docs/assets/harvinder-telecom-banner.svg" alt="Harvinder Telecom — Everyday tech. Better choices." width="100%" />

# Harvinder Telecom E-Commerce

### A simpler, more trustworthy way to shop for everyday technology.

**Smartphones · Tablets · Accessories · Audio · Wearables · Pre-owned devices**

[Project Roadmap](docs/ROADMAP.md) · [Architecture](docs/ARCHITECTURE.md) · [Phase Reports](docs/) · [Security](#-security-first-by-design)

![Project Status](https://img.shields.io/badge/status-in%20development-orange)
![Budget Goal](https://img.shields.io/badge/budget-zero--cost--first-168c65)
![Build Status](https://img.shields.io/badge/full%20build-not%20yet%20verified-lightgrey)
![Made for India](https://img.shields.io/badge/market-India%20%7C%20INR-214f9c)

</div>

---

## 👋 Welcome

**Harvinder Telecom E-Commerce** is a work-in-progress electronics shopping platform being developed for Harvinder Telecom in Haldwani, Uttarakhand, India.

The idea is simple: buying technology should feel clear, comfortable and human. Customers should be able to discover products, understand what they are buying, check genuine availability, ask for help and place an order without fighting a cluttered interface. The store owner should be able to manage listings and orders without writing code.

This project takes inspiration from the *convenience* of large online marketplaces while creating its own brand identity and focusing on clarity, trust and a lightweight, zero-budget-first operating model.

> **Project status:** The responsive storefront and Phase 2 infrastructure foundations are in the repository. This is not yet a live store. Real catalogue administration, end-to-end customer accounts, checkout, order processing and production deployment still need to be implemented and verified.

## ✨ Why this project exists

Online electronics shopping can be confusing: specifications are difficult to compare, accessory compatibility is unclear, stock information may be stale, and customers can struggle to get useful human help. This project aims to address those everyday problems.

- **Less confusion:** straightforward categories, searchable listings and readable product information.
- **More confidence:** explicit product condition, warranty and availability information as the catalogue matures.
- **Human support:** a clear path to ask questions before buying.
- **Owner-friendly operations:** a planned admin workflow for product photos, prices, variants, stock and orders.
- **Budget-aware engineering:** open-source software and provider free tiers first, with no automatic paid upgrades.
- **Built incrementally:** each phase has acceptance criteria, tests and a report rather than pretending every feature exists from day one.

## 🖥️ Storefront preview

The current screenshots show the **Phase 1 design preview**, which uses clearly labelled example products and prices. They are not live offers or verified stock.

<div align="center">

**Desktop experience**

<img src="docs/assets/phase1-desktop-overview.png" alt="Harvinder Telecom responsive storefront — desktop overview" width="100%" />

**Mobile experience**

<img src="docs/assets/phase1-mobile-overview.png" alt="Harvinder Telecom responsive storefront — mobile overview" width="360" />

</div>

Want to try the standalone interaction preview? Download or clone this repository, then open [`preview.html`](preview.html) in a modern browser. The preview is client-side only: its cart does not create a real order, reserve inventory or take payment.

## 🛍️ Planned store catalogue

| Category | Examples |
|---|---|
| Smartphones | Apple, Samsung, Vivo, OPPO, Xiaomi, OnePlus, Google, Motorola and other brands |
| Tablets | Tablets, storage/colour variants and relevant warranty information |
| Mobile accessories | Covers, screen guards, chargers, cables, adapters and power banks |
| Audio | Earphones, headphones, speakers and audio accessories |
| Smart devices | Smartwatches, wearables and connected gadgets |
| Computing and electronics | Computer accessories, networking products and related devices |
| Pre-owned devices | Clearly declared condition, inspection details and applicable warranty terms |

Brand names are used to describe intended catalogue coverage, not to imply sponsorship, partnership or current stock.

## ✅ What is implemented today?

| Area | Current status |
|---|---|
| Responsive storefront layout and visual design system | **Built as a preview** |
| Search and category filters in the standalone preview | **Preview interactions tested** |
| Demo wishlist and preview cart | **Preview-only** |
| D1-compatible SQL schema and business constraints | **Foundation added; SQLite checks pass** |
| Better Auth configuration and server-owned role approach | **Source added; runtime still needs testing** |
| Admin-protected product-image API using R2 binding | **Source added; live R2 integration not tested** |
| Real admin product catalogue UI | **Planned — Phase 3** |
| Database-backed public product search and listings | **Planned — Phase 4** |
| Verified customer account flows | **Not yet verified** |
| Real inventory reservation, checkout and orders | **Planned — later phases** |
| Payment gateway / automatic payment confirmation | **Not enabled** |
| Production deployment | **Not deployed** |

The npm registry was unavailable during preparation (`EAI_AGAIN`), so dependency installation and the complete framework build could not be verified in that environment. Please see [`docs/PHASE_2_REPORT.md`](docs/PHASE_2_REPORT.md) for exact results and limitations. The project does **not** claim production readiness.

## 🧩 Features in the roadmap

- Product administration: add, edit, draft, publish and archive listings.
- Product image upload, categories, brands, SKU, price, MRP, discount and specifications.
- Variants such as colour and storage, as applicable.
- Accessory stock by SKU/quantity and IMEI/serial tracking for relevant individual devices.
- Customer registration, secure sessions, profiles and saved addresses.
- Search, brand/category/price/condition filters and useful product comparison.
- Cart, checkout, time-limited stock reservation and overselling protection.
- Order lifecycle, manual UPI/bank-transfer verification, optional COD and printable invoices.
- Order fulfilment, tracking, cancellation/return workflows and customer notifications where free configuration is available.
- Admin reporting, CSV exports, inventory alerts and audit history.
- Technical SEO: metadata, canonical URLs, sitemap, structured data and accessible page layouts.
- Responsive desktop/mobile interface with loading, error and empty states.

See the [phase-by-phase roadmap](docs/ROADMAP.md) for the sequence and test gates.

## 🧱 Technology stack

| Layer | Chosen direction | Purpose |
|---|---|---|
| UI | React + TypeScript | Reusable and typed user interface |
| Styling | Tailwind CSS v4 + custom design tokens | Consistent, responsive visual system |
| App/runtime | Vite + Cloudflare Vite plugin + `vinext` compatibility runtime | Lightweight deployment target; compatibility needs a successful full build |
| SQL database | Cloudflare D1 (SQLite dialect) | Product, account, stock and order records |
| Object storage | Cloudflare R2 | Product photos stored privately by default |
| Authentication | Better Auth | Sessions and server-controlled customer/admin roles |
| Developer tools | Git, npm, TypeScript and Python's SQLite library | Reproducible code and offline schema checks |
| Testing | Project verification scripts; unit and browser tests to expand | Protect critical shopping flows |

**Architecture note:** D1 is SQLite-compatible, not PostgreSQL. The codebase is not using Supabase as its required database. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/SOURCES.md`](docs/SOURCES.md).

## 💸 Zero-budget-first operating policy

The project is designed to run on open-source tooling and provider free allowances where possible. The goal is **₹0 mandatory software subscription and infrastructure spend while usage stays within verified free quotas**—not a promise of unlimited resources forever.

- No purchased domain is required to begin; use a provider's free deployment address if available.
- No paid payment gateway is required for the initial workflow; manual UPI/bank-transfer reconciliation and optional COD can be used when operationally appropriate.
- No paid AI API is required for core store features.
- Paid email, SMS, WhatsApp API, shipping or marketing services are optional—not mandatory core dependencies.
- Free quotas must be monitored. On quota exhaustion, the app should warn and fail safely rather than auto-upgrading or silently charging money.

**Business costs still exist:** physical inventory, packaging, shipping, returns, taxes, possible payment charges, and any optional third-party service. A free software stack does not make these costs disappear. Check all plan limits and terms before deploying or adding real customer data.

## 🚀 Run locally

### Requirements

- Node.js 22 or newer
- npm
- Python 3 for the standalone SQLite schema verification
- Network access to the npm registry for dependency installation

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd harvinder-telecom-ecommerce
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with the repository URL after creating it. If you downloaded the ZIP instead, extract it and open a terminal in the project folder.

### 2. Install dependencies

```bash
npm install
```

### 3. Run offline verification checks

```bash
npm run verify:phase1
npm run verify:phase2
python scripts/verify-d1-schema.py
```

These checks do not replace a complete install/build or a browser-to-Worker integration test.

### 4. Check types and build

```bash
npm run typecheck
npm run build
```

At the time this README was prepared, the full build had **not** passed because npm dependency resolution failed in the preparation environment. Run these commands in your own environment and resolve any issues before deployment; do not interpret the standalone preview checks as a successful framework build.

### 5. Start development mode

```bash
npm run dev
```

Open the local URL printed in the terminal. If local D1 or authentication bindings are not configured yet, those server-backed features are not expected to work. Follow [`docs/PHASE_2_SETUP.md`](docs/PHASE_2_SETUP.md) for cautious local setup.

## 🗂️ Repository map

```text
.
├── app/                         # Main application routes, layout and styles
├── lib/                         # Auth and image validation helpers
├── worker/                      # Worker request routing and server endpoints
├── migrations/                  # Versioned D1 SQL migrations
├── public/                      # Static assets and favicon
├── scripts/                     # Verification, migration and admin guard scripts
├── docs/
│   ├── assets/                  # README banner and compact screenshots
│   ├── screenshots/             # Full storefront screenshots
│   ├── ARCHITECTURE.md
│   ├── FREE_TIER_GATES.md
│   ├── PHASE_0_READINESS.md
│   ├── PHASE_1_REPORT.md
│   ├── PHASE_2_REPORT.md
│   ├── PHASE_2_SETUP.md
│   ├── ROADMAP.md
│   └── SOURCES.md
├── preview.html                 # Standalone, demo-only storefront preview
├── package.json
└── wrangler.jsonc               # Cloudflare bindings (D1 ID is a placeholder)
```

## 🗺️ Project roadmap

- [x] **Phase 0:** readiness review, architecture and zero-cost gates documented.
- [x] **Phase 1:** storefront visual foundation and standalone interaction preview created.
- [x] **Phase 2 foundation:** D1 schema, role-safe auth configuration, protected image API source and verification scripts added; runtime/build not yet verified.
- [ ] **Phase 3:** catalogue and admin product-management UI.
- [ ] **Phase 4:** database-backed storefront, search and SEO.
- [ ] **Phase 5:** customer profiles and verified authentication flows.
- [ ] **Phase 6:** cart, checkout and safe inventory reservations.
- [ ] **Phase 7:** orders, manual payment reconciliation and invoices.
- [ ] **Phase 8:** shipping, notifications and support.
- [ ] **Phase 9:** reporting and inventory insights.
- [ ] **Phase 10:** security, accessibility, performance and end-to-end tests.
- [ ] **Phase 11:** production handover and deployment.

A phase is not considered production-ready merely because files have been added; its acceptance tests must pass.

## 🔐 Security-first by design

- Public registration must never grant an administrator role.
- Customer profiles, addresses and order history must be isolated by authenticated identity.
- IMEI and serial-number records must never be exposed on public product pages.
- Product prices, discounts, payment status and stock must be validated server-side.
- Online payment status must not be inferred from a redirect or payment screenshot.
- Product images must be validated, private by default and served only according to publication and access rules.
- Secrets belong in local environment files or provider secret storage—never in Git.
- Test data and demo prices must be clearly distinguished from real inventory.
- No remote database migration or production deployment should run until the target account, free plan, database ID and secret configuration are verified.

See [Phase 2 Setup](docs/PHASE_2_SETUP.md) before testing authentication or remote resource setup.

## 🤝 Feedback and contributions

Ideas and constructive feedback are welcome—especially feedback that makes the store easier for non-technical customers and shop owners.

Helpful contributions include:

- Reporting reproducible bugs with steps to reproduce.
- Suggesting accessibility, usability or mobile improvements.
- Improving documentation or setup instructions.
- Adding tests for product, stock, cart and order rules.
- Proposing simpler workflows for real electronics retail.

Before opening a pull request, describe the problem it solves, keep the change focused, run applicable checks and avoid committing credentials, customer records or real IMEIs. The project does not yet declare an open-source licence; do not assume reuse or redistribution rights until a licence is selected and added.

## 💬 Questions people may have

**Is this store open for customers today?**  
No. It is currently in development and has not been deployed as a production store.

**Can I add products now?**  
The production admin product-management interface is planned for Phase 3. The current preview uses sample content only.

**Are demo prices and stock real?**  
No. They exist to demonstrate the layout and interaction pattern.

**Does it charge for online payments?**  
No live payment provider is enabled. The intended zero-gateway-fee starting point is manual payment reconciliation and optionally COD, depending on store policy.

**Will it always be free?**  
The code and architecture aim to avoid mandatory paid software and stay within provider free tiers. Free quotas, terms and account requirements can change, and real business expenses remain separate.

**Can I help?**  
Yes—start by sharing a clear issue or usability suggestion. Code contributions and reuse are subject to a licence decision.

## 📚 Documentation

- [Phase 0 readiness report](docs/PHASE_0_READINESS.md)
- [Architecture and data entities](docs/ARCHITECTURE.md)
- [Free-tier safeguards](docs/FREE_TIER_GATES.md)
- [Implementation roadmap](docs/ROADMAP.md)
- [Phase 1 report](docs/PHASE_1_REPORT.md)
- [Phase 2 report](docs/PHASE_2_REPORT.md)
- [Phase 2 local setup](docs/PHASE_2_SETUP.md)
- [Official technology references](docs/SOURCES.md)
- [Phase 1 structural-check log](docs/phase1-structural-checks.txt)
- [Phase 2 verification log](docs/phase2-verification.txt)

## 🔎 Help people discover the repository

Suggested GitHub topics:

`ecommerce` `electronics` `mobile-commerce` `retail-tech` `inventory-management` `india` `zero-budget-first` `cloudflare-workers` `cloudflare-d1` `better-auth` `typescript` `react`

> Add `nextjs` as a topic only if the final codebase and runtime genuinely use Next.js. This project currently uses `vinext` with a Cloudflare Vite setup, and its full compatibility build remains a required verification gate.

---

<div align="center">

**Harvinder Telecom — everyday tech, clearer choices.**

Built in phases. Designed for people. Engineered to respect a zero-budget constraint.

</div>
