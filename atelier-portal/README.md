# Atelier Buyer Portal

B2B portal for approved buyers to browse the catalog and place orders.

## Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS v3 (dark theme)
- **Database & Auth**: Supabase (PostgreSQL + Auth)

## Getting Started

```cmd
cd C:\Users\Acer Nordics\Desktop\atelier\atelier-portal
pnpm install
pnpm dev
```

Runs on `http://localhost:3001`.

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features

- **Buyer Authentication** — Email/password login with access-pending screen for unapproved buyers
- **Catalog Browsing** — Grid view of styles the buyer has been granted access to, with per-buyer price overrides
- **Style Detail** — Product images, variant selection (color + size picker), pricing, add-to-order
- **Draft Orders** — Cart-like draft order management with quantity controls, line item notes, and order-level notes
- **Order Submission** — Submit draft orders for processing, automatic status tracking
- **Order History** — View all orders with status badges (draft, pending, confirmed, in_production, shipped)

## Key Routes

| Route | Purpose |
|-------|---------|
| `/login` | Buyer login |
| `/access-pending` | Waiting for admin approval |
| `/dashboard` | Buyer dashboard (recent orders, quick stats) |
| `/catalog` | Product catalog (filtered by buyer access) |
| `/catalog/[id]` | Style detail with variant picker |
| `/orders` | Order history |
| `/orders/new` | Draft order editor |
| `/orders/[id]` | Order detail |

## Database Tables

| Table | Purpose |
|-------|---------|
| `buyers` | Buyer accounts (linked to Supabase Auth users) |
| `buyer_product_access` | Per-buyer style access with optional price overrides |
| `buyer_orders` | Orders with status tracking |
| `buyer_order_line_items` | Order line items (variant, quantity, price, notes) |

## Architecture

- **Server Components** fetch data and validate buyer access
- **Client Components** handle interactivity (variant picker, draft order editor)
- **Server Actions** (`lib/order-actions.ts`) handle order mutations
- **Middleware** refreshes Supabase auth sessions on each request
- **Service Client** used for elevated-permission operations (order management)
