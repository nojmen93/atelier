# Atelier Admin System Documentation

## 1. Overview

**Atelier Admin** is an internal admin panel for managing a custom apparel brand's product catalog, suppliers, and categories. It provides a full CRUD interface with image uploads, variant management, and drag-and-drop reordering.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (dark UI theme)
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Turborepo with pnpm workspaces
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Runtime**: React 19

### Current Features Completed

- Authentication (Supabase Auth, email/password)
- Product CRUD with image upload, category assignment, and variants
- Supplier CRUD
- Category & Subcategory management
- Image upload to Supabase Storage with drag reordering
- Variant management (individual + bulk creation)
- Dashboard with metrics
- Drag-and-drop display order for products and categories
- Back navigation on all edit/new pages

---

## 2. Features Implemented

### Authentication & User Management

- Email/password login via Supabase Auth (`/login`)
- Admin layout checks auth via `supabase.auth.getUser()` and redirects to `/login` if unauthenticated
- Server-side auth check in `app/admin/layout.tsx`
- Client-side Supabase client for mutations

### Product Management

- **List**: `/admin/products` — grid layout with drag-and-drop reordering
- **Create**: `/admin/products/new` — form with name, description, material, base cost, category/subcategory selection, image upload
- **Edit**: `/admin/products/[id]` — all fields editable, publish/unpublish toggle, soft delete (archived flag)
- **Images**: Multi-image upload with drag reorder, primary image indicator
- **Variants**: Inline table with add/edit/delete, bulk variant creation modal (size x color matrix with auto-SKU generation)
- **Display Order**: Drag-and-drop reordering with immediate database persistence

### Supplier Management

- **List**: `/admin/suppliers` — card layout showing MOQ, lead time, location, contact
- **Create**: `/admin/suppliers/new` — name, email, MOQ, lead time, location
- **Edit**: `/admin/suppliers/[id]` — all fields editable, delete with confirmation

### Category & Subcategory System

- **List**: `/admin/categories` — drag-and-drop reordering, shows subcategories inline
- **Create**: `/admin/categories/new` — name, auto-generated slug, description, display order
- **Edit**: `/admin/categories/[id]` — edit fields, manage subcategories, delete with cascade warning
- **Subcategory Create**: `/admin/categories/[id]/subcategories/new` — name, slug, description, display order
- **Display Order**: Drag-and-drop reordering with immediate database persistence

### Image Upload System

- Upload endpoint: `/api/upload` (POST)
- Validates file type (JPG, PNG, WebP) and size (max 5MB)
- Uploads to Supabase Storage `product-images` bucket using service role key
- Returns public URL
- Client-side: multi-file upload with progress indicators
- Drag-and-drop image reordering within the form

### Variant Management

- Individual add/edit/delete with inline table editing
- Bulk creation modal: select sizes (XS-XXL) x colors (presets + custom)
- Auto-generated SKUs from product name + size + color
- Stock tracking and price modifier per variant

### Dashboard Metrics

- Total products count
- Published products count
- Total suppliers count

### Back Navigation

- `BackLink` component with arrow icon and hover state
- Used on all edit/new pages, linking back to parent list

### Display Order Drag-and-Drop

- Products and categories support drag-and-drop reordering
- Uses @dnd-kit/core and @dnd-kit/sortable
- Drag handles (6-dot grip icon) on each item
- Visual feedback: opacity reduction during drag, overlay while dragging
- Order saved to database immediately on drop
- 8px activation distance to prevent accidental drags

---

## 3. Database Schema

All tables are managed in Supabase (PostgreSQL). UUIDs are used for primary keys.

### `products`

| Field           | Type      | Notes                                |
|-----------------|-----------|--------------------------------------|
| id              | uuid      | Primary key                          |
| name            | text      | Required                             |
| description     | text      | Nullable                             |
| material        | text      | Nullable                             |
| base_cost       | numeric   | Nullable, in EUR                     |
| published       | boolean   | Default false                        |
| archived        | boolean   | Default false (soft delete)          |
| subcategory_id  | uuid      | FK → subcategories.id               |
| images          | text[]    | Array of public URLs                 |
| display_order   | integer   | For sorting                          |
| created_at      | timestamp | Auto-generated                       |

### `categories`

| Field         | Type      | Notes                |
|---------------|-----------|----------------------|
| id            | uuid      | Primary key          |
| name          | text      | Required             |
| slug          | text      | URL-friendly name    |
| description   | text      | Nullable             |
| display_order | integer   | For sorting          |
| created_at    | timestamp | Auto-generated       |

### `subcategories`

| Field         | Type      | Notes                |
|---------------|-----------|----------------------|
| id            | uuid      | Primary key          |
| category_id   | uuid      | FK → categories.id   |
| name          | text      | Required             |
| slug          | text      | URL-friendly name    |
| description   | text      | Nullable             |
| display_order | integer   | For sorting          |
| created_at    | timestamp | Auto-generated       |

### `suppliers`

| Field               | Type      | Notes          |
|---------------------|-----------|----------------|
| id                  | uuid      | Primary key    |
| name                | text      | Required       |
| contact_email       | text      | Nullable       |
| moq                 | integer   | Nullable       |
| lead_time_days      | integer   | Nullable       |
| production_location | text      | Nullable       |
| created_at          | timestamp | Auto-generated |

### `variants`

| Field          | Type    | Notes              |
|----------------|---------|---------------------|
| id             | uuid    | Primary key         |
| product_id     | uuid    | FK → products.id    |
| size           | text    | Nullable            |
| color          | text    | Nullable            |
| sku            | text    | Nullable, unique    |
| stock          | integer | Default 0           |
| price_modifier | numeric | Default 0           |

### Relationships

- `products.subcategory_id` → `subcategories.id`
- `subcategories.category_id` → `categories.id`
- `variants.product_id` → `products.id`
- Deleting a category cascades to its subcategories
- Products use soft delete (archived = true)

---

## 4. File Structure

```
atelier/
├── atelier-admin/                    # Main admin application
│   ├── app/
│   │   ├── layout.tsx                # Root layout (HTML, metadata)
│   │   ├── globals.css               # Global styles
│   │   ├── login/
│   │   │   └── page.tsx              # Login page (email/password)
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin layout (auth check, nav bar)
│   │   │   ├── page.tsx              # Dashboard with metrics
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Product list (sortable)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New product form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit product (server component)
│   │   │   │       └── ProductEditForm.tsx  # Edit form (client)
│   │   │   ├── suppliers/
│   │   │   │   ├── page.tsx          # Supplier list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New supplier form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit supplier (server)
│   │   │   │       └── SupplierEditForm.tsx  # Edit form (client)
│   │   │   └── categories/
│   │   │       ├── page.tsx          # Category list (sortable)
│   │   │       ├── new/
│   │   │       │   └── page.tsx      # New category form
│   │   │       └── [id]/
│   │   │           ├── page.tsx      # Edit category (server)
│   │   │           ├── CategoryEditForm.tsx  # Edit form (client)
│   │   │           └── subcategories/
│   │   │               └── new/
│   │   │                   └── page.tsx  # New subcategory form
│   │   └── api/
│   │       └── upload/
│   │           └── route.ts          # Image upload API endpoint
│   ├── components/
│   │   ├── BackLink.tsx              # Back navigation component
│   │   ├── ImageUpload.tsx           # Multi-image upload with drag reorder
│   │   ├── VariantTable.tsx          # Variant management table
│   │   ├── BulkVariantModal.tsx      # Bulk variant creation modal
│   │   ├── SortableProductList.tsx   # Drag-and-drop product list
│   │   └── SortableCategoryList.tsx  # Drag-and-drop category list
│   ├── lib/
│   │   └── supabase/
│   │       ├── server.ts             # Server-side Supabase client
│   │       └── client.ts             # Browser-side Supabase client
│   ├── package.json
│   └── tsconfig.json
├── apps/
│   └── web/                          # Public-facing web app (separate)
├── package.json                      # Root monorepo config
├── pnpm-workspace.yaml
├── turbo.json
└── ADMIN_SYSTEM_DOCUMENTATION.md     # This file
```

### Key Components

| Component              | Purpose                                    |
|------------------------|--------------------------------------------|
| `BackLink`             | Reusable back arrow navigation link        |
| `ImageUpload`          | Multi-file upload with drag reorder        |
| `VariantTable`         | CRUD table for product variants            |
| `BulkVariantModal`     | Size x color matrix variant generator      |
| `SortableProductList`  | Drag-and-drop product grid                 |
| `SortableCategoryList` | Drag-and-drop category list                |

---

## 5. Environment Setup

### Required `.env.local` Variables

Create `atelier-admin/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Setup

1. Create a Supabase project
2. Create the tables listed in Section 3 (Database Schema)
3. Create a Storage bucket called `product-images` with public access
4. Enable email/password auth in Authentication settings
5. Create an admin user via the Supabase dashboard
6. Copy the project URL, anon key, and service role key to `.env.local`

### How to Run Locally

```bash
# Install dependencies
pnpm install

# Run the admin app
pnpm dev:studio
# Or directly:
cd atelier-admin && npm run dev
```

The app runs on `http://localhost:3000` by default.

---

## 6. Development Guidelines Going Forward

> **IMPORTANT: All future changes MUST be documented in this file.**

When adding features:
- Update the **Features** section (Section 2) with a description of the new feature
- Update **Database Schema** (Section 3) if tables or columns change
- Update **File Structure** (Section 4) if new routes or components are added
- Include examples and usage notes where helpful

When modifying existing features:
- Update the relevant feature description
- Note any breaking changes or migration steps needed

When fixing bugs:
- No documentation update required unless the fix changes expected behavior

### Code Conventions

- **Server Components** for data fetching (page.tsx files under admin/)
- **Client Components** ('use client') for interactive forms and mutations
- **Supabase clients**: Use `@/lib/supabase/server` for server components, `@/lib/supabase/client` for client components
- **Styling**: Tailwind CSS with dark theme (bg-black, bg-neutral-900, border-neutral-800, text-white)
- **Forms**: Controlled inputs with useState, submit handlers with loading states
- **Error handling**: `alert()` for user-facing errors (to be improved)

---

## 7. Known Limitations / TODO

### Planned Features

- **Logo Library** — Upload and manage brand logos for mockup generation
- **Mockup Generator** — Generate product mockups with uploaded designs
- **B2B Portal** — Customer-facing portal for browsing catalog and placing orders

### In Progress

- **Display Order Drag-and-Drop** — Implemented for products and categories. Subcategory reordering within category edit page is planned.

### Known Limitations

- Error handling uses `alert()` — should migrate to toast notifications
- No pagination on list pages
- No search/filter on product or supplier lists
- No image deletion from Supabase Storage when removed from a product
- Variant SKU uniqueness not enforced client-side
- No role-based access control (single admin role only)
- No audit log for changes
- Subcategory edit page does not exist (only create)
