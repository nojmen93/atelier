# Atelier Admin — Database Schema Guide

Reference for everyone working on the database layer. Covers naming conventions, design decisions, index strategy, migration workflow, and data integrity rules.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Entity Hierarchy](#entity-hierarchy)
3. [Table Reference](#table-reference)
4. [Naming Conventions](#naming-conventions)
5. [JSON vs Relational Columns](#json-vs-relational-columns)
6. [Index Strategy](#index-strategy)
7. [Migration Workflow](#migration-workflow)
8. [Soft Delete vs Hard Delete](#soft-delete-vs-hard-delete)
9. [Audit & Change Tracking](#audit--change-tracking)
10. [Schema Audit Findings](#schema-audit-findings)

---

## Schema Overview

Supabase (PostgreSQL 15) database backing the Atelier Admin panel. All authentication is handled by Supabase Auth (`auth.users`). The public schema holds all application tables.

**Extensions in use:**
- `uuid-ossp` — `uuid_generate_v4()` for primary keys

---

## Entity Hierarchy

The PLM hierarchy from top to bottom:

```
Concept  (e.g. Culture, Collection, Infrastructure)
  └─ Category  (e.g. T-Shirts, Hoodies, Caps)
       └─ Style  (the core product — "Plain White Tee")
            └─ Variant  (size × color — "M / White")
```

Supporting entities that cross-cut the hierarchy:

| Entity | Relationship |
|--------|-------------|
| `suppliers` | Referenced by `categories` (default) and `styles` (override) |
| `factories` | Referenced by `orders` (production facility) |
| `logos` | Referenced by `customizations` (N:1) |
| `customizations` | Belong to `styles`, reference a `logo` |
| `quote_requests` | Optionally reference a `style`; convert → `orders` |
| `orders` | Reference `style`, `supplier`, `factory`, `quote_request` |
| `views` | Saved query configs for the Style grid/gallery |
| `rules` | Configurable business rules engine |

---

## Table Reference

### `concepts`

Top-level permanent groupings. Not seasonal.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | `uuid_generate_v4()` |
| `name` | TEXT UNIQUE NOT NULL | Display name |
| `slug` | TEXT UNIQUE NOT NULL | URL-safe identifier |
| `display_order` | INTEGER | Sort order in sidebar/listings |
| `created_at` | TIMESTAMPTZ | Auto |
| `updated_at` | TIMESTAMPTZ | Auto via trigger |

---

### `categories`

Operational groupings within a concept.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `concept_id` | UUID FK → `concepts.id` | CASCADE delete |
| `name` | TEXT NOT NULL | |
| `slug` | TEXT NOT NULL | Unique within concept — `UNIQUE(concept_id, slug)` |
| `description` | TEXT | |
| `display_order` | INTEGER | |
| `default_moq` | INTEGER | Inherited by Styles unless overridden |
| `default_supplier_id` | UUID FK → `suppliers.id` | SET NULL on delete |
| `default_lead_time_days` | INTEGER | |
| `default_margin_rule` | TEXT | e.g. `"margin_40"` |
| `technique_compatibility` | TEXT[] | e.g. `['embroidery', 'print']` |

**Inheritance:** When a new Style is created under a category, the form pre-fills `supplier_id`, `lead_time_days`, and MOQ from these defaults. The Style stores the final value explicitly — no runtime lookup.

---

### `styles`

The core product entity.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | |
| `concept_id` | UUID FK → `concepts.id` | RESTRICT delete |
| `gender` | `gender_type` enum | `mens / womens / unisex / na` |
| `category_id` | UUID FK → `categories.id` | RESTRICT delete |
| `supplier_id` | UUID FK → `suppliers.id` | SET NULL on delete |
| `base_cost` | DECIMAL(10,2) | Production cost |
| `lead_time_days` | INTEGER | |
| `customization_mode` | TEXT | Legacy field — prefer `product_capability` |
| `collection_type` | `collection_type` enum | `editorial / signature / foundation / special_projects` |
| `product_capability` | `product_capability` enum | `none / simple_customizable / quote_only / both` |
| `status` | `style_status` enum | `active / development / archived` |
| `description` | TEXT | |
| `material` | TEXT | |
| `images` | TEXT[] | Array of Supabase Storage public URLs |
| `display_order` | INTEGER | Used for drag-and-drop ordering in admin |

**`status` values:**
- `development` — internal work in progress, not shown publicly
- `active` — live on the public website (use this as the "published" proxy)
- `archived` — soft-removed, hidden from admin default views and public site

**`product_capability` values:**
- `none` — display only, no ordering
- `simple_customizable` — can be customized inline
- `quote_only` — redirects to quote request form
- `both` — supports customization + quotes

---

### `variants`

Size × color SKUs for a style.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `style_id` | UUID FK → `styles.id` | CASCADE delete |
| `size` | TEXT | e.g. `"S"`, `"M"`, `"XL"` |
| `color` | TEXT | e.g. `"White"`, `"Black"` |
| `sku` | TEXT UNIQUE | Format convention: `STYLECODE-SIZE-COLOR` |
| `stock` | INTEGER DEFAULT 0 | |
| `price_modifier` | DECIMAL(10,2) DEFAULT 0 | Added to `styles.base_cost` |

---

### `suppliers`

Supplier/vendor master data.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | |
| `contact_email` | TEXT | |
| `contact_phone` | TEXT | |
| `moq` | INTEGER | Minimum order quantity |
| `lead_time_days` | INTEGER | |
| `production_location` | TEXT | |
| `cost_structure` | JSONB | Flexible pricing tiers (see JSON section) |
| `notes` | TEXT | |

---

### `factories`

Production facilities (distinct from suppliers — a supplier may use multiple factories).

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `name` | TEXT NOT NULL | |
| `contact_name/email/phone` | TEXT | |
| `country / city / address` | TEXT | |
| `capacity_notes` | TEXT | |
| `certifications` | TEXT[] | e.g. `['GOTS', 'OEKO-TEX']` |
| `production_types` | TEXT[] | e.g. `['cut_and_sew', 'knitting']` |
| `moq` | INTEGER | |
| `lead_time_days` | INTEGER | |

---

### `logos`

Brand logo library.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `company_name` | TEXT NOT NULL | |
| `file_url` | TEXT NOT NULL | Supabase Storage public URL |
| `file_format` | TEXT NOT NULL | `svg / png / ai / eps` |
| `width` | INTEGER | Pixels (extracted by server at upload) |
| `height` | INTEGER | |
| `uploaded_by` | UUID | Soft reference to `auth.users.id` (no FK) |
| `created_at` | TIMESTAMPTZ | |

> **Note:** No `updated_at` column — logos are treated as immutable after upload. Replace by deleting and re-uploading.

---

### `customizations`

Logo placement records linked to a style. Produced by the Canvas 2D mockup editor.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `style_id` | UUID FK → `styles.id` | CASCADE delete |
| `logo_id` | UUID FK → `logos.id` | RESTRICT delete (see Audit Findings §10.3) |
| `placement` | TEXT NOT NULL | `center_front / center_back / from_hsp / wrs / wls` |
| `technique` | TEXT NOT NULL | `embroidery / print` |
| `pantone_color` | TEXT | e.g. `"PMS 286 C"` |
| `width_cm` | DECIMAL(5,2) | |
| `height_cm` | DECIMAL(5,2) | |
| `mockup_url` | TEXT | Supabase Storage PNG |

---

### `quote_requests`

Inbound B2B quote requests. Status lifecycle: `new → reviewed → quoted → accepted/rejected → converted`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `customer_name/email/company/phone` | TEXT | |
| `style_id` | UUID FK → `styles.id` | Optional reference; SET NULL on delete |
| `product_name` | TEXT | Free-text if no style linked |
| `customization_preferences` | JSONB | `{ placement, technique, pantone_color, width_cm, height_cm }` |
| `logo_file_url` | TEXT | Uploaded logo for this specific request |
| `quantity` | INTEGER | |
| `variant_preferences` | JSONB | Array: `[{ size, color, quantity }]` |
| `message` | TEXT | Customer notes |
| `status` | `quote_status` enum | |
| `quoted_price` | DECIMAL(10,2) | Admin fills when quoting |
| `customization_fee` | DECIMAL(10,2) | |
| `quoted_at` | TIMESTAMPTZ | |
| `internal_notes` | TEXT | Admin-only |
| `converted_style_id` | UUID FK → `styles.id` | Filled when quote converts to a Style |
| `converted_at` | TIMESTAMPTZ | |

---

### `orders`

Production orders, optionally linked to a quote.

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `order_number` | TEXT UNIQUE NOT NULL | Human-readable, e.g. `ORD-2024-001` |
| `quote_request_id` | UUID FK → `quote_requests.id` | SET NULL on delete |
| `style_id` | UUID FK → `styles.id` | SET NULL on delete |
| `supplier_id` | UUID FK → `suppliers.id` | SET NULL on delete |
| `factory_id` | UUID FK → `factories.id` | SET NULL on delete |
| `quantity` | INTEGER NOT NULL | |
| `unit_price / total_price` | DECIMAL(10,2) | |
| `currency` | TEXT DEFAULT 'EUR' | |
| `order_date / expected_delivery / actual_delivery` | DATE | |
| `status` | `order_status` enum | `draft → confirmed → in_production → shipped → delivered / cancelled` |
| `notes` | TEXT | |

---

### `views`

Saved admin view configurations (the View Builder output).

| Column | Type | Notes |
|--------|------|-------|
| `name` | TEXT NOT NULL | |
| `type` | TEXT CHECK `'grid' / 'gallery'` | |
| `entity` | TEXT DEFAULT 'styles' | Currently always `styles` |
| `selected_attributes` | TEXT[] | Attribute keys from `lib/view-attributes.ts` |
| `filters` | JSONB | Array of filter objects |
| `sort` | JSONB | Array of sort objects |
| `group_by` | TEXT[] | Group-by attribute keys |
| `display_options` | JSONB | Layout, pagination, columns config |
| `export_options` | JSONB | PDF export config |
| `is_default` | BOOLEAN | One default view per entity |
| `created_by` | UUID | Soft reference to `auth.users.id` |

---

### `rules`

Extensible business rules engine. Currently unused in production but reserved for future pricing/checkout logic.

| Column | Type | Notes |
|--------|------|-------|
| `condition_field` | TEXT | e.g. `collection_type` |
| `condition_value` | TEXT | e.g. `foundation` |
| `action_type` | TEXT | e.g. `margin_override`, `disable_checkout` |
| `action_value` | JSONB | e.g. `{ "margin": 0.4 }` |
| `priority` | INTEGER | Evaluation order (higher = higher priority) |
| `active` | BOOLEAN | Toggle rules without deleting |

---

## Naming Conventions

### Tables
- **Plural snake_case**: `quote_requests`, `styles`, `categories`
- Junction tables: `[table_a]_[table_b]` (e.g. if added: `style_tags`)

### Columns
- **snake_case** throughout
- Primary key: always `id UUID`
- Foreign keys: `[referenced_table_singular]_id` (e.g. `style_id`, `concept_id`)
- Boolean flags: `is_[state]` (e.g. `is_default`, `is_published`)
- Timestamps: `created_at`, `updated_at`, `[action]_at` (e.g. `converted_at`, `quoted_at`)
- Arrays: plural noun (e.g. `images`, `certifications`, `production_types`)
- JSONB blobs: noun phrase (e.g. `cost_structure`, `display_options`)

### Enums
- `[domain]_type` or `[domain]_status` (e.g. `gender_type`, `style_status`, `order_status`)
- Values: lowercase snake_case (e.g. `simple_customizable`, `in_production`)

### Indexes
- `idx_[table]_[column(s)]` (e.g. `idx_styles_status`, `idx_styles_concept_category_status`)

### Triggers
- `update_[table]_updated_at` (e.g. `update_styles_updated_at`)

---

## JSON vs Relational Columns

Use **JSONB** when:
- The shape is variable or schema-less (e.g. `cost_structure` on suppliers)
- The data is always read/written as a unit, never queried field-by-field
- The structure may evolve without a migration (e.g. `display_options`, `export_options` on views)
- It represents a transient snapshot (e.g. `customization_preferences` on a quote)

Use **relational columns** when:
- You need to filter, sort, or index on the value
- The field is a fixed domain with known values (→ use an ENUM instead)
- You need referential integrity (→ use a FK column)
- The value participates in aggregations or reporting

**Current JSONB usage and rationale:**

| Column | Rationale |
|--------|-----------|
| `suppliers.cost_structure` | Variable pricing tiers per supplier; never filtered |
| `quote_requests.customization_preferences` | Snapshot of customer request; shape mirrors `customizations` but is not linked |
| `quote_requests.variant_preferences` | Array of `{ size, color, quantity }` — variable length, always read as unit |
| `views.filters / sort / display_options / export_options` | View Builder config — complex, variable, never filtered |
| `rules.action_value` | Action payload varies by action type |

**Anti-patterns to avoid:**
- Do NOT store filterable attributes (status, concept, gender) in JSONB — they belong as typed columns with indexes
- Do NOT use JSONB for enumerations — define a PostgreSQL ENUM type
- Do NOT store image URLs in a JSONB array — use `TEXT[]` (simpler) or a separate `style_images` table (if ordering/metadata needed)

---

## Index Strategy

### Rule of thumb
Add an index when a column is:
1. Used in a `WHERE` clause across significant row counts
2. Used in a `JOIN` condition (foreign keys)
3. Used in `ORDER BY` for frequent queries
4. A frequently searched text field

### Current indexes (post-migration 003)

| Index | Table | Columns | Purpose |
|-------|-------|---------|---------|
| `idx_categories_concept` | `categories` | `concept_id` | FK join |
| `idx_categories_slug` | `categories` | `slug` | Slug lookup |
| `idx_styles_concept` | `styles` | `concept_id` | FK join |
| `idx_styles_category` | `styles` | `category_id` | FK join |
| `idx_styles_gender` | `styles` | `gender` | Filter |
| `idx_styles_collection_type` | `styles` | `collection_type` | Filter |
| `idx_styles_status` | `styles` | `status` | Filter (most common) |
| `idx_styles_supplier` | `styles` | `supplier_id` | FK join |
| `idx_styles_display_order` | `styles` | `display_order` | Admin sort |
| `idx_styles_name` | `styles` | `name` | Search |
| `idx_styles_status_concept` | `styles` | `(status, concept_id)` | Composite — public API queries |
| `idx_styles_status_category` | `styles` | `(status, category_id)` | Composite — filtered listing |
| `idx_styles_concept_category_status` | `styles` | `(concept_id, category_id, status)` | Full hierarchy filter |
| `idx_variants_style` | `variants` | `style_id` | FK join |
| `idx_customizations_style` | `customizations` | `style_id` | FK join |
| `idx_customizations_logo` | `customizations` | `logo_id` | FK join |
| `idx_logos_company_name` | `logos` | `company_name` | Logo library search |
| `idx_concepts_slug` | `concepts` | `slug` | Slug-based routing |
| `idx_quote_requests_status` | `quote_requests` | `status` | Admin filter |
| `idx_quote_requests_email` | `quote_requests` | `customer_email` | Lookup |
| `idx_quote_requests_style` | `quote_requests` | `style_id` | FK join |
| `idx_quote_requests_created` | `quote_requests` | `created_at DESC` | Admin sort |
| `idx_orders_status` | `orders` | `status` | Filter |
| `idx_orders_supplier` | `orders` | `supplier_id` | FK join |
| `idx_orders_factory` | `orders` | `factory_id` | FK join |
| `idx_orders_style` | `orders` | `style_id` | FK join |
| `idx_orders_quote` | `orders` | `quote_request_id` | FK join |
| `idx_orders_order_date` | `orders` | `order_date DESC` | Admin sort |
| `idx_rules_condition` | `rules` | `(condition_field, condition_value)` | Rules engine lookup |

> Unique constraints (`variants.sku`, `concepts.name`, `concepts.slug`) create implicit B-tree indexes automatically.

---

## Migration Workflow

### File naming

```
atelier-admin/supabase/migrations/
  001_create_quote_requests.sql
  002_add_factories_and_orders.sql
  003_add_indexes_and_constraints.sql
  NNN_description_of_change.sql
```

- Sequential 3-digit prefix
- Descriptive snake_case suffix
- Each file is **idempotent where possible** (use `IF NOT EXISTS`, `IF EXISTS`)

### How to apply

Migrations are applied manually to the Supabase project via the SQL editor or CLI:

```bash
# Using Supabase CLI (if linked)
supabase db push

# Or paste directly into Supabase Dashboard → SQL Editor
```

### Rules for writing migrations

1. **Never modify a deployed migration file** — always create a new one
2. **Wrap destructive changes in a transaction** (`BEGIN; ... COMMIT;`)
3. **Add new columns as nullable first**, then backfill, then add NOT NULL constraint
4. **Never drop a column in the same migration that removes its usages** — two-step: deploy code ignoring column, then drop
5. **Test on a development Supabase project** before applying to production
6. **Document the intent** with a comment block at the top of each migration

### Adding a new table (checklist)

- [ ] Define table with UUID PK and `created_at` / `updated_at` timestamps
- [ ] Add FK constraints with explicit `ON DELETE` behaviour
- [ ] Create `update_[table]_updated_at` trigger
- [ ] Add indexes on all FK columns and frequently filtered fields
- [ ] Document the table in this guide

### Adding a new column

```sql
-- Step 1: Add nullable column (safe, no downtime)
ALTER TABLE styles ADD COLUMN IF NOT EXISTS fabric_weight INTEGER;

-- Step 2: Backfill if needed
UPDATE styles SET fabric_weight = 200 WHERE fabric_weight IS NULL;

-- Step 3: Add constraint after backfill (if needed)
ALTER TABLE styles ALTER COLUMN fabric_weight SET NOT NULL;
ALTER TABLE styles ALTER COLUMN fabric_weight SET DEFAULT 0;
```

---

## Soft Delete vs Hard Delete

### Current policy: hard delete for most tables

| Table | Delete Behaviour | Rationale |
|-------|-----------------|-----------|
| `concepts` | Hard delete (RESTRICT on styles) | Can't delete if styles exist |
| `categories` | Hard delete (RESTRICT on styles) | Can't delete if styles exist |
| `styles` | Set `status = 'archived'` — never hard delete | Preserves order history |
| `variants` | Hard delete (CASCADE from style) | No independent history |
| `suppliers` | Hard delete (SET NULL on styles) | Styles become supplier-less |
| `factories` | Hard delete (SET NULL on orders) | Orders become factory-less |
| `logos` | Hard delete (RESTRICT on customizations) | Can't delete if in use |
| `customizations` | Hard delete (CASCADE from style) | Owned by the style |
| `quote_requests` | Hard delete | Or soft delete if audit needed |
| `orders` | Set `status = 'cancelled'` — never hard delete | Financial record |
| `views` | Hard delete | No downstream dependencies |
| `rules` | Soft delete via `active = FALSE` | Toggle without losing config |

### When to use soft delete

Add a `deleted_at TIMESTAMPTZ` column and filter on `WHERE deleted_at IS NULL` when:
- The entity is referenced in reports or financial records
- You need an audit trail for compliance
- The data may need to be recovered

**Styles already implement soft delete** via `status = 'archived'`. For full soft delete on other tables, use the pattern:

```sql
ALTER TABLE quote_requests ADD COLUMN deleted_at TIMESTAMPTZ;
CREATE INDEX idx_quote_requests_deleted ON quote_requests(deleted_at) WHERE deleted_at IS NULL;
```

---

## Audit & Change Tracking

### Current state

All tables with `updated_at` have automatic timestamp updates via the shared `update_updated_at_column()` trigger function. This tells you **when** something changed but not **what** or **who**.

### Adding a change log (future)

For full audit trails, create a `change_log` table:

```sql
CREATE TABLE change_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name  TEXT NOT NULL,
  record_id   UUID NOT NULL,
  action      TEXT NOT NULL,  -- 'INSERT' | 'UPDATE' | 'DELETE'
  changed_by  UUID,           -- auth.users.id
  changed_at  TIMESTAMPTZ DEFAULT NOW(),
  old_data    JSONB,
  new_data    JSONB
);
CREATE INDEX idx_change_log_record ON change_log(table_name, record_id);
CREATE INDEX idx_change_log_changed_at ON change_log(changed_at DESC);
```

And a generic audit trigger:

```sql
CREATE OR REPLACE FUNCTION log_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO change_log(table_name, record_id, action, old_data, new_data)
  VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END,
    CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

Apply to high-value tables (e.g. `styles`, `orders`, `quote_requests`).

---

## Schema Audit Findings

Findings from the March 2026 audit, addressed in migration `003_add_indexes_and_constraints.sql`.

### Fixed

#### 003.1 — Missing composite indexes on `styles`

**Problem:** The most common query pattern — "show active styles in concept X, category Y" — was performing sequential scans.

**Fix:** Added three composite indexes:
- `(status, concept_id)` — public API, concept-level filtering
- `(status, category_id)` — category-level filtering
- `(concept_id, category_id, status)` — full hierarchy filter

#### 003.2 — Missing indexes on slug columns

**Problem:** `concepts.slug` and `categories.slug` are used in URL-based routing but had no indexes.

**Fix:** Added `idx_concepts_slug` and `idx_categories_slug`.

#### 003.3 — Missing index on `customizations.logo_id`

**Problem:** FK columns without indexes cause slow joins when querying customizations by logo.

**Fix:** Added `idx_customizations_logo`.

#### 003.4 — Missing index on `styles.name` and `logos.company_name`

**Problem:** Search/autocomplete queries performing full table scans.

**Fix:** Added `idx_styles_name` and `idx_logos_company_name`.

#### 003.5 — Missing `updated_at` trigger on `variants`

**Problem:** `variants` had an `updated_at` column but no trigger to populate it.

**Fix:** Added `update_variants_updated_at` trigger.

#### 003.6 — Missing index on `styles.display_order`

**Problem:** Admin style list always orders by `display_order ASC` — no index.

**Fix:** Added `idx_styles_display_order`.

### Still open

#### OPEN.1 — `customizations.logo_id` ON DELETE CASCADE

**Risk:** Deleting a logo from the library currently cascades and silently deletes all customizations that reference it. This is data-loss behaviour.

**Recommended fix (requires data migration):**
```sql
-- Migration required — see below
ALTER TABLE customizations DROP CONSTRAINT customizations_logo_id_fkey;
ALTER TABLE customizations ADD CONSTRAINT customizations_logo_id_fkey
  FOREIGN KEY (logo_id) REFERENCES logos(id) ON DELETE RESTRICT;
```
This makes logo deletion fail if customizations reference it — forcing the user to re-assign or delete customizations first. Apply in migration `004_fix_logo_cascade.sql`.

#### OPEN.2 — No NOT NULL on `categories.slug`

`categories.slug` can currently be inserted as NULL (it's declared `NOT NULL` in the schema but the migration may not enforce it in all environments). Verify with:
```sql
SELECT attnotnull FROM pg_attribute
WHERE attrelid = 'categories'::regclass AND attname = 'slug';
```

#### OPEN.3 — `logos.uploaded_by` and `views.created_by` are untyped UUIDs

These columns reference `auth.users.id` but have no FK constraint (Supabase's `auth` schema is not directly FK-referenceable from the public schema). This is expected Supabase behaviour. Document that these are soft references — orphaned rows are acceptable.

#### OPEN.4 — No pagination-safe cursor on style lists

Admin list and public API both currently use `LIMIT/OFFSET` pagination. For large datasets, switch to cursor-based pagination using `(display_order, id)` as the cursor. This is a future optimization once style count exceeds ~500 rows.

#### OPEN.5 — `styles.images TEXT[]` has no ordering guarantee after update

Reordering images in the admin drag-and-drop writes the full array back in order — correct. But direct DB inserts won't respect order. Document that image order is determined by array index and must be managed through the admin UI only.
