# Atelier — Custom Apparel Management Platform

A B2B custom apparel management platform built with Next.js and Supabase. The monorepo contains two applications:

- **atelier-admin** — Internal admin panel for managing styles, suppliers, quotes, orders, mockups, and more
- **apps/web** — Customer-facing website for browsing products and submitting quote requests

## Architecture

```
atelier/
├── atelier-admin/    # Admin panel (Next.js 16, React 19, Tailwind CSS v4)
├── apps/
│   └── web/          # Public website (Next.js 14, React 18)
├── package.json      # Root monorepo config
├── pnpm-workspace.yaml
└── turbo.json
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase account (free tier works)

## Quick Start

### 1. Clone and Install

```bash
cd atelier
pnpm install
```

### 2. Configure Environment

#### Admin app (`atelier-admin/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Web app (`apps/web/.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create the database tables (see `ADMIN_SYSTEM_DOCUMENTATION.md` → Database Schema)
3. Create two Storage buckets with **public** read access:
   - `product-images` — style photos and exported mockups
   - `logos` — brand logo files
4. Enable **Email/Password** auth in the Supabase dashboard
5. Create an admin user via the Supabase dashboard → Authentication → Users
6. Copy the project URL, anon key, and service role key into the `.env.local` files

### 4. Run Development

```bash
# Run all apps in parallel
pnpm dev

# Or run individually:
pnpm dev:admin   # http://localhost:3000 (admin panel)
pnpm dev:web     # http://localhost:3001 (public website)
```

## Applications

### Atelier Admin (`atelier-admin/`)

The internal management panel. Features include:

- **Authentication** — Email/password login via Supabase Auth; all `/admin/*` routes are server-side protected
- **Dashboard** — Key metrics for styles, production, quotes, and orders; recent quote activity
- **Style Management** — Full CRUD for apparel styles with image upload, variant management (individual + bulk), drag-and-drop ordering, and status tracking (Development / Active / Archived)
- **Product Hierarchy** — Concepts → Categories two-level taxonomy with drag-and-drop ordering
- **Colour Library** — Manage colourways with auto-generated colour codes and GS1 US codes
- **Quote Requests** — Full lifecycle quote management (New → Reviewed → Quoted → Accepted/Rejected → Converted); integrated price calculator; email quote modal; convert quote to style
- **Order Management** — Track orders with status progression (Confirmed → In Production → Shipped → Delivered)
- **Suppliers & Factories** — CRUD for production partners with MOQ, lead time, and location
- **Logo Library** — Upload brand logos (SVG, PNG, AI, EPS); automatic dimension extraction; gallery view
- **Mockup Generator** — Fabric.js canvas for placing logos on product images; 5 placement positions; embroidery and print technique previews; export as 2× PNG
- **Dynamic View Builder** — Build gallery/grid views of styles with configurable attributes, filters, sort, and group-by

### Atelier Web (`apps/web/`)

The public-facing website. Features include:

- Homepage with product showcase and hero section
- Quote request form for customers
- Quote detail page (`/quote/[id]`)
- Journal/blog section (`/journal`)

## Tech Stack

### Admin (`atelier-admin`)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5.9.3 |
| Runtime | React 19.2.3 |
| Styling | Tailwind CSS v4 (dark UI theme) |
| Database/Auth | Supabase (PostgreSQL + Auth + Storage) |
| Monorepo | Turborepo + pnpm workspaces |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Canvas/Mockups | Fabric.js v7 |
| Image Processing | sharp (server-side metadata extraction) |
| Notifications | Sonner (toast system) |
| Icons | lucide-react |

### Web (`apps/web`)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14.2.0 (App Router) |
| Language | TypeScript 5.4.0 |
| Runtime | React 18.3.0 |
| Database | Supabase |

## Project Structure

### Admin (`atelier-admin/`)

| Path | Description |
|------|-------------|
| `app/login/` | Authentication page |
| `app/admin/` | Protected admin routes |
| `app/admin/page.tsx` | Dashboard with metrics |
| `app/admin/styles/` | Style CRUD |
| `app/admin/styles/colours/` | Colour library |
| `app/admin/styles/hierarchy/` | Hierarchy browser |
| `app/admin/styles/specification/` | Specification view |
| `app/admin/quotes/` | Quote request management |
| `app/admin/orders/` | Order management |
| `app/admin/suppliers/` | Supplier management |
| `app/admin/factories/` | Factory management |
| `app/admin/logos/` | Logo library |
| `app/admin/mockup/` | Standalone mockup generator |
| `app/admin/concepts/` | Concept & category hierarchy |
| `app/admin/views/` | Dynamic view builder |
| `app/admin/settings/` | Admin settings |
| `components/` | Reusable UI components |
| `lib/supabase/` | Supabase server/client/admin helpers |

### Web (`apps/web/`)

| Path | Description |
|------|-------------|
| `app/page.tsx` | Homepage |
| `app/quote/[id]/` | Quote detail for customers |
| `app/journal/` | Blog/journal pages |
| `app/api/quote-request/` | Quote submission endpoint |
| `app/api/quote/respond/` | Quote response endpoint |

## Deployment

### Vercel

Both apps can be deployed to Vercel independently:

```bash
# Admin
cd atelier-admin && vercel

# Web
cd apps/web && vercel
```

Environment variables needed for each app match the `.env.local` variables above.

## Documentation

- **`ADMIN_SYSTEM_DOCUMENTATION.md`** — Full feature reference, database schema, file structure, and development guidelines for the admin panel
- **`DEMO_WALKTHROUGH.md`** — Step-by-step walkthrough of every admin feature
- **`TESTING_CHECKLIST.md`** — QA checklist for all features
- **`ADMIN_SCREENSHOTS.md`** — ASCII visual documentation of every admin page

## License

Private — All rights reserved.
