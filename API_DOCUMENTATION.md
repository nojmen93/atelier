# Atelier — API Documentation

Reference for all HTTP endpoints: internal admin APIs and the public-facing REST API for the Atelier website.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Admin APIs (Internal)](#admin-apis-internal)
4. [Public REST API (Admin → Website)](#public-rest-api-admin--website)
5. [Request / Response Conventions](#request--response-conventions)
6. [Pagination](#pagination)
7. [Error Handling](#error-handling)
8. [Caching Strategy](#caching-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Implementation Plan](#implementation-plan)

---

## Overview

The system exposes two categories of APIs:

| Category | Base path | Auth | Consumer |
|----------|-----------|------|---------|
| **Admin APIs** | `/api/` (atelier-admin) | Required — Supabase session cookie | Admin dashboard (internal) |
| **Public REST API** | `/api/` (apps/web) | None for reads | Public website, future mobile |

All endpoints use JSON. All timestamps are ISO 8601 with timezone (`2024-03-07T12:00:00.000Z`).

---

## Authentication

### Admin APIs

All admin endpoints require an authenticated Supabase session. Authentication is cookie-based (Supabase SSR). Requests without a valid session return `401 Unauthorized`.

```
Authorization: <handled automatically by @supabase/ssr cookie>
```

The `/api/users` endpoint additionally requires the `SUPABASE_SERVICE_ROLE_KEY` environment variable to call the Supabase Auth Admin API — this key must never be exposed to the browser.

### Public REST API

Public endpoints (styles listing, category hierarchy) require **no authentication**. They only expose `status = 'active'` data.

If rate limiting is added, it should be at the edge (Vercel middleware or Cloudflare) rather than in route handlers.

---

## Admin APIs (Internal)

These live in `atelier-admin/app/api/`.

---

### `POST /api/upload`

Upload a product image to Supabase Storage.

**Auth:** Required

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | JPG, PNG, or WebP — max 5 MB |

**Response `200`:**
```json
{
  "url": "https://[project].supabase.co/storage/v1/object/public/product-images/styles/uuid.jpg"
}
```

**Errors:**
- `400` — missing file, unsupported format, or file too large
- `401` — unauthenticated
- `500` — storage upload failed

---

### `POST /api/logos/upload`

Upload a logo file and create a record in the `logos` table.

**Auth:** Required

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | SVG, PNG, AI, or EPS — max 10 MB |
| `company_name` | string | Yes | Display name for the logo |

**Response `200`:**
```json
{
  "id": "uuid",
  "company_name": "Acme Corp",
  "file_url": "https://[project].supabase.co/storage/v1/object/public/logos/uuid.svg",
  "file_format": "svg",
  "width": 400,
  "height": 200,
  "created_at": "2024-03-07T12:00:00.000Z"
}
```

**Notes:**
- PNG dimensions are extracted via `sharp`
- SVG dimensions are parsed from `width`/`height` attributes or `viewBox`
- AI/EPS files are stored without dimension extraction

**Errors:**
- `400` — missing fields, unsupported format, file too large
- `401` — unauthenticated
- `500` — storage or DB failure

---

### `GET /api/users`

List all Supabase Auth users.

**Auth:** Required (uses service role key)

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "email": "admin@atelier.com",
    "created_at": "2024-01-15T09:00:00.000Z"
  }
]
```

---

### `POST /api/users`

Create a new admin user.

**Auth:** Required (uses service role key)

**Request body:**
```json
{
  "email": "newadmin@atelier.com",
  "password": "min6chars"
}
```

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "newadmin@atelier.com",
  "created_at": "2024-03-07T12:00:00.000Z"
}
```

**Errors:**
- `400` — missing email or password
- `401` — unauthenticated
- `500` — Supabase Auth error (e.g. email already in use)

---

### `DELETE /api/users`

Delete a user. Cannot delete yourself.

**Auth:** Required (uses service role key)

**Request body:**
```json
{ "id": "uuid-of-user-to-delete" }
```

**Response `200`:**
```json
{ "success": true }
```

**Errors:**
- `400` — missing ID, or attempting to delete self
- `401` — unauthenticated
- `500` — Supabase Auth error

---

## Public REST API (Admin → Website)

These endpoints are designed to be built inside `apps/web/app/api/` (Next.js route handlers). They query the Supabase database directly using the **anon key** — Supabase Row Level Security (RLS) must be configured to allow public reads on `active` styles.

> **Note:** As of March 2026 these endpoints do not yet exist. See the [Implementation Plan](#implementation-plan) for how to build them.

---

### `GET /api/styles`

List published styles with optional filters.

**Auth:** None

**Query parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `concept` | string | Concept slug | `culture` |
| `category` | string | Category slug | `t-shirts` |
| `gender` | string | `mens / womens / unisex / na` | `unisex` |
| `collection_type` | string | `editorial / signature / foundation / special_projects` | `signature` |
| `capability` | string | `simple_customizable / quote_only / both` | `quote_only` |
| `page` | integer | Page number, 1-indexed (default: `1`) | `2` |
| `limit` | integer | Items per page (default: `24`, max: `100`) | `12` |
| `sort` | string | `display_order / name / created_at` (default: `display_order`) | `name` |
| `dir` | string | `asc / desc` (default: `asc`) | `desc` |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Essential Tee",
      "description": "Our most versatile foundation piece.",
      "material": "100% organic cotton",
      "gender": "unisex",
      "collection_type": "foundation",
      "product_capability": "simple_customizable",
      "base_cost": 24.50,
      "lead_time_days": 21,
      "images": [
        "https://[project].supabase.co/storage/v1/object/public/product-images/styles/uuid.jpg"
      ],
      "concept": {
        "id": "uuid",
        "name": "Culture",
        "slug": "culture"
      },
      "category": {
        "id": "uuid",
        "name": "T-Shirts",
        "slug": "t-shirts"
      },
      "variant_count": 12,
      "created_at": "2024-01-20T10:00:00.000Z",
      "updated_at": "2024-03-01T14:30:00.000Z"
    }
  ],
  "meta": {
    "total": 48,
    "page": 1,
    "limit": 24,
    "total_pages": 2,
    "has_next": true,
    "has_prev": false
  }
}
```

**Notes:**
- Always filters `status = 'active'` — archived and development styles are never returned
- `images` array order matches admin drag-and-drop order; first image is the primary
- `variant_count` is a subquery count, not the full variant list (use the single-style endpoint for variants)
- `base_cost` is included for transparency but should be marked optional if you don't want to expose pricing

---

### `GET /api/styles/[id]`

Single style with full variant and customization details.

**Auth:** None

**Path parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Style ID |

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Essential Tee",
  "description": "Our most versatile foundation piece.",
  "material": "100% organic cotton",
  "gender": "unisex",
  "collection_type": "foundation",
  "product_capability": "simple_customizable",
  "base_cost": 24.50,
  "lead_time_days": 21,
  "images": ["https://..."],
  "concept": {
    "id": "uuid",
    "name": "Culture",
    "slug": "culture"
  },
  "category": {
    "id": "uuid",
    "name": "T-Shirts",
    "slug": "t-shirts"
  },
  "supplier": {
    "id": "uuid",
    "name": "Studio Fabrics",
    "production_location": "Portugal",
    "lead_time_days": 21
  },
  "variants": [
    {
      "id": "uuid",
      "size": "S",
      "color": "White",
      "sku": "ESS-TEE-S-WHITE",
      "stock": 50,
      "price_modifier": 0.00
    },
    {
      "id": "uuid",
      "size": "M",
      "color": "White",
      "sku": "ESS-TEE-M-WHITE",
      "stock": 75,
      "price_modifier": 0.00
    }
  ],
  "customizations": [
    {
      "id": "uuid",
      "placement": "center_front",
      "technique": "embroidery",
      "pantone_color": "PMS 286 C",
      "width_cm": 8.0,
      "height_cm": 6.0,
      "mockup_url": "https://..."
    }
  ],
  "created_at": "2024-01-20T10:00:00.000Z",
  "updated_at": "2024-03-01T14:30:00.000Z"
}
```

**Errors:**
- `404` — style not found, or `status != 'active'`

**Notes:**
- `supplier.contact_email` and `supplier.contact_phone` are intentionally excluded from the public response
- Customizations with no `mockup_url` are included; the frontend can fall back to a placeholder
- If `product_capability = 'none'` or `'quote_only'`, variants may be empty — handle gracefully

---

### `GET /api/categories`

Full category hierarchy for navigation and filtering.

**Auth:** None

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Culture",
      "slug": "culture",
      "display_order": 1,
      "categories": [
        {
          "id": "uuid",
          "name": "T-Shirts",
          "slug": "t-shirts",
          "display_order": 1,
          "style_count": 12
        },
        {
          "id": "uuid",
          "name": "Hoodies",
          "slug": "hoodies",
          "display_order": 2,
          "style_count": 8
        }
      ]
    },
    {
      "id": "uuid",
      "name": "Collection",
      "slug": "collection",
      "display_order": 2,
      "categories": [...]
    }
  ]
}
```

**Notes:**
- `style_count` counts only `status = 'active'` styles — a category with zero active styles can still appear (filter client-side if needed)
- `display_order` mirrors the admin drag-and-drop sort order
- This endpoint is suitable for site navigation menus — response can be cached aggressively (see Caching section)

---

## Request / Response Conventions

### Content-Type

All responses are `application/json; charset=utf-8`.

### Field naming

All fields use `snake_case` to match the database column names directly. No transformation layer.

### Null vs omitted fields

Fields with no value are returned as `null` (not omitted). This keeps response shapes consistent for frontend destructuring.

### Enums in responses

Enum values are returned as their raw database string values (e.g. `"unisex"`, `"foundation"`). The frontend should map these to display labels using its own constants — do not rely on the API to return human-readable labels.

### Timestamps

All timestamps are returned as ISO 8601 strings in UTC: `"2024-03-07T12:00:00.000Z"`.

---

## Pagination

The public API uses **offset-based pagination** (suitable for current data volumes, <500 styles).

**Request:**
```
GET /api/styles?page=2&limit=12
```

**Response `meta` object:**
```json
{
  "total": 48,
  "page": 2,
  "limit": 12,
  "total_pages": 4,
  "has_next": true,
  "has_prev": true
}
```

**Implementation:**
```ts
const offset = (page - 1) * limit
const { data, count } = await supabase
  .from('styles')
  .select('*, concepts(*), categories(*)', { count: 'exact' })
  .eq('status', 'active')
  .range(offset, offset + limit - 1)
```

**Future: cursor-based pagination**

Once style count exceeds ~500 rows, switch to cursor pagination for consistent performance:

```
GET /api/styles?after=cursor_value&limit=24
```

Cursor encodes `(display_order, id)` as a base64 string. This avoids the performance degradation of `OFFSET` on large tables.

---

## Error Handling

All endpoints return errors in this shape:

```json
{
  "error": "Human-readable message describing what went wrong",
  "code": "OPTIONAL_ERROR_CODE"
}
```

### HTTP status codes used

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Bad request — invalid parameters or missing required fields |
| `401` | Unauthenticated — valid session required |
| `403` | Forbidden — authenticated but not authorized |
| `404` | Not found |
| `422` | Validation error — fields present but invalid |
| `429` | Rate limited |
| `500` | Internal server error |

### Error handling pattern for route handlers

```ts
export async function GET(req: NextRequest) {
  try {
    // ... handler logic
    return NextResponse.json(data)
  } catch (err) {
    console.error('[GET /api/styles]', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

---

## Caching Strategy

### Public API endpoints

| Endpoint | Cache strategy | Rationale |
|----------|---------------|-----------|
| `GET /api/categories` | `s-maxage=300, stale-while-revalidate=60` | Changes infrequently; safe to cache 5 min at CDN |
| `GET /api/styles` | `s-maxage=60, stale-while-revalidate=30` | Active styles change rarely; 1 min CDN cache |
| `GET /api/styles/[id]` | `s-maxage=60, stale-while-revalidate=30` | Same rationale |

Set headers in route handlers:

```ts
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 's-maxage=60, stale-while-revalidate=30',
  },
})
```

### Next.js App Router caching

Use `fetch` with `next.revalidate` in Server Components for the website:

```ts
// apps/web/lib/api.ts
export async function getStyles(params: StylesQuery) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/styles?${qs}`, {
    next: { revalidate: 60 }, // ISR — revalidate every 60 seconds
  })
  return res.json()
}
```

For the categories nav (changes very rarely):

```ts
next: { revalidate: 300 } // 5 minutes
```

### CDN

Deploy `apps/web` to Vercel. Static pages and cached API responses are served from Vercel's Edge Network automatically. No additional CDN configuration required for initial launch.

For images: Supabase Storage URLs are served from their CDN. Use Next.js `<Image>` with `remotePatterns` configured for `[project].supabase.co` to get automatic format conversion (WebP) and responsive resizing.

---

## Performance Considerations

### Query patterns and index usage

The `GET /api/styles` endpoint uses the composite indexes added in migration 003:

```sql
-- "All active styles in the Culture concept, T-Shirts category"
SELECT s.*, c.name AS category_name, co.name AS concept_name
FROM styles s
JOIN categories c ON s.category_id = c.id
JOIN concepts co ON s.concept_id = co.id
WHERE s.status = 'active'
  AND co.slug = 'culture'
  AND c.slug = 't-shirts'
ORDER BY s.display_order ASC
LIMIT 24 OFFSET 0;
-- Uses: idx_styles_concept_category_status, idx_concepts_slug, idx_categories_slug
```

### N+1 query prevention

Always join related data in a single Supabase query rather than fetching in a loop:

```ts
// Good — single query with joins
const { data } = await supabase
  .from('styles')
  .select(`
    *,
    concepts(id, name, slug),
    categories(id, name, slug),
    variants(id, size, color, sku, stock, price_modifier)
  `)
  .eq('status', 'active')

// Bad — N+1 pattern
for (const style of styles) {
  const variants = await supabase.from('variants').select('*').eq('style_id', style.id)
}
```

### `variant_count` without loading all variants

On the listing endpoint, avoid loading full variant arrays:

```ts
const { data } = await supabase
  .from('styles')
  .select(`
    *,
    concepts(id, name, slug),
    categories(id, name, slug),
    variants(count)   // Supabase aggregate — returns count only
  `)
  .eq('status', 'active')
```

### Image optimization

- Store images in Supabase Storage (`product-images` bucket)
- Use Next.js `<Image>` component — it handles WebP conversion and responsive srcsets
- First image in `style.images[]` is the primary/hero image
- Recommended display sizes: thumbnail 400×400, card 800×800, hero 1200×1200

### Rate limiting

For initial launch, Vercel's built-in DDoS protection is sufficient. If you need explicit rate limiting:

```ts
// apps/web/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  // Vercel KV-based rate limiter, or use upstash/ratelimit
}
export const config = { matcher: '/api/:path*' }
```

Recommended: [Upstash Rate Limit](https://github.com/upstash/ratelimit) with Vercel KV — 100 req/min per IP for public endpoints.

---

## Implementation Plan

Step-by-step guide to build the public API endpoints in `apps/web`.

### Step 1 — Configure Supabase client for web app

Create `apps/web/lib/supabase.ts`:

```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

Add to `apps/web/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
```

### Step 2 — Enable Row Level Security for public reads

In Supabase Dashboard → Authentication → Policies, add these RLS policies:

```sql
-- Allow public reads on active styles
CREATE POLICY "Public can read active styles"
  ON styles FOR SELECT
  USING (status = 'active');

-- Allow public reads on concepts and categories
CREATE POLICY "Public can read concepts"
  ON concepts FOR SELECT USING (true);

CREATE POLICY "Public can read categories"
  ON categories FOR SELECT USING (true);

-- Allow public reads on variants of active styles
CREATE POLICY "Public can read variants of active styles"
  ON variants FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM styles WHERE id = variants.style_id AND status = 'active'
  ));

-- Allow public reads on customizations of active styles
CREATE POLICY "Public can read customizations of active styles"
  ON customizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM styles WHERE id = customizations.style_id AND status = 'active'
  ));
```

### Step 3 — Create route handlers

File structure:

```
apps/web/app/api/
  styles/
    route.ts           # GET /api/styles
    [id]/
      route.ts         # GET /api/styles/[id]
  categories/
    route.ts           # GET /api/categories
```

#### `apps/web/app/api/styles/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const concept    = searchParams.get('concept')
  const category   = searchParams.get('category')
  const gender     = searchParams.get('gender')
  const collection = searchParams.get('collection_type')
  const capability = searchParams.get('capability')
  const page       = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit      = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '24')))
  const sort       = searchParams.get('sort') ?? 'display_order'
  const dir        = (searchParams.get('dir') ?? 'asc') as 'asc' | 'desc'

  const ALLOWED_SORT = ['display_order', 'name', 'created_at']
  if (!ALLOWED_SORT.includes(sort)) {
    return NextResponse.json({ error: 'Invalid sort field' }, { status: 400 })
  }

  try {
    let query = supabase
      .from('styles')
      .select(`
        id, name, description, material, gender, collection_type,
        product_capability, base_cost, lead_time_days, images,
        display_order, created_at, updated_at,
        concepts!inner(id, name, slug),
        categories!inner(id, name, slug),
        variants(count)
      `, { count: 'exact' })
      .eq('status', 'active')
      .order(sort, { ascending: dir === 'asc' })
      .range((page - 1) * limit, page * limit - 1)

    if (concept)    query = query.eq('concepts.slug', concept)
    if (category)   query = query.eq('categories.slug', category)
    if (gender)     query = query.eq('gender', gender)
    if (collection) query = query.eq('collection_type', collection)
    if (capability) query = query.eq('product_capability', capability)

    const { data, count, error } = await query

    if (error) throw error

    const total = count ?? 0
    return NextResponse.json(
      {
        data: data?.map(s => ({ ...s, variant_count: s.variants[0]?.count ?? 0, variants: undefined })),
        meta: {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
          has_next: page * limit < total,
          has_prev: page > 1,
        },
      },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' } }
    )
  } catch (err) {
    console.error('[GET /api/styles]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### `apps/web/app/api/styles/[id]/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase
      .from('styles')
      .select(`
        *,
        concepts(id, name, slug),
        categories(id, name, slug),
        suppliers(id, name, production_location, lead_time_days),
        variants(id, size, color, sku, stock, price_modifier),
        customizations(id, placement, technique, pantone_color, width_cm, height_cm, mockup_url)
      `)
      .eq('id', params.id)
      .eq('status', 'active')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 })
    }

    return NextResponse.json(data, {
      headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=30' },
    })
  } catch (err) {
    console.error('[GET /api/styles/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### `apps/web/app/api/categories/route.ts`

```ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: concepts, error } = await supabase
      .from('concepts')
      .select(`
        id, name, slug, display_order,
        categories(id, name, slug, display_order)
      `)
      .order('display_order', { ascending: true })

    if (error) throw error

    // Add style counts per category
    const { data: counts } = await supabase
      .from('styles')
      .select('category_id')
      .eq('status', 'active')

    const countMap: Record<string, number> = {}
    for (const row of counts ?? []) {
      countMap[row.category_id] = (countMap[row.category_id] ?? 0) + 1
    }

    const result = (concepts ?? []).map(c => ({
      ...c,
      categories: (c.categories ?? [])
        .sort((a, b) => a.display_order - b.display_order)
        .map(cat => ({ ...cat, style_count: countMap[cat.id] ?? 0 })),
    }))

    return NextResponse.json(
      { data: result },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' } }
    )
  } catch (err) {
    console.error('[GET /api/categories]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### Step 4 — Add `@supabase/supabase-js` to `apps/web`

```bash
cd apps/web && pnpm add @supabase/supabase-js
```

### Step 5 — Configure Next.js image domains

In `apps/web/next.config.ts`:

```ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '[your-project].supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
}
export default nextConfig
```

### Step 6 — Consume the API in website components

```ts
// apps/web/lib/api.ts
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

export async function getStyles(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const res = await fetch(`${BASE}/api/styles${qs ? `?${qs}` : ''}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error('Failed to fetch styles')
  return res.json()
}

export async function getStyle(id: string) {
  const res = await fetch(`${BASE}/api/styles/${id}`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Style not found')
  return res.json()
}

export async function getCategories() {
  const res = await fetch(`${BASE}/api/categories`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}
```

### Step 7 — Testing strategy

**Unit tests** (Vitest or Jest):
- Test query builder logic with mocked Supabase client
- Test pagination edge cases (`page=0`, `limit=0`, `limit=999`)
- Test filter parameter validation

**Integration tests** (against a dev Supabase project):
- `GET /api/styles` returns only `status=active` styles
- `GET /api/styles?concept=culture` returns correct subset
- `GET /api/styles/[non-existent-id]` returns `404`
- `GET /api/categories` includes `style_count` per category

**Manual smoke test checklist:**
- [ ] Returns 200 for all three endpoints with no parameters
- [ ] Pagination `meta` fields are correct
- [ ] Filtering by `concept` slug returns only that concept's styles
- [ ] `GET /api/styles/[id]` for a development-status style returns 404
- [ ] Response includes correct `Cache-Control` header
- [ ] No supplier `contact_email` or `contact_phone` in the response
