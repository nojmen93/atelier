# Atelier — Custom Apparel Platform

A full-stack platform for managing a custom apparel brand, built as a monorepo with three applications: an internal admin panel, a B2B buyer portal, and a public-facing website.

## Architecture

```
atelier/
├── atelier-admin/       # Admin panel (Next.js 16) — internal CRUD, mockup generator, view builder
├── atelier-portal/      # Buyer portal (Next.js 14) — B2B catalog browsing & ordering
├── apps/
│   └── web/             # Public website (Next.js 14) — customer-facing site
├── turbo.json           # Turborepo build config
├── pnpm-workspace.yaml  # Workspace definitions
└── package.json         # Root monorepo scripts
```

## Apps

### Admin Panel (`atelier-admin/`)

Internal dashboard for managing the entire product catalog.

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS v4 (dark theme)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Key features**: Style CRUD, supplier management, concept/category hierarchy, logo library, Fabric.js mockup generator, dynamic view builder, drag-and-drop reordering, variant management
- **Port**: `http://localhost:3000`

### Buyer Portal (`atelier-portal/`)

B2B portal where approved buyers can browse their assigned catalog and place orders.

- **Framework**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS v3 (dark theme)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Key features**: Buyer authentication, catalog browsing (with per-buyer product access & pricing), draft order management, order submission & tracking
- **Port**: `http://localhost:3001`

### Public Website (`apps/web/`)

Public-facing marketing website, content managed through the admin panel.

- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (custom properties, no Tailwind)
- **Fonts**: Bebas Neue + Outfit (Google Fonts)
- **Deployment**: Vercel
- **Port**: `http://localhost:3000`

## Prerequisites

- Node.js 18+
- pnpm 9+
- Supabase project (free tier works)

## Quick Start

### 1. Clone and Install

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm install
```

### 2. Configure Environment

Create environment files for each app that connects to Supabase:

**`atelier-admin/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**`atelier-portal/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Supabase Setup

1. Create a Supabase project
2. Create the required database tables (see `ADMIN_SYSTEM_DOCUMENTATION.md` for full schema)
3. Create Storage buckets with public access: `product-images`, `logos`
4. Enable email/password authentication
5. Create admin and buyer users via the Supabase dashboard

### 4. Run Development

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm dev
```

Or run individual apps:

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm dev:admin
```

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm dev:portal
```

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm dev:web
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo + pnpm workspaces |
| **Framework** | Next.js 14 / 16 (App Router) |
| **Language** | TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (email/password) |
| **Storage** | Supabase Storage (product images, logos, mockups) |
| **Styling** | Tailwind CSS v3/v4 (admin + portal), Vanilla CSS (web) |
| **Drag & Drop** | @dnd-kit/core + @dnd-kit/sortable |
| **Canvas** | Fabric.js v7 (mockup generator) |
| **Notifications** | Sonner (toast system) |
| **Deployment** | Vercel |

## Database Tables

### Core (Admin)

| Table | Purpose |
|-------|---------|
| `styles` | Product catalog (name, images, pricing, status, variants) |
| `concepts` | Top-level grouping for styles |
| `categories` | Sub-grouping under concepts |
| `suppliers` | Supplier directory (MOQ, lead time, location) |
| `logos` | Brand logo library with metadata |
| `customizations` | Mockup configurations (logo placement, technique) |
| `variants` | Size/color/SKU variants per style |
| `views` | Saved view configurations for filtering/display |

### Buyer Portal

| Table | Purpose |
|-------|---------|
| `buyers` | Registered buyer accounts (company, contact info) |
| `buyer_product_access` | Per-buyer style access with optional price overrides |
| `buyer_orders` | Orders with status tracking (draft, pending, confirmed, in_production, shipped) |
| `buyer_order_line_items` | Order line items (variant, quantity, unit price, placement notes) |

## Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project context & code conventions for AI assistance |
| `ADMIN_SYSTEM_DOCUMENTATION.md` | Full admin feature specs, DB schema, component index |
| `DEMO_WALKTHROUGH.md` | Step-by-step demo guide for every admin feature |
| `TESTING_CHECKLIST.md` | Comprehensive QA checklist |
| `ADMIN_SCREENSHOTS.md` | Visual reference with ASCII layouts |

## Deployment

### Vercel (Web)

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier\apps\web
vercel
```

Required environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## License

Private — All rights reserved.
