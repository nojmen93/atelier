# Atelier Admin Panel

Internal admin dashboard for managing the Atelier custom apparel catalog.

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript, React 19
- **Styling**: Tailwind CSS v4 (dark theme)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Canvas**: Fabric.js v7 (mockup generator)
- **Image Processing**: sharp (server-side metadata)
- **Notifications**: Sonner (toast system)

## Getting Started

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier\atelier-admin
pnpm install
pnpm dev
```

Runs on `http://localhost:3000`.

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features

- **Style Management** — Full CRUD with image uploads, concept/category assignment, status tracking, drag-and-drop reordering
- **Variant Management** — Individual and bulk creation (size x color matrix), auto-generated SKUs, stock and price tracking
- **Supplier Management** — Directory with MOQ, lead times, and location
- **Concept & Category Hierarchy** — Two-level grouping system with drag-and-drop ordering
- **Logo Library** — Upload SVG/PNG/AI/EPS with automatic metadata extraction
- **Mockup Generator** — Fabric.js canvas with logo placement, embroidery/print techniques, zoom controls, PNG export
- **Dynamic View Builder** — Configurable gallery/grid views with filters, sorting, grouping, and pagination
- **Dashboard** — Metric cards for styles, concepts, and suppliers

## Key Routes

| Route | Purpose |
|-------|---------|
| `/login` | Authentication |
| `/admin` | Dashboard |
| `/admin/styles` | Style list (drag-and-drop) |
| `/admin/styles/new` | Create style |
| `/admin/styles/[id]` | Edit style (Details, Variants, Customization tabs) |
| `/admin/suppliers` | Supplier list |
| `/admin/concepts` | Concept & category hierarchy |
| `/admin/logos` | Logo library gallery |
| `/admin/views` | View builder list |
| `/admin/views/[id]/render` | Live view renderer |

## Documentation

See `ADMIN_SYSTEM_DOCUMENTATION.md` in the monorepo root for full feature specs, database schema, and component reference.
