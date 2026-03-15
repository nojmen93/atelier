# Atelier Admin System Documentation

## 1. Overview

**Atelier Admin** is an internal admin panel for managing a custom apparel brand's style catalog, production partners, quote requests, orders, logos, and mockup generation. It provides a full CRUD interface with image uploads, variant management, drag-and-drop reordering, a Fabric.js-powered mockup generator, a quote lifecycle system, order tracking, and a dynamic view builder.

### Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.9.3
- **Runtime**: React 19.2.3
- **Styling**: Tailwind CSS v4 (dark UI theme)
- **Database/Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Monorepo**: Turborepo with pnpm workspaces
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Canvas/Mockups**: Fabric.js v7 (fabric)
- **Image Processing**: sharp (metadata extraction)
- **Notifications**: Sonner (toast system)
- **Icons**: lucide-react

### Current Features

- Authentication (Supabase Auth, email/password)
- Style CRUD with image upload, concept/category assignment, and variants
- Colour Library with auto-generated colour codes and GS1 US codes
- Product Hierarchy browser
- Specification view
- Quote Request lifecycle management (New → Reviewed → Quoted → Accepted/Rejected → Converted)
- Price Calculator integrated into quote detail
- Email quote modal (copy to clipboard or open in email client)
- Convert quote to style workflow
- Order management with status tracking
- Supplier & Factory CRUD
- Concept & Category hierarchy management
- Logo Library with upload, metadata extraction, and gallery
- Mockup Generator (Fabric.js canvas — both in-style tab and standalone page)
- Dynamic View Builder with gallery/grid modes
- Image upload to Supabase Storage with drag reordering
- Variant management (individual + bulk creation with SKU auto-generation)
- Dashboard with metrics for styles, production, quotes, and orders
- Drag-and-drop display order for styles, concepts, and categories
- Collapsible sidebar navigation with active link highlighting
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
- Sign out button in the sidebar footer

### Navigation (Collapsible Sidebar)

The admin uses a **left collapsible sidebar** (`components/Sidebar.tsx`), not a top nav bar. Sections expand/collapse and highlight the active route.

**Sidebar sections:**
| Section | Sub-items |
|---------|-----------|
| Dashboard | (direct link → `/admin`) |
| Product | Hierarchy, Product (Styles), Colour Library, Specification |
| Production | Quote Requests, Orders, Suppliers, Factories |
| Logos | Logo Library, Upload Logo, Mockup Generator |
| Views | All Views, New View |
| *(footer)* | Settings, Sign Out |

### Style Management

> Products are called "Styles" in this system.

- **List**: `/admin/styles` — sortable card grid with drag-and-drop reordering, status badges, variant counts
- **Create**: `/admin/styles/new` — form with name, concept, category, gender, collection type, product capability, status, description, material, supplier, base cost, lead time, customization mode, image upload
- **Edit**: `/admin/styles/[id]` — tabbed interface with 3 tabs:
  - **Details**: All style fields editable, status dropdown (Development/Active/Archived) with color-coded badge, keyboard save (Cmd+S)
  - **Variants**: Inline table with add/edit/delete, bulk variant creation modal (size × color matrix with auto-SKU generation)
  - **Customization**: Fabric.js mockup editor (see Mockup Generator section)
- **Images**: Multi-image upload with drag reorder, primary image indicator
- **Archive**: Soft delete by setting `status = 'archived'`, with confirmation dialog
- **Display Order**: Drag-and-drop reordering with immediate database persistence
- **Hierarchy**: `/admin/styles/hierarchy` — product hierarchy browser
- **Colour Library**: `/admin/styles/colours` — manage colourways with auto-generated colour codes and GS1 US codes
- **Specification**: `/admin/styles/specification` — detailed specification view

### Quote Request Management

Full lifecycle management for B2B customer quote requests.

- **List**: `/admin/quotes` — searchable (name, email, company) and filterable by status; shows date, customer, company, product, quantity, status badge, quoted price, and view link
- **Create**: `/admin/quotes/new` — captures customer info (name, email, company, phone), linked style or product description, quantity, variant breakdown (dynamic size/color/qty rows), customization preferences (placement, technique, pantone color), and customer message
- **Detail**: `/admin/quotes/[id]` — 3-column layout:
  - **Left**: Customer info, message, variant breakdown
  - **Middle**: Linked style (with images), quantity, customization preferences, customer logo
  - **Right**: Price Calculator, quote response (quoted price + date), internal notes, action buttons

**Quote status lifecycle:**

| Status | Meaning |
|--------|---------|
| New | Just received, awaiting review |
| Reviewed | Admin has reviewed, preparing quote |
| Quoted | Price sent to customer |
| Accepted | Customer accepted the quote |
| Rejected | Customer rejected |
| Converted | Converted into a Style record |

**Price Calculator** (right column of quote detail):
- Unit Base Cost input (EUR)
- Customization Fee input (EUR)
- Margin % input
- Live breakdown: (unit + cust) × quantity + margin = total
- "Apply as Quoted Price" button to push total into the quoted price field

**Email Quote Modal** (`EmailQuoteModal`):
- Triggered by "Send Quote Email" button (requires a quoted price)
- Pre-fills recipient, subject ("Quote for [Product] – [Company]"), and a body template
- Actions: Copy to Clipboard, Open in Email Client (mailto: link)
- Escape key closes

**Convert Quote to Style** (`CreateFromQuoteModal`):
- Creates a new Style record pre-filled from the quote
- Optionally creates variants from the variant breakdown
- Optionally creates a customization entry
- Links logo from logo library
- Updates quote status to "Converted" and stores the linked style ID
- Shows a "converted" banner on the quote detail page after conversion

### Order Management

- **List**: `/admin/orders` — order tracking with status badges
- **Create**: `/admin/orders/new` — new order form
- **Detail**: `/admin/orders/[id]` — order detail with status management

**Order status values:** `confirmed`, `in_production`, `shipped`, `delivered`

Dashboard shows **Active Orders** (confirmed + in_production + shipped).

### Supplier Management

- **List**: `/admin/suppliers` — card layout showing MOQ, lead time, location, contact
- **Create**: `/admin/suppliers/new` — name, email, MOQ, lead time, location
- **Edit**: `/admin/suppliers/[id]` — all fields editable, delete with confirmation
- **Empty State**: Styled empty state with icon and CTA button

### Factory Management

- **List**: `/admin/factories` — factory/production partner list
- **Create/Edit**: Factory CRUD (name, location, contact details)

### Concept & Category System

> The system uses a two-level hierarchy: Concepts contain Categories.

- **Concepts List**: `/admin/concepts` — drag-and-drop reordering, shows categories inline
- **Create Concept**: `/admin/concepts/new` — name, auto-generated slug, description
- **Edit Concept**: `/admin/concepts/[id]` — edit fields, manage categories, delete with cascade
- **Create Category**: `/admin/concepts/[id]/categories/new` — name, slug, description, display order
- **Display Order**: Drag-and-drop reordering with immediate database persistence

### Logo Library

- **Gallery**: `/admin/logos` — responsive grid (2–4 columns) with image previews for PNG/SVG, format labels for AI/EPS
- **Upload**: `/admin/logos/new` — upload form with company name, file picker, client-side preview and dimension extraction
- **Detail**: `/admin/logos/[id]` — large preview, metadata grid (format, dimensions, upload date, file URL), edit company name, delete with confirmation
- **Upload API**: `/api/logos/upload` (POST)
  - Accepts SVG, AI, EPS, PNG (max 10 MB)
  - Extracts dimensions: PNG via `sharp`, SVG via regex on width/height/viewBox
  - Stores in Supabase Storage `logos` bucket
  - Inserts metadata into `logos` table
- **Empty State**: Styled empty state with icon and "Upload First Logo" CTA
- **Keyboard Save**: Cmd+S on logo detail page

### Mockup Generator (Customization Engine)

Powered by **Fabric.js v7**. Available in two places:
1. **Customization tab** on style edit pages (`/admin/styles/[id]`)
2. **Standalone page** at `/admin/mockup`

- **Interactive Canvas**: 500×600 px canvas with product image as background
- **Logo Placement**: 5 predefined positions — Center Front, Center Back, From HSP, Center on WRS, Center on WLS
- **Technique Toggle**: Embroidery (stitch texture, shadow overlay, 85% opacity) vs Print (flat, 95% opacity)
- **Real-time Preview**: Logo, placement, technique, and size changes update canvas instantly
- **Logo Format Support**: PNG/SVG rendered directly, AI/EPS shown as labeled placeholder
- **Size Controls**: Width/height in cm (0.5–50 cm range), mapped to canvas proportionally
- **Pantone Color**: Text field for color reference
- **Canvas Features**:
  - Draggable logo positioning
  - Zoom controls (+/−, reset, 50%–200% range)
  - Multi-image view tabs (Front, Back, Detail)
  - Placement label overlay
  - Embroidery technique badge overlay
- **Export**: Download mockup as 2× PNG (1000×1200 px), upload to Supabase Storage, save URL to customization record
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

- **Style Images**: Upload endpoint `/api/upload` (POST)
  - Validates file type (JPG, PNG, WebP) and size (max 5 MB)
  - Uploads to Supabase Storage `product-images` bucket using service role key
  - Returns public URL
  - Client-side: multi-file upload with progress indicators
  - Drag-and-drop image reordering within the form
- **Logo Upload**: Upload endpoint `/api/logos/upload` (POST)
  - Validates file type (SVG, AI, EPS, PNG) and size (max 10 MB)
  - Extracts dimensions (PNG via sharp, SVG via regex)
  - Uploads to Supabase Storage `logos` bucket
  - Inserts metadata into `logos` table

### Variant Management

- Individual add/edit/delete with inline table editing
- Quick Add modal: select sizes (XS–XXL) × colors (presets + custom)
- Auto-generated SKUs from style name + size + color
- Stock tracking and price modifier per variant

### Dashboard Metrics

The dashboard (`/admin`) is divided into two sections:

**Styles section (3 cards):**
- Total Styles
- Active Styles (`status = 'active'`)
- Concepts

**Production section (3 cards):**
- Suppliers
- Active Orders (`status` in confirmed/in_production/shipped) — clickable link
- Pending Quotes (`status` in new/reviewed) — clickable link (blue-highlighted)

**Quote Requests section (4 cards + table):**
- Pending Review
- Total Quotes
- Accepted/Converted
- Conversion Rate (accepted ÷ quoted, as %)
- Recent Quotes table: last 5 quote requests with date, customer, company, product, quantity, status badge, and View link

---

## 3. UX & Polish Features

### Toast Notification System (Sonner)

Toast notifications replace `alert()` for all user-facing feedback.

**Setup:** `<Toaster>` is mounted in `app/layout.tsx` (root layout).

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

| Location | Success Toast | Error Toast |
|----------|--------------|-------------|
| Login page | — | Login error message |
| Style edit form | "Changes saved" | Supabase error message |
| Style archive | "Style archived" | Supabase error message |
| Logo detail save | "Changes saved" | Supabase error message |
| Logo delete | "Logo deleted" | Supabase error message |
| Customization save | "Customization saved" | "Please select a logo." |
| Customization update | "Customization updated" | Supabase error message |
| Customization delete | "Customization deleted" | Supabase error message |
| Mockup export | "Mockup exported and saved" | "Export failed" / upload error |
| Quote save | "Changes saved" | Supabase error message |
| Quote create | "Quote request created" | Supabase error message |
| Order save | "Changes saved" | Supabase error message |

**How to Add New Toasts:**
```tsx
import { toast } from 'sonner'

toast.success('Item created')
toast.error('Something went wrong')

// With Supabase error
const { error } = await supabase.from('table').insert(data)
if (error) toast.error(error.message)
```

### Loading States (Skeleton Components)

Defined in `components/Skeleton.tsx`.

| Component | Shape | Usage |
|-----------|-------|-------|
| `SkeletonCard` | Image + text lines + badges | Style cards, logo cards |
| `SkeletonRow` | Title + 4-column grid | Supplier list, category rows |
| `SkeletonLogoCard` | Square image + text | Logo gallery grid |
| `SkeletonMetric` | Large number + label | Dashboard metric cards |
| `EmptyState` | Icon + title + description + CTA | Any list with zero items |

All skeletons use `animate-pulse` for the shimmer effect.

### Keyboard Shortcuts

Defined in `lib/useKeyboardSave.ts`.

| Shortcut | Action | Where |
|----------|--------|-------|
| `Cmd/Ctrl + S` | Save form | Style edit (Details tab), Logo detail, Supplier edit, Concept edit, Category edit |
| `Escape` | Close modal | Quick Add variant modal, Email Quote modal, Create Style from Quote modal |

### Error Handling Approach

| Layer | Method |
|-------|--------|
| Client forms | `toast.error()` for server errors |
| File validation | Inline error banners (red bg with border) |
| Required fields | HTML `required` attribute (browser native) |
| API endpoints | JSON error responses with status codes |
| Delete actions | Confirmation dialog before destructive action |
| Upload forms | Progress bar + inline error messages |

---

## 4. Database Schema

All tables are managed in Supabase (PostgreSQL). UUIDs are used for primary keys.

### `styles`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | text | Required |
| concept_id | uuid | FK → concepts.id |
| category_id | uuid | FK → categories.id |
| supplier_id | uuid | FK → suppliers.id (nullable) |
| gender | text | Enum: mens, womens, unisex, na |
| collection_type | text | Enum: editorial, signature, foundation, special_projects |
| product_capability | text | Enum: none, simple_customizable, quote_only, both |
| status | text | Enum: development, active, archived |
| base_cost | numeric | Nullable, in EUR |
| lead_time_days | integer | Nullable |
| customization_mode | text | Nullable |
| description | text | Nullable |
| material | text | Nullable |
| images | text[] | Array of public URLs |
| display_order | integer | For drag-and-drop sorting |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

### `concepts`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | text | Required |
| slug | text | URL-friendly name |
| description | text | Nullable |
| display_order | integer | For sorting |
| created_at | timestamp | Auto-generated |

### `categories` (under concepts)

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| concept_id | uuid | FK → concepts.id |
| name | text | Required |
| slug | text | URL-friendly name |
| description | text | Nullable |
| display_order | integer | For sorting |
| created_at | timestamp | Auto-generated |

### `suppliers`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | text | Required |
| contact_email | text | Nullable |
| moq | integer | Nullable |
| lead_time_days | integer | Nullable |
| production_location | text | Nullable |
| created_at | timestamp | Auto-generated |

### `logos`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| company_name | text | Required |
| file_url | text | Public Supabase Storage URL |
| file_format | text | Uppercase: SVG, AI, EPS, PNG |
| width | integer | Nullable (extracted from metadata) |
| height | integer | Nullable (extracted from metadata) |
| uploaded_by | uuid | FK → auth.users.id |
| created_at | timestamp | Auto-generated |

### `customizations`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| style_id | uuid | FK → styles.id |
| logo_id | uuid | FK → logos.id |
| placement | text | center_front, center_back, hsp, wrs, wls |
| technique | text | embroidery or print |
| pantone_color | text | Nullable |
| width_cm | numeric | Nullable |
| height_cm | numeric | Nullable |
| mockup_url | text | Nullable (exported PNG URL) |
| created_at | timestamp | Auto-generated |

### `quote_requests`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| customer_name | text | Required |
| customer_email | text | Required |
| customer_company | text | Nullable |
| customer_phone | text | Nullable |
| style_id | uuid | FK → styles.id (nullable) |
| product_name | text | Nullable — free-text product description |
| quantity | integer | Nullable |
| variant_breakdown | json | Array of {size, color, qty} |
| placement | text | Nullable |
| technique | text | Nullable |
| pantone_color | text | Nullable |
| logo_file_url | text | Nullable |
| customer_message | text | Nullable |
| status | text | new, reviewed, quoted, accepted, rejected, converted |
| quoted_price | numeric | Nullable — final price sent to customer |
| quoted_at | timestamp | Nullable |
| internal_notes | text | Nullable |
| converted_style_id | uuid | FK → styles.id (nullable) |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

### `orders`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| status | text | confirmed, in_production, shipped, delivered |
| created_at | timestamp | Auto-generated |
| updated_at | timestamp | Auto-generated |

### `views`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| name | text | Required |
| type | text | grid or gallery |
| entity | text | Entity type (styles) |
| selected_attributes | json | Array of attribute keys |
| filters | json | Array of filter objects |
| sort | json | Array of sort rules |
| group_by | json | Array of group-by attributes |
| display_options | json | Layout/pagination config |
| export_options | json | PDF export config |
| is_default | boolean | Default view flag |
| created_at | timestamp | Auto-generated |

### `variants`

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | Primary key |
| product_id | uuid | FK → styles.id |
| size | text | Nullable |
| color | text | Nullable |
| sku | text | Nullable, unique |
| stock | integer | Default 0 |
| price_modifier | numeric | Default 0 |

### Relationships

- `styles.concept_id` → `concepts.id`
- `styles.category_id` → `categories.id`
- `styles.supplier_id` → `suppliers.id`
- `categories.concept_id` → `concepts.id`
- `customizations.style_id` → `styles.id`
- `customizations.logo_id` → `logos.id`
- `variants.product_id` → `styles.id`
- `logos.uploaded_by` → `auth.users.id`
- `quote_requests.style_id` → `styles.id`
- `quote_requests.converted_style_id` → `styles.id`
- Deleting a concept may cascade to its categories
- Styles use soft delete (`status = 'archived'`)

---

## 5. File Structure

```
atelier/
├── atelier-admin/                    # Main admin application
│   ├── app/
│   │   ├── layout.tsx                # Root layout (HTML, metadata, Sonner Toaster)
│   │   ├── globals.css               # Global styles (Tailwind v4)
│   │   ├── page.tsx                  # Public landing / redirect
│   │   ├── login/
│   │   │   └── page.tsx              # Login page (email/password, toast errors)
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin layout (auth check, sidebar)
│   │   │   ├── page.tsx              # Dashboard with metrics
│   │   │   ├── styles/
│   │   │   │   ├── page.tsx          # Style list (drag-sortable)
│   │   │   │   ├── new/page.tsx      # New style form
│   │   │   │   ├── [id]/page.tsx     # Edit style (Details, Variants, Customization tabs)
│   │   │   │   ├── colours/page.tsx  # Colour library
│   │   │   │   ├── hierarchy/page.tsx# Hierarchy browser
│   │   │   │   └── specification/page.tsx # Specification view
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx          # Quote list (search + status filter)
│   │   │   │   ├── new/page.tsx      # New quote request form
│   │   │   │   └── [id]/page.tsx     # Quote detail with price calculator
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Order list
│   │   │   │   ├── new/page.tsx      # New order
│   │   │   │   └── [id]/page.tsx     # Order detail
│   │   │   ├── suppliers/
│   │   │   │   ├── page.tsx          # Supplier list
│   │   │   │   ├── new/page.tsx      # New supplier
│   │   │   │   └── [id]/page.tsx     # Edit supplier
│   │   │   ├── factories/
│   │   │   │   ├── page.tsx          # Factory list
│   │   │   │   ├── new/page.tsx      # New factory
│   │   │   │   └── [id]/page.tsx     # Edit factory
│   │   │   ├── logos/
│   │   │   │   ├── page.tsx          # Logo gallery grid
│   │   │   │   ├── new/page.tsx      # Upload new logo
│   │   │   │   └── [id]/page.tsx     # Logo detail / edit
│   │   │   ├── mockup/
│   │   │   │   └── page.tsx          # Standalone mockup generator
│   │   │   ├── concepts/
│   │   │   │   ├── page.tsx          # Concept list (sortable)
│   │   │   │   ├── new/page.tsx      # New concept
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit concept
│   │   │   │       └── categories/new/page.tsx
│   │   │   ├── views/
│   │   │   │   ├── page.tsx          # Views list
│   │   │   │   ├── new/page.tsx      # Create view
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Edit view (ViewBuilder)
│   │   │   │       ├── render/page.tsx  # Render view (ViewRuntime)
│   │   │   │       └── export/page.tsx  # PDF export (placeholder)
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Admin settings
│   │   │   └── products/
│   │   │       └── page.tsx          # Redirects to /admin/styles
│   │   └── api/
│   │       ├── upload/route.ts       # Product image upload
│   │       └── logos/upload/route.ts # Logo upload (with sharp metadata)
│   ├── components/
│   │   ├── BackLink.tsx              # Back navigation component
│   │   ├── ImageUpload.tsx           # Multi-image upload with drag reorder
│   │   ├── VariantTable.tsx          # Variant management table
│   │   ├── BulkVariantModal.tsx      # Bulk variant creation (size × color matrix)
│   │   ├── CustomizationTab.tsx      # Fabric.js mockup editor (in-style tab)
│   │   ├── ColourwaysTab.tsx         # Colour selection tab
│   │   ├── SKUTab.tsx                # SKU management
│   │   ├── SupplierQuoteTab.tsx      # Supplier quote tracking tab
│   │   ├── NewQuoteModal.tsx         # Quote creation modal
│   │   ├── NewOrderModal.tsx         # Order creation modal
│   │   ├── EmailQuoteModal.tsx       # Email quote modal (copy/open in client)
│   │   ├── CreateFromQuoteModal.tsx  # Convert quote to style modal
│   │   ├── ProductPage.tsx           # Main styles UI component
│   │   ├── Sidebar.tsx               # Collapsible left sidebar navigation
│   │   ├── Skeleton.tsx              # Loading skeletons + EmptyState
│   │   ├── ViewBuilder.tsx           # View configuration UI (4 tabs)
│   │   ├── ViewRuntime.tsx           # View renderer with filters/pagination
│   │   ├── SortableStyleList.tsx     # Drag-and-drop style grid
│   │   ├── SortableConceptList.tsx   # Drag-and-drop concept list
│   │   └── SortableCategoryList.tsx  # Drag-and-drop category list
│   ├── lib/
│   │   ├── useKeyboardSave.ts        # useKeyboardSave + useEscapeClose hooks
│   │   ├── view-attributes.ts        # View attribute definitions & types
│   │   ├── hierarchy-context.tsx     # Product hierarchy context
│   │   ├── product-hierarchy.ts      # Hierarchy utilities
│   │   └── supabase/
│   │       ├── server.ts             # Server-side Supabase client
│   │       ├── client.ts             # Browser-side Supabase client
│   │       └── admin.ts              # Admin Supabase client (service role)
│   ├── package.json
│   └── tsconfig.json
├── apps/
│   └── web/                          # Public-facing website (separate app)
├── package.json                      # Root monorepo config (pnpm + Turborepo)
├── pnpm-workspace.yaml
└── turbo.json
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `Sidebar` | Collapsible left sidebar with active link highlighting |
| `BackLink` | Reusable back arrow navigation link |
| `ImageUpload` | Multi-file upload with drag reorder |
| `VariantTable` | CRUD table for product variants |
| `BulkVariantModal` | Quick Add: size × color matrix variant generator |
| `CustomizationTab` | Fabric.js interactive mockup editor (in-style) |
| `EmailQuoteModal` | Email quote: copy or open in email client |
| `CreateFromQuoteModal` | Convert quote to a new Style record |
| `NewQuoteModal` | Create a new quote request |
| `NewOrderModal` | Create a new order |
| `Skeleton` | Loading skeletons (card, row, logo, metric) + EmptyState |
| `ViewBuilder` | 4-tab view configuration interface |
| `ViewRuntime` | View renderer with filters, pagination, export |
| `SortableStyleList` | Drag-and-drop style grid |
| `SortableConceptList` | Drag-and-drop concept list |
| `SortableCategoryList` | Drag-and-drop category list |

### Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.6 | Framework |
| `react` | 19.2.3 | UI runtime |
| `fabric` | ^7.2.0 | Fabric.js canvas for mockup generation |
| `sonner` | ^2.0.7 | Toast notification system |
| `sharp` | ^0.34.5 | Server-side image metadata extraction |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop core |
| `@dnd-kit/sortable` | ^10.0.0 | Sortable drag-and-drop |
| `@supabase/ssr` | ^0.8.0 | Supabase SSR auth helpers |
| `@supabase/supabase-js` | ^2.97.0 | Supabase client library |
| `lucide-react` | ^0.576.0 | Icon set |
| `tailwindcss` | ^4 | CSS framework (dark theme) |
| `typescript` | 5.9.3 | Type system |

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
# Install dependencies (from repo root)
pnpm install

# Run the admin app only
pnpm dev:admin

# Run all apps in parallel
pnpm dev
```

The admin app runs on `http://localhost:3000` by default.

---

## 7. Development Guidelines

> **IMPORTANT: All future changes MUST be documented in this file.**

When adding features:
- Update the **Features** section (Section 2) with a description of the new feature
- Update **Database Schema** (Section 4) if tables or columns change
- Update **File Structure** (Section 5) if new routes or components are added
- Include examples and usage notes where helpful

When modifying existing features:
- Update the relevant feature description
- Note any breaking changes or migration steps needed

### Code Conventions

- **Server Components** for data fetching (`page.tsx` files under `admin/`)
- **Client Components** (`'use client'`) for interactive forms and mutations
- **Supabase clients**: Use `@/lib/supabase/server` for server components, `@/lib/supabase/client` for client components, `@/lib/supabase/admin` when service role is needed (API routes)
- **Styling**: Tailwind CSS v4 with dark theme (`bg-black`, `bg-neutral-900`, `border-neutral-800`, `text-white`)
- **Forms**: Controlled inputs with `useState`, submit handlers with loading states
- **Error handling**: `toast.error()` from Sonner for user-facing errors
- **Loading states**: Skeleton components from `components/Skeleton.tsx`
- **Keyboard shortcuts**: `useKeyboardSave` and `useEscapeClose` hooks from `lib/useKeyboardSave.ts`

---

## 8. Known Limitations / TODO

### Completed

- ~~Logo Library~~ — Upload and manage brand logos
- ~~Mockup Generator~~ — Generate product mockups with Fabric.js canvas
- ~~Toast notifications~~ — Sonner toasts throughout
- ~~Loading states~~ — Skeleton components for all list pages
- ~~Keyboard shortcuts~~ — Cmd+S save, Escape close
- ~~Empty states~~ — Styled empty states for all sections
- ~~View Builder~~ — Dynamic gallery/grid views
- ~~Quote Request System~~ — Full lifecycle management with price calculator, email modal, convert to style
- ~~Order Management~~ — Order tracking with status progression
- ~~Factories~~ — Factory/production partner management
- ~~Colour Library~~ — Colourway management with colour codes
- ~~Active nav highlighting~~ — Sidebar highlights active route

### Planned Features

- **PDF Export** — PDF generation from the View Builder export page (placeholder currently)
- **Advanced Mockup Features** — Batch export, mockup templates
- **Search & Filter** — Search on style and supplier list pages (currently only on quotes)
- **Image Deletion** — Remove images from Supabase Storage when removed from a style
- **Role-based Access Control** — Currently single admin role only
- **Audit Log** — Track changes to styles, quotes, and orders

### Known Limitations

- No pagination on most list pages (Views have pagination)
- No search/filter on style or supplier lists (use Views for filtered data)
- No image deletion from Supabase Storage when removed from a style
- Variant SKU uniqueness not enforced client-side
- No role-based access control (single admin role only)
- No audit log for changes
- PDF export not yet implemented
- Embroidery overlay position may drift if logo is dragged on canvas
