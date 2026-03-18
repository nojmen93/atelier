# CLAUDE.md — Atelier Project Context

## CRITICAL: Command Output Rules

When you need me to run anything — installing dependencies, running scripts, starting servers, migrations, anything — you MUST output the full command in a copy-pasteable code block every single time.

Rules:
- I am on **Windows** using **Command Prompt** (not PowerShell, not bash)
- Always use `cd` to set the working directory before any command
- Never say "run the install command" or "start the dev server" without the actual command
- If there are multiple steps, number them and give each its own code block
- Include install commands even if you think I already ran them
- Never assume I know the working directory

Example of CORRECT output:
```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm install
```
```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm dev
```

Example of INCORRECT output:
"Run the dev server using your usual command."

This rule applies to every single interaction, no exceptions.

---

## Project Overview

Atelier is a **monorepo** with three apps:

| App | Path | Purpose |
|-----|------|---------|
| Admin panel | `atelier-admin/` | Internal CRUD interface for managing styles, suppliers, concepts, logos, mockups |
| Buyer portal | `atelier-portal/` | B2B portal for approved buyers to browse catalog and place orders |
| Public web | `apps/web/` | Public-facing website (Next.js 14, content managed via admin panel) |

---

## Tech Stack

### Admin (`atelier-admin/`)
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 — dark theme (`bg-black`, `bg-neutral-900`, `border-neutral-800`, `text-white`)
- **Database / Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Turborepo + pnpm workspaces
- **Drag & Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Canvas / Mockups**: Fabric.js v7
- **Image Processing**: `sharp` (server-side metadata extraction)
- **Notifications**: Sonner (toast system)
- **Runtime**: React 19

### Buyer Portal (`atelier-portal/`)
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 — dark theme (same palette as admin)
- **Database / Auth**: Supabase (PostgreSQL + Auth)
- **Runtime**: React 18
- **Key features**: Buyer auth, catalog browsing (per-buyer access & pricing), draft orders, order submission & tracking

### Public Web (`apps/web/`)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Vanilla CSS (custom properties, no Tailwind)
- **Fonts**: Bebas Neue + Outfit (Google Fonts)
- **Content**: Managed via `atelier-admin` — no CMS
- **Deployment**: Vercel

---

## Running the Project

### Admin App

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier\atelier-admin
pnpm install
pnpm dev
```
Runs on: `http://localhost:3000`

### Buyer Portal

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier\atelier-portal
pnpm install
pnpm dev
```
Runs on: `http://localhost:3001`

### Public Web

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier
pnpm install
pnpm dev
```
Runs on: `http://localhost:3000`

---

## Environment Variables

### Admin (`atelier-admin/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Buyer Portal (`atelier-portal/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## File Structure (Admin)

```
atelier-admin/
├── app/
│   ├── admin/              # All admin routes (protected)
│   │   ├── layout.tsx      # Auth guard — redirects to /login if unauthenticated
│   │   ├── page.tsx        # Dashboard with 4 metric cards
│   │   ├── styles/         # Style CRUD (list, new, [id])
│   │   ├── suppliers/      # Supplier CRUD
│   │   ├── concepts/       # Concept + Category hierarchy
│   │   ├── logos/          # Logo library
│   │   └── views/          # Dynamic view builder + renderer
│   ├── api/
│   │   ├── upload/         # Product image upload endpoint
│   │   └── logos/upload/   # Logo upload endpoint (with sharp metadata)
│   └── login/              # Auth page
├── components/
│   ├── CustomizationTab.tsx   # Fabric.js mockup editor
│   ├── ImageUpload.tsx        # Multi-image upload + drag reorder
│   ├── VariantTable.tsx       # Variant CRUD table
│   ├── BulkVariantModal.tsx   # Size x color matrix variant generator
│   ├── ViewBuilder.tsx        # 4-tab view configuration
│   ├── ViewRuntime.tsx        # View renderer with filters/pagination
│   ├── Skeleton.tsx           # SkeletonCard, SkeletonRow, EmptyState
│   └── BackLink.tsx           # Back navigation component
└── lib/
    ├── useKeyboardSave.ts     # Ctrl+S save / Escape close hooks
    ├── view-attributes.ts     # View attribute definitions
    └── supabase/
        ├── server.ts          # Server-side Supabase client
        └── client.ts          # Browser-side Supabase client
```

## File Structure (Buyer Portal)

```
atelier-portal/
├── app/
│   ├── login/                 # Buyer login page
│   ├── access-pending/        # Pending approval screen
│   ├── auth/callback/         # Auth callback handler
│   ├── dashboard/             # Buyer dashboard
│   ├── catalog/               # Catalog grid (buyer-specific)
│   │   └── [id]/              # Style detail + AddToOrderButton
│   └── orders/                # Order list, draft editor, detail
│       ├── new/               # Draft order (DraftOrderClient)
│       └── [id]/              # Order detail
├── components/
│   ├── TopNav.tsx             # Navigation bar
│   └── LogoutButton.tsx       # Logout button
└── lib/
    ├── get-buyer.ts           # Auth helper (getBuyer)
    ├── order-actions.ts       # Server actions (addToOrder, submitOrder, etc.)
    └── supabase/
        ├── server.ts          # Server-side Supabase client
        ├── client.ts          # Browser-side Supabase client
        ├── service.ts         # Service role client
        └── middleware.ts      # Auth middleware helper
```

---

## Code Conventions

- **Server Components**: Use for all data fetching (`page.tsx` files under `admin/`)
- **Client Components**: `'use client'` for interactive forms and mutations
- **Supabase**: `@/lib/supabase/server` in server components, `@/lib/supabase/client` in client components
- **Errors**: `toast.error()` from Sonner — never `alert()`
- **Loading states**: `Skeleton` components from `components/Skeleton.tsx`
- **Keyboard shortcuts**: `useKeyboardSave` / `useEscapeClose` from `lib/useKeyboardSave.ts`
- **Styling**: Tailwind dark theme only — do not introduce light mode classes

---

## Key Routes (Admin)

| Route | Purpose |
|-------|---------|
| `/login` | Auth page |
| `/admin` | Dashboard |
| `/admin/styles` | Style list (drag-and-drop reorder) |
| `/admin/styles/new` | Create style |
| `/admin/styles/[id]` | Edit style — 3 tabs: Details, Variants, Customization |
| `/admin/suppliers` | Supplier list |
| `/admin/concepts` | Concept + Category hierarchy |
| `/admin/logos` | Logo library gallery |
| `/admin/views` | View builder list |
| `/admin/views/[id]/render` | Live view renderer |

## Key Routes (Buyer Portal)

| Route | Purpose |
|-------|---------|
| `/login` | Buyer login |
| `/access-pending` | Waiting for admin approval |
| `/dashboard` | Buyer dashboard |
| `/catalog` | Product catalog (filtered by buyer access) |
| `/catalog/[id]` | Style detail with variant picker |
| `/orders` | Order history |
| `/orders/new` | Draft order editor |
| `/orders/[id]` | Order detail |

---

## Documentation Files

All project documentation lives at the monorepo root:

| File | Purpose |
|------|---------|
| `ADMIN_SYSTEM_DOCUMENTATION.md` | Full feature specs, DB schema, component index |
| `DEMO_WALKTHROUGH.md` | Step-by-step demo guide for every feature |
| `TESTING_CHECKLIST.md` | Comprehensive QA checklist |
| `ADMIN_SCREENSHOTS.md` | Screenshot reference guide |

> When adding features: update `ADMIN_SYSTEM_DOCUMENTATION.md` (features section, DB schema, file structure).

---

## Known Limitations

- No pagination on style/supplier list pages
- No search or filter on style/supplier lists (use Views instead)
- Images are not deleted from Supabase Storage when removed from a style
- No role-based access control — single admin role only
- No audit log
- PDF export in View Builder is not yet implemented (placeholder page exists)
- Active nav link not highlighted in top bar
