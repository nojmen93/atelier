# Atelier — Custom Apparel Studio

A premium custom apparel brand management platform. The monorepo contains three applications: a public-facing marketing site, a Sanity CMS studio, and a full admin dashboard for internal product lifecycle management.

## Architecture

```
atelier/
├── atelier-admin/    # Admin dashboard — Next.js 16 (App Router)
├── apps/
│   ├── web/          # Public website — Next.js 14 (App Router)
│   └── studio/       # Sanity Studio v3 (CMS)
└── packages/
    └── config/       # Shared configs (future)
```

### Atelier Admin (`atelier-admin/`)

An internal Product Lifecycle Management (PLM) dashboard for managing styles, suppliers, logos, customizations, quotes, orders, and factories. See [`ADMIN_SYSTEM_DOCUMENTATION.md`](./ADMIN_SYSTEM_DOCUMENTATION.md) for full documentation.

**Key features:**
- Style catalog (CRUD, variants, drag-and-drop reorder, image upload)
- Concept & Category hierarchy
- Supplier & Factory management
- Logo Library with Canvas 2D mockup generator
- Standalone Mockup Generator with product templates
- Quote request system with email templates
- Order management
- Dynamic View Builder (gallery/grid + PDF export)
- Settings — user management via Supabase Auth Admin API

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Supabase (PostgreSQL + Auth + Storage), @dnd-kit, Sonner

**Local setup:**

```bash
# Create atelier-admin/.env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

cd atelier-admin && npm run dev   # http://localhost:3000
```

## Prerequisites

- Node.js 18+
- pnpm 9+
- Sanity account (free tier works)

## Quick Start

### 1. Clone and Install

```bash
cd atelier
pnpm install
```

### 2. Create Sanity Project

```bash
# Login to Sanity
npx sanity login

# Create a new project (run from apps/studio)
cd apps/studio
npx sanity init --env

# This will create a .env file with your project ID
```

### 3. Configure Environment

Copy the env examples and fill in your values:

```bash
# Web app
cp apps/web/.env.example apps/web/.env.local

# Studio (should already exist from sanity init)
cp apps/studio/.env.example apps/studio/.env
```

Edit `apps/web/.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### 4. Run Development

```bash
# Run both web and studio
pnpm dev

# Or separately:
pnpm dev:web    # http://localhost:3000
pnpm dev:studio # http://localhost:3333
```

### 5. Add Portfolio Content

1. Open Sanity Studio at `http://localhost:3333`
2. Create new Portfolio Projects
3. Upload images, set categories, adjust order
4. Content appears automatically on the website

## Deployment

### Vercel (Web)

```bash
cd apps/web
vercel
```

Environment variables needed:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_SANITY_API_VERSION`

### Sanity Studio

```bash
cd apps/studio
npx sanity deploy
```

This deploys to `your-project.sanity.studio`

## Project Structure

### Web (`apps/web`)

| Path | Description |
|------|-------------|
| `app/page.tsx` | Main page component |
| `app/components/` | All UI components |
| `app/globals.css` | Full CSS (no Tailwind) |
| `lib/sanity.ts` | Sanity client + queries |

### Studio (`apps/studio`)

| Path | Description |
|------|-------------|
| `schemas/project.ts` | Portfolio project schema |
| `sanity.config.ts` | Studio configuration |

## Adding More Editable Content

To make services, process steps, or copy editable:

1. Create new schema in `apps/studio/schemas/`
2. Add to `schemas/index.ts`
3. Create query in `apps/web/lib/sanity.ts`
4. Fetch data in component

Example for services:

```ts
// apps/studio/schemas/service.ts
export default defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({ name: 'number', type: 'string' }),
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'description', type: 'text' }),
    defineField({ name: 'order', type: 'number' }),
  ],
})
```

## Tech Stack

### Public Website (`apps/web`)
- **Framework**: Next.js 14 (App Router)
- **CMS**: Sanity v3
- **Styling**: Vanilla CSS (custom properties)
- **Fonts**: Bebas Neue + Outfit (Google Fonts)
- **Deployment**: Vercel + Sanity Cloud

### Admin Dashboard (`atelier-admin`)
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (dark theme)
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Canvas**: Native Canvas 2D API (mockup generation)
- **Drag & Drop**: @dnd-kit

### Monorepo
- **Tooling**: pnpm 9 + Turborepo v2

## License

Private — All rights reserved.
