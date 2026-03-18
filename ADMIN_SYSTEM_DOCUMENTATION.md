# Atelier Admin System Documentation

## 1. Overview

**Atelier Admin** is an internal admin panel for managing a custom apparel brand's style catalog, suppliers, logos, and customizations. It provides a full CRUD interface with image uploads, variant management, drag-and-drop reordering, a Fabric.js-powered mockup generator, and a dynamic view builder with PDF export.

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (dark UI theme)
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Turborepo with pnpm workspaces
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Canvas/Mockups**: Fabric.js v7 (fabric)
- **Image Processing**: sharp (metadata extraction)
- **Notifications**: Sonner (toast system)
- **Runtime**: React 19

### Current Features Completed

- Authentication (Supabase Auth, email/password)
- Style CRUD with image upload, concept/category assignment, and variants
- Supplier CRUD
- Concept & Category hierarchy management
- Logo Library with upload, metadata extraction, and gallery
- Customization Engine — Fabric.js mockup generator with embroidery/print techniques
- Dynamic View Builder with gallery/grid modes and PDF export
- Image upload to Supabase Storage with drag reordering
- Variant management (individual + bulk creation)
- Dashboard with metrics (styles, concepts, suppliers)
- Drag-and-drop display order for styles, concepts, and categories
- Toast notification system (Sonner)
- Loading states (skeleton components)
- Keyboard shortcuts (Cmd+S save, Escape close)
- Empty states for all list pages
- Back navigation on all edit/new pages

---

## 2. Features Implemented

### Authentication & User Management

- Email/password login via Supabase Auth (`/login`)
- Admin layout checks auth via `supabase.auth.getUser()` and redirects to `/login` if unauthenticated
- Server-side auth check in `app/admin/layout.tsx`
- Client-side Supabase client for mutations
- Toast notifications for login errors

### Style Management (formerly Products)

> Products have been renamed to Styles. The `/admin/products` route redirects to `/admin/styles`.

- **List**: `/admin/styles` — sortable card grid with drag-and-drop reordering, status badges, variant counts
- **Create**: `/admin/styles/new` — form with name, concept, category, gender, collection type, product capability, status, description, material, supplier, base cost, lead time, customization mode, image upload
- **Edit**: `/admin/styles/[id]` — tabbed interface with 3 tabs:
  - **Details**: All style fields editable, status dropdown (Development/Active/Archived) with color-coded badge, keyboard save (Cmd+S)
  - **Variants**: Inline table with add/edit/delete, bulk variant creation modal (size x color matrix with auto-SKU generation)
  - **Customization**: Fabric.js mockup editor (see Customization Engine section)
- **Images**: Multi-image upload with drag reorder, primary image indicator
- **Archive**: Soft delete by setting `status = 'archived'`, with confirmation dialog
- **Display Order**: Drag-and-drop reordering with immediate database persistence

### Supplier Management

- **List**: `/admin/suppliers` — card layout showing MOQ, lead time, location, contact
- **Create**: `/admin/suppliers/new` — name, email, MOQ, lead time, location
- **Edit**: `/admin/suppliers/[id]` — all fields editable, delete with confirmation
- **Empty State**: Styled empty state with icon and CTA button

### Concept & Category System

> The system uses a two-level hierarchy: Concepts contain Categories.

- **Concepts List**: `/admin/concepts` — drag-and-drop reordering, shows categories inline
- **Create Concept**: `/admin/concepts/new` — name, auto-generated slug, description
- **Edit Concept**: `/admin/concepts/[id]` — edit fields, manage categories, delete with cascade
- **Create Category**: `/admin/concepts/[id]/categories/new` — name, slug, description, display order
- **Display Order**: Drag-and-drop reordering with immediate database persistence

### Legacy Category & Subcategory System

- **List**: `/admin/categories` — drag-and-drop reordering, shows subcategories inline
- **Create**: `/admin/categories/new` — name, auto-generated slug, description, display order
- **Edit**: `/admin/categories/[id]` — edit fields, manage subcategories, delete with cascade warning
- **Subcategory Create**: `/admin/categories/[id]/subcategories/new` — name, slug, description, display order

### Logo Library

- **Gallery**: `/admin/logos` — responsive grid (2-4 columns) with image previews for PNG/SVG, format labels for AI/EPS
- **Upload**: `/admin/logos/new` — upload form with company name, file picker, client-side preview and dimension extraction
- **Detail**: `/admin/logos/[id]` — large preview, metadata grid (format, dimensions, upload date, file URL), edit company name, delete with confirmation
- **Upload API**: `/api/logos/upload` (POST)
  - Accepts SVG, AI, EPS, PNG (max 10 MB)
  - Extracts dimensions: PNG via `sharp`, SVG via regex on width/height/viewBox
  - Stores in Supabase Storage `logos` bucket
  - Inserts metadata into `logos` table
- **Empty State**: Styled empty state with icon and "Upload First Logo" CTA
- **Keyboard Save**: Cmd+S on logo detail page

### Enhanced Mockup Generator (Customization Engine)

Powered by **Fabric.js v7** (`components/CustomizationTab.tsx`).

- **Interactive Canvas**: 500x600px canvas with product image as background
- **Logo Placement**: 5 predefined positions — Center Front, Center Back, From HSP, Center on WRS, Center on WLS
- **Technique Toggle**: Embroidery (stitch texture, shadow overlay, 85% opacity) vs Print (flat, 95% opacity)
- **Real-time Preview**: Logo, placement, technique, and size changes update canvas instantly
- **Logo Format Support**: PNG/SVG rendered directly, AI/EPS shown as labeled placeholder
- **Size Controls**: Width/height in cm (0.5-50 cm range), mapped to canvas proportionally
- **Pantone Color**: Text field for color reference
- **Canvas Features**:
  - Draggable logo positioning
  - Zoom controls (+/-, reset, 50%-200% range)
  - Multi-image view tabs (Front, Back, Detail)
  - Placement label overlay
  - Embroidery technique badge overlay
- **Export**: Download mockup as 2x PNG, upload to Supabase Storage, save URL to customization record
- **CRUD**: Save, edit, and delete customizations with full table display
- **Loading/Empty States**: Skeleton rows while loading, empty state messages

### Dynamic View Builder

- **Views List**: `/admin/views` — card grid showing name, type badge (Gallery/Grid), attribute count, filter count
- **Create/Edit View**: 4-tab configuration interface
  - **Data Selection**: Choose and order which style attributes to display
  - **Data Management**: Add filters, sort rules, and group-by settings
  - **Display Options**: Gallery vs Grid, items per row, image size, pagination
  - **View Settings**: Name, default flag, PDF export options (header, page size, images)
- **View Renderer**: `/admin/views/[id]/render` — live rendering with runtime filters, pagination, and item selection
- **Export Page**: `/admin/views/[id]/export` — shows export settings and selected styles (PDF generation not yet implemented)

### Image Upload System

- **Product Images**: Upload endpoint `/api/upload` (POST)
  - Validates file type (JPG, PNG, WebP) and size (max 5MB)
  - Uploads to Supabase Storage `product-images` bucket using service role key
  - Returns public URL
  - Client-side: multi-file upload with progress indicators
  - Drag-and-drop image reordering within the form
- **Logo Upload**: Upload endpoint `/api/logos/upload` (POST)
  - Validates file type (SVG, AI, EPS, PNG) and size (max 10MB)
  - Extracts dimensions (PNG via sharp, SVG via regex)
  - Uploads to Supabase Storage `logos` bucket
  - Inserts metadata into `logos` table

### Variant Management

- Individual add/edit/delete with inline table editing
- Quick Add modal: select sizes (XS-XXL) x colors (presets + custom)
- Auto-generated SKUs from style name + size + color
- Stock tracking and price modifier per variant

### Dashboard Metrics

- Total styles count
- Active styles count (status = 'active')
- Total concepts count
- Total suppliers count

### Back Navigation

- `BackLink` component with arrow icon and hover state
- Used on all edit/new pages, linking back to parent list

### Display Order Drag-and-Drop

- Styles, concepts, and categories support drag-and-drop reordering
- Uses @dnd-kit/core and @dnd-kit/sortable
- Drag handles (6-dot grip icon) on each item
- Visual feedback: opacity reduction during drag, overlay while dragging
- Order saved to database immediately on drop
- 8px activation distance to prevent accidental drags

---

## 3. UX & Polish Features

### Toast Notification System (Sonner)

Toast notifications replace `alert()` for all user-facing feedback.

**Setup:** `<Toaster>` is mounted in `app/layout.tsx` (root layout), making toasts available on every page.

**Configuration:**
```tsx
<Toaster
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      background: '#171717',
      border: '1px solid #262626',
      color: '#fff',
    },
  }}
/>
```

**Where Used:**

| Location               | Success Toast            | Error Toast                   |
|------------------------|--------------------------|-------------------------------|
| Login page             | —                        | Login error message           |
| Style edit form        | "Changes saved"          | Supabase error message        |
| Style archive          | "Style archived"         | Supabase error message        |
| Logo detail save       | "Changes saved"          | Supabase error message        |
| Logo delete            | "Logo deleted"           | Supabase error message        |
| Customization save     | "Customization saved"    | "Please select a logo."      |
| Customization update   | "Customization updated"  | Supabase error message        |
| Customization delete   | "Customization deleted"  | Supabase error message        |
| Mockup export          | "Mockup exported and saved" | "Export failed" / upload error |

**How to Add New Toasts:**
```tsx
import { toast } from 'sonner'

// Success
toast.success('Item created')

// Error
toast.error('Something went wrong')

// With Supabase error
const { error } = await supabase.from('table').insert(data)
if (error) toast.error(error.message)
```

### Loading States (Skeleton Components)

Skeleton loaders provide visual feedback while data is loading. Defined in `components/Skeleton.tsx`.

| Component          | Shape                          | Usage                          |
|--------------------|--------------------------------|--------------------------------|
| `SkeletonCard`     | Image + text lines + badges    | Style cards, logo cards        |
| `SkeletonRow`      | Title + 4-column grid          | Supplier list, category rows   |
| `SkeletonLogoCard` | Square image + text            | Logo gallery grid              |
| `SkeletonMetric`   | Large number + label           | Dashboard metric cards         |
| `EmptyState`       | Icon + title + description + CTA | Any list with zero items      |

All skeletons use `animate-pulse` for the shimmer effect.

**EmptyState Usage:**
```tsx
<EmptyState
  icon={<svg>...</svg>}
  title="No styles yet"
  description="Create your first style to start building your collection."
  action={<Link href="/admin/styles/new">Create First Style</Link>}
/>
```

### Keyboard Shortcuts

Defined in `lib/useKeyboardSave.ts`.

| Shortcut         | Action           | Where                                                                |
|------------------|------------------|----------------------------------------------------------------------|
| `Cmd/Ctrl + S`   | Save form        | Style edit (Details tab), Logo detail, Supplier edit, Concept edit, Category edit |
| `Escape`         | Close modal      | Quick Add variant modal                                              |

**How to Add Keyboard Save to a Form:**
```tsx
import { useKeyboardSave } from '@/lib/useKeyboardSave'
import { useCallback } from 'react'

useKeyboardSave(useCallback(() => {
  const form = document.querySelector('form')
  form?.requestSubmit()
}, []))
```

**How to Add Escape Close to a Modal:**
```tsx
import { useEscapeClose } from '@/lib/useKeyboardSave'

useEscapeClose(() => setShowModal(false))
```

### Error Handling Approach

| Layer          | Method                                          |
|----------------|-------------------------------------------------|
| Client forms   | `toast.error()` for server errors               |
| File validation| Inline error banners (red bg with border)       |
| Required fields| HTML `required` attribute (browser native)      |
| API endpoints  | JSON error responses with status codes          |
| Delete actions | Confirmation dialog before destructive action   |
| Upload forms   | Progress bar + inline error messages             |

---

## 4. Database Schema

All tables are managed in Supabase (PostgreSQL). UUIDs are used for primary keys.

### `styles`

| Field              | Type      | Notes                                |
|--------------------|-----------|--------------------------------------|
| id                 | uuid      | Primary key                          |
| name               | text      | Required                             |
| concept_id         | uuid      | FK → concepts.id                     |
| category_id        | uuid      | FK → categories.id                   |
| supplier_id        | uuid      | FK → suppliers.id (nullable)         |
| gender             | text      | Enum: mens, womens, unisex, na       |
| collection_type    | text      | Enum: editorial, signature, foundation, special_projects |
| product_capability | text      | Enum: none, simple_customizable, quote_only, both |
| status             | text      | Enum: development, active, archived  |
| base_cost          | numeric   | Nullable, in EUR                     |
| lead_time_days     | integer   | Nullable                             |
| customization_mode | text      | Nullable                             |
| description        | text      | Nullable                             |
| material           | text      | Nullable                             |
| images             | text[]    | Array of public URLs                 |
| display_order      | integer   | For sorting                          |
| created_at         | timestamp | Auto-generated                       |
| updated_at         | timestamp | Auto-generated                       |

### `concepts`

| Field         | Type      | Notes                |
|---------------|-----------|----------------------|
| id            | uuid      | Primary key          |
| name          | text      | Required             |
| description   | text      | Nullable             |
| display_order | integer   | For sorting          |
| created_at    | timestamp | Auto-generated       |

### `categories` (under concepts)

| Field         | Type      | Notes                |
|---------------|-----------|----------------------|
| id            | uuid      | Primary key          |
| concept_id    | uuid      | FK → concepts.id     |
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

### `logos`

| Field         | Type      | Notes                              |
|---------------|-----------|------------------------------------|
| id            | uuid      | Primary key                        |
| company_name  | text      | Required                           |
| file_url      | text      | Public Supabase Storage URL        |
| file_format   | text      | Uppercase: SVG, AI, EPS, PNG       |
| width         | integer   | Nullable (extracted from metadata) |
| height        | integer   | Nullable (extracted from metadata) |
| uploaded_by   | uuid      | FK → auth.users.id                 |
| created_at    | timestamp | Auto-generated                     |

### `customizations`

| Field        | Type      | Notes                              |
|--------------|-----------|------------------------------------|
| id           | uuid      | Primary key                        |
| style_id     | uuid      | FK → styles.id                     |
| logo_id      | uuid      | FK → logos.id                      |
| placement    | text      | center_front, center_back, hsp, wrs, wls |
| technique    | text      | embroidery or print                |
| pantone_color| text      | Nullable                           |
| width_cm     | numeric   | Nullable                           |
| height_cm    | numeric   | Nullable                           |
| mockup_url   | text      | Nullable (exported PNG URL)        |
| created_at   | timestamp | Auto-generated                     |

### `views`

| Field               | Type      | Notes                              |
|---------------------|-----------|------------------------------------|
| id                  | uuid      | Primary key                        |
| name                | text      | Required                           |
| type                | text      | grid or gallery                    |
| entity              | text      | Entity type (styles)               |
| selected_attributes | json      | Array of attribute keys            |
| filters             | json      | Array of filter objects             |
| sort                | json      | Array of sort rules                 |
| group_by            | json      | Array of group-by attributes        |
| display_options     | json      | Layout/pagination config            |
| export_options      | json      | PDF export config                   |
| is_default          | boolean   | Default view flag                   |
| created_at          | timestamp | Auto-generated                     |

### `variants`

| Field          | Type    | Notes              |
|----------------|---------|---------------------|
| id             | uuid    | Primary key         |
| style_id       | uuid    | FK → styles.id      |
| size           | text    | Nullable            |
| color          | text    | Nullable            |
| sku            | text    | Nullable, unique    |
| stock          | integer | Default 0           |
| price_modifier | numeric | Default 0           |

### `buyers` (Buyer Portal)

| Field         | Type      | Notes                    |
|---------------|-----------|--------------------------|
| id            | uuid      | Primary key              |
| user_id       | uuid      | FK → auth.users.id       |
| company_name  | text      | Required                 |
| contact_name  | text      | Required                 |
| email         | text      | Required                 |
| created_at    | timestamp | Auto-generated           |

### `buyer_product_access` (Buyer Portal)

| Field          | Type    | Notes                              |
|----------------|---------|-------------------------------------|
| id             | uuid    | Primary key                         |
| buyer_id       | uuid    | FK → buyers.id                      |
| style_id       | uuid    | FK → styles.id                      |
| active         | boolean | Gates catalog visibility            |
| price_override | numeric | Nullable (overrides style base_cost)|
| created_at     | timestamp | Auto-generated                    |

### `buyer_orders` (Buyer Portal)

| Field        | Type      | Notes                                                    |
|--------------|-----------|----------------------------------------------------------|
| id           | uuid      | Primary key                                              |
| buyer_id     | uuid      | FK → buyers.id                                           |
| status       | text      | draft, pending, confirmed, in_production, shipped        |
| notes        | text      | Nullable                                                 |
| submitted_at | timestamp | Nullable (set on submission)                             |
| created_at   | timestamp | Auto-generated                                           |
| updated_at   | timestamp | Auto-generated                                           |

### `buyer_order_line_items` (Buyer Portal)

| Field           | Type    | Notes                    |
|-----------------|---------|--------------------------|
| id              | uuid    | Primary key              |
| order_id        | uuid    | FK → buyer_orders.id     |
| style_id        | uuid    | FK → styles.id           |
| variant_id      | uuid    | FK → variants.id         |
| quantity        | integer | Required                 |
| unit_price      | numeric | Price at time of order   |
| placement_notes | text    | Nullable                 |
| created_at      | timestamp | Auto-generated         |

### Relationships

- `styles.concept_id` → `concepts.id`
- `styles.category_id` → `categories.id`
- `styles.supplier_id` → `suppliers.id`
- `categories.concept_id` → `concepts.id`
- `customizations.style_id` → `styles.id`
- `customizations.logo_id` → `logos.id`
- `variants.style_id` → `styles.id`
- `logos.uploaded_by` → `auth.users.id`
- Deleting a concept may cascade to its categories
- Styles use soft delete (status = 'archived')
- `buyers.user_id` → `auth.users.id`
- `buyer_product_access.buyer_id` → `buyers.id`
- `buyer_product_access.style_id` → `styles.id`
- `buyer_orders.buyer_id` → `buyers.id`
- `buyer_order_line_items.order_id` → `buyer_orders.id`
- `buyer_order_line_items.style_id` → `styles.id`
- `buyer_order_line_items.variant_id` → `variants.id`

---

## 5. File Structure

```
atelier/
├── atelier-admin/                    # Main admin application
│   ├── app/
│   │   ├── layout.tsx                # Root layout (HTML, metadata, Sonner Toaster)
│   │   ├── globals.css               # Global styles
│   │   ├── page.tsx                  # Public landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx              # Login page (email/password, toast errors)
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin layout (auth check, nav bar)
│   │   │   ├── page.tsx              # Dashboard with metrics
│   │   │   ├── styles/
│   │   │   │   ├── page.tsx          # Style list (sortable)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New style form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit style (server component)
│   │   │   │       └── StyleEditForm.tsx  # Edit form (client, 3 tabs)
│   │   │   ├── concepts/
│   │   │   │   ├── page.tsx          # Concept list (sortable)
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New concept form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit concept (server)
│   │   │   │       ├── ConceptEditForm.tsx  # Edit form (client)
│   │   │   │       └── categories/
│   │   │   │           └── new/
│   │   │   │               └── page.tsx  # New category under concept
│   │   │   ├── suppliers/
│   │   │   │   ├── page.tsx          # Supplier list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # New supplier form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit supplier (server)
│   │   │   │       └── SupplierEditForm.tsx  # Edit form (client)
│   │   │   ├── logos/
│   │   │   │   ├── page.tsx          # Logo gallery grid
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Upload new logo
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Logo detail (server)
│   │   │   │       └── LogoDetailForm.tsx  # Logo edit/delete (client)
│   │   │   ├── views/
│   │   │   │   ├── page.tsx          # Views list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create new view
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit view (ViewBuilder)
│   │   │   │       ├── render/
│   │   │   │       │   └── page.tsx  # Render view (ViewRuntime)
│   │   │   │       └── export/
│   │   │   │           └── page.tsx  # PDF export
│   │   │   ├── products/
│   │   │   │   └── page.tsx          # Redirects to /admin/styles
│   │   │   └── categories/
│   │   │       ├── page.tsx          # Legacy category list (sortable)
│   │   │       ├── new/
│   │   │       │   └── page.tsx      # New category form
│   │   │       └── [id]/
│   │   │           ├── page.tsx      # Edit category (server)
│   │   │           ├── CategoryEditForm.tsx  # Edit form (client)
│   │   │           └── subcategories/
│   │   │               └── new/
│   │   │                   └── page.tsx  # New subcategory form
│   │   └── api/
│   │       ├── upload/
│   │       │   └── route.ts          # Product image upload API
│   │       └── logos/
│   │           └── upload/
│   │               └── route.ts      # Logo upload API (with sharp metadata)
│   ├── components/
│   │   ├── BackLink.tsx              # Back navigation component
│   │   ├── ImageUpload.tsx           # Multi-image upload with drag reorder
│   │   ├── VariantTable.tsx          # Variant management table
│   │   ├── BulkVariantModal.tsx      # Bulk variant creation modal
│   │   ├── CustomizationTab.tsx      # Fabric.js mockup generator
│   │   ├── Skeleton.tsx              # SkeletonCard, SkeletonRow, SkeletonLogoCard, SkeletonMetric, EmptyState
│   │   ├── ViewBuilder.tsx           # View configuration UI (4 tabs)
│   │   ├── ViewRuntime.tsx           # View renderer with filters/pagination
│   │   ├── SortableProductList.tsx   # Drag-and-drop product list
│   │   ├── SortableStyleList.tsx     # Drag-and-drop style list
│   │   ├── SortableConceptList.tsx   # Drag-and-drop concept list
│   │   └── SortableCategoryList.tsx  # Drag-and-drop category list
│   ├── lib/
│   │   ├── useKeyboardSave.ts        # useKeyboardSave + useEscapeClose hooks
│   │   ├── view-attributes.ts        # View attribute definitions & types
│   │   └── supabase/
│   │       ├── server.ts             # Server-side Supabase client
│   │       └── client.ts             # Browser-side Supabase client
│   ├── package.json
│   └── tsconfig.json
├── atelier-portal/                   # B2B Buyer Portal
│   ├── app/
│   │   ├── layout.tsx                # Root layout (HTML, metadata)
│   │   ├── page.tsx                  # Landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx              # Buyer login page
│   │   ├── access-pending/
│   │   │   └── page.tsx              # Pending approval screen
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # Auth callback handler
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Buyer dashboard (recent orders, quick stats)
│   │   ├── catalog/
│   │   │   ├── page.tsx              # Catalog grid (buyer-specific access)
│   │   │   └── [id]/
│   │   │       ├── page.tsx          # Style detail (variants, pricing)
│   │   │       └── AddToOrderButton.tsx  # Variant picker + add to draft
│   │   └── orders/
│   │       ├── page.tsx              # Orders list (all statuses)
│   │       ├── new/
│   │       │   ├── page.tsx          # Draft order page (server)
│   │       │   └── DraftOrderClient.tsx  # Draft editor (client)
│   │       └── [id]/
│   │           └── page.tsx          # Order detail (line items, status)
│   ├── components/
│   │   ├── TopNav.tsx                # Navigation bar
│   │   └── LogoutButton.tsx          # Logout button
│   ├── lib/
│   │   ├── get-buyer.ts              # Auth helper (getBuyer)
│   │   ├── order-actions.ts          # Server actions (addToOrder, submitOrder, etc.)
│   │   └── supabase/
│   │       ├── server.ts             # Server-side Supabase client
│   │       ├── client.ts             # Browser-side Supabase client
│   │       ├── service.ts            # Service role client
│   │       └── middleware.ts         # Auth middleware helper
│   ├── middleware.ts                 # Next.js middleware (session refresh)
│   ├── package.json
│   └── tsconfig.json
├── apps/
│   └── web/                          # Public-facing web app (separate)
├── package.json                      # Root monorepo config
├── pnpm-workspace.yaml
├── turbo.json
├── ADMIN_SYSTEM_DOCUMENTATION.md     # This file
├── DEMO_WALKTHROUGH.md               # Step-by-step demo guide
└── TESTING_CHECKLIST.md              # Comprehensive testing checklist
```

### Key Components

| Component              | Purpose                                         |
|------------------------|-------------------------------------------------|
| `BackLink`             | Reusable back arrow navigation link             |
| `ImageUpload`          | Multi-file upload with drag reorder             |
| `VariantTable`         | CRUD table for product variants                 |
| `BulkVariantModal`     | Quick Add: size x color matrix variant generator |
| `CustomizationTab`     | Fabric.js interactive mockup editor             |
| `Skeleton`             | Loading skeletons (card, row, logo, metric) + EmptyState |
| `ViewBuilder`          | 4-tab view configuration interface              |
| `ViewRuntime`          | View renderer with filters, pagination, export  |
| `SortableStyleList`    | Drag-and-drop style grid                        |
| `SortableConceptList`  | Drag-and-drop concept list                      |
| `SortableCategoryList` | Drag-and-drop category list                     |
| `SortableProductList`  | Drag-and-drop product grid (legacy)             |

### Key Dependencies

| Package              | Version | Purpose                                  |
|----------------------|---------|------------------------------------------|
| `fabric`             | ^7.2.0  | Fabric.js canvas for mockup generation   |
| `sonner`             | ^2.0.7  | Toast notification system                |
| `sharp`              | ^0.34.5 | Server-side image metadata extraction    |
| `@dnd-kit/core`      | ^6.3.1  | Drag-and-drop core                       |
| `@dnd-kit/sortable`  | ^10.0.0 | Sortable drag-and-drop                   |
| `@supabase/ssr`      | ^0.8.0  | Supabase SSR auth helpers                |
| `@supabase/supabase-js` | ^2.97.0 | Supabase client library               |

---

## 6. Environment Setup

### Required `.env.local` Variables

Create `atelier-admin/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Supabase Setup

1. Create a Supabase project
2. Create the tables listed in Section 4 (Database Schema)
3. Create Storage buckets with public access:
   - `product-images` — for style images and exported mockups
   - `logos` — for uploaded brand logos
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

## 7. Development Guidelines Going Forward

> **IMPORTANT: All future changes MUST be documented in this file.**

When adding features:
- Update the **Features** section (Section 2) with a description of the new feature
- Update **Database Schema** (Section 4) if tables or columns change
- Update **File Structure** (Section 5) if new routes or components are added
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
- **Error handling**: `toast.error()` from Sonner for user-facing errors
- **Loading states**: Skeleton components from `components/Skeleton.tsx`
- **Keyboard shortcuts**: `useKeyboardSave` and `useEscapeClose` hooks from `lib/useKeyboardSave.ts`

---

## 8. Known Limitations / TODO

### Completed

- ~~Logo Library~~ — Upload and manage brand logos for mockup generation
- ~~Mockup Generator~~ — Generate product mockups with Fabric.js canvas
- ~~Toast notifications~~ — Migrated from `alert()` to Sonner toasts
- ~~Loading states~~ — Skeleton components for all list pages
- ~~Keyboard shortcuts~~ — Cmd+S save, Escape close
- ~~Empty states~~ — Styled empty states for all sections
- ~~View Builder~~ — Dynamic gallery/grid views with PDF export

### Planned Features

- ~~B2B Customer Portal~~ — Buyer portal implemented (`atelier-portal/`) with catalog browsing, per-buyer pricing, draft orders, and order submission
- **Frontend Website Integration** — Connect admin data to public-facing website
- **Advanced Mockup Features** — Multiple product views per mockup, batch export, mockup templates
- **Search & Filter Functionality** — Search/filter on style and supplier lists
- **Export Reports** — CSV and PDF export for styles, orders, and inventory data

### Known Limitations

- No pagination on list pages (views have pagination)
- No search/filter on style or supplier lists (use Views for filtered data)
- No image deletion from Supabase Storage when removed from a style
- Variant SKU uniqueness not enforced client-side
- No role-based access control (single admin role only)
- No audit log for changes
- Active nav link not highlighted in top bar
- Embroidery overlay position may drift if logo is dragged on canvas
