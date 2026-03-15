# Atelier Admin — Demo Walkthrough

A step-by-step guide to showcasing every feature of the Atelier Admin panel. Follow the sections in order for a complete demo, or jump to any section independently.

**App URL:** `http://localhost:3000`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Style Management](#3-style-management)
4. [Supplier & Factory Management](#4-supplier--factory-management)
5. [Concept & Category Management](#5-concept--category-management)
6. [Logo Library](#6-logo-library)
7. [Mockup Generator](#7-mockup-generator)
8. [Quote Request Management](#8-quote-request-management)
9. [Order Management](#9-order-management)
10. [Views & Export](#10-views--export)
11. [UX Features](#11-ux-features)

---

## 1. Authentication

### Login

1. Navigate to `http://localhost:3000/login`
2. Enter your admin email and password
3. Click **Login**

**Expected behavior:**
- Login form shows centered on a black background with "Atelier Admin" heading
- On success: redirects to `/admin` (Dashboard)
- On failure: a toast notification appears in the top-right corner with the error message (e.g., "Invalid login credentials")
- Loading state: button text changes to "Loading..." while authenticating

### Protected Routes Redirect

1. Open an incognito/private window
2. Navigate directly to `http://localhost:3000/admin`
3. You should be automatically redirected to `/login`

**Expected behavior:**
- All `/admin/*` routes are protected by server-side auth check in `app/admin/layout.tsx`
- Unauthenticated users are redirected to `/login` immediately
- No flash of protected content before redirect

---

## 2. Dashboard Overview

After login, you land on the Dashboard (`/admin`).

### Sidebar Navigation

The admin uses a **collapsible left sidebar** with sections that expand and collapse. The current page is highlighted.

**Sidebar sections:**
- **Dashboard** — direct link to `/admin`
- **Product** — Hierarchy, Product (Styles), Colour Library, Specification
- **Production** — Quote Requests, Orders, Suppliers, Factories
- **Logos** — Logo Library, Upload Logo, Mockup Generator
- **Views** — All Views, New View
- **Footer** — Settings, Sign Out

### Styles Metrics (top row)

| Card | What It Tracks |
|------|----------------|
| **Total Styles** | Count of all styles in the database |
| **Active Styles** | Count of styles with `status = 'active'` |
| **Concepts** | Count of all concepts (collections/product lines) |

### Production Metrics (second row)

| Card | What It Tracks |
|------|----------------|
| **Suppliers** | Count of all registered suppliers |
| **Active Orders** | Orders in confirmed/in_production/shipped (clickable → /admin/orders) |
| **Pending Quotes** | Quotes in new/reviewed status (clickable, blue-highlighted → /admin/quotes) |

### Quote Requests Section

4 metrics + a recent quotes table:

| Metric | Description |
|--------|-------------|
| **Pending Review** | Quotes awaiting action (blue, clickable) |
| **Total Quotes** | All quote requests ever submitted |
| **Accepted/Converted** | Quotes accepted or converted to styles |
| **Conversion Rate** | Accepted ÷ Quoted, shown as % |

**Recent Quotes table** — last 5 quote requests with date, customer name, company, product, quantity, status badge, and a View link.

---

## 3. Style Management

> **Note:** Products are called "Styles" in this system.

### 3a. Create a New Style

1. Navigate to **Product → Product** in the sidebar (`/admin/styles`)
2. Click **New Style** (top-right button)
3. Fill in the form:

| Field | Example Value | Required |
|-------|---------------|----------|
| Style Name | "Premium Oxford Shirt" | Yes |
| Concept | (select from dropdown) | Yes |
| Category | (populates after concept) | Yes |
| Gender | "Men's" | Yes |
| Collection Type | "Signature" | Yes |
| Product Capability | "Simple Customizable" | Yes |
| Status | "Development" | No |
| Description | "A premium oxford..." | No |
| Material | "100% Egyptian Cotton" | No |
| Base Supplier | (select from dropdown) | No |
| Base Cost (EUR) | "45.00" | No |
| Lead Time (days) | "21" | No |
| Customization Mode | "logo placement, embroidery" | No |

4. Click **Create Style**

**Expected behavior:**
- Concept dropdown loads all concepts
- Category dropdown is disabled until a concept is selected; then shows that concept's categories
- Toast notification: "Style created" on success
- Redirects back to styles list

### 3b. Upload Multiple Images

1. On the style edit page, scroll to the **Images** section
2. Click the upload area or drag files
3. Upload multiple JPG/PNG/WebP images (max 5 MB each)

**Expected behavior:**
- Progress indicator shows during upload
- Images appear as thumbnails after upload
- First image is marked as primary

### 3c. Drag to Reorder Images

1. With multiple images uploaded, grab an image thumbnail
2. Drag it to a new position
3. Release

**Expected behavior:**
- Images reorder visually during drag
- Order is saved immediately
- Primary image (first position) determines the main product photo

### 3d. Add Variants (Manual and Bulk)

**Manual:**
1. Click the **Variants** tab on a style edit page
2. Click **Add Variant**
3. Enter size, color, SKU, stock, price modifier
4. Click **Save**

**Bulk (Quick Add):**
1. Click **Quick Add** button
2. Select sizes (checkboxes): XS, S, M, L, XL, XXL
3. Select colors from presets or add custom colors
4. Click **Generate**
5. Review the size × color matrix with auto-generated SKUs

**Expected behavior:**
- SKUs auto-generated from style name + size + color
- Bulk creation generates all combinations at once
- Variants display in a table with inline editing
- Toast notifications on save/delete

### 3e. Drag to Reorder Styles

1. Go to **Styles** list (`/admin/styles`)
2. Grab the drag handle (6-dot grip icon) on any style card
3. Drag to a new position
4. Release

**Expected behavior:**
- Opacity reduction on the dragged item
- 8px activation distance prevents accidental drags
- Order saved to database immediately on drop

### 3f. Edit Style

1. Click any style card in the list
2. Modify any fields
3. Click **Save Changes** or press `Cmd/Ctrl + S`

**Expected behavior:**
- All existing data pre-populated
- Keyboard shortcut triggers save
- Toast: "Changes saved"

### 3g. Status Toggle (Development / Active / Archived)

1. On the style edit page, use the **status dropdown** in the top-right
2. Switch between: Development, Active, Archived

**Expected behavior:**
- Status badge changes color:
  - **Active** — green
  - **Development** — yellow
  - **Archived** — red/neutral
- Archived styles are hidden from the main styles list (soft delete)

### 3h. Archive Style (Soft Delete)

1. On the style edit page, click **Archive** (red button at bottom)
2. Confirmation prompt appears
3. Confirm

**Expected behavior:**
- Style is not permanently deleted — `status` is set to `archived`
- Toast: "Style archived"
- Style no longer appears in the list

---

## 4. Supplier & Factory Management

### 4a. Create Supplier

1. Navigate to **Production → Suppliers** (`/admin/suppliers`)
2. Click **New Supplier**
3. Fill in name, contact email, MOQ, lead time, production location
4. Click **Save**

**Expected behavior:**
- Toast notification on success
- Redirects to suppliers list
- Empty state shown if no suppliers exist

### 4b. Factories

1. Navigate to **Production → Factories** (`/admin/factories`)
2. Create and manage factory/production partner records

Factories are separate from Suppliers and track production facility details.

---

## 5. Concept & Category Management

> **Note:** The system uses a two-level hierarchy: **Concepts** contain **Categories**.

### 5a. Create Concept

1. Navigate to **Product → Hierarchy** or via Concepts link
2. Click **New Concept**
3. Enter name, slug, description

**Expected behavior:**
- Slug auto-generated from name
- Concept appears in the sortable list

### 5b. Create Categories Under a Concept

1. Click a concept to edit it
2. In the categories section, click **New Category**
3. Enter name, slug, description

**Expected behavior:**
- Category is linked to the parent concept
- Shows inline within the concept card on the concepts list page

### 5c. Drag to Reorder

- Both concepts and their categories support drag-and-drop reordering
- Display order saved immediately to database
- Uses @dnd-kit with 8px activation distance

---

## 6. Logo Library

### 6a. Upload Logo

1. Navigate to **Logos → Upload Logo** (`/admin/logos/new`)
2. Enter company name (e.g., "Acme Corp")
3. Click the upload area and select a file

| Supported Formats | Max Size |
|-------------------|----------|
| SVG, PNG, AI, EPS | 10 MB |

**Expected behavior:**
- **SVG/PNG:** Shows live preview after selection, extracts dimensions automatically
- **AI/EPS:** Shows format label instead of preview ("Preview not available for this format")
- Upload progress bar animates
- Redirects to logos list on success

### 6b. View Logo Details

1. Click any logo card in the grid
2. View the detail page

**Details shown:**
- Large logo preview (for SVG/PNG)
- Format badge (SVG, PNG, AI, EPS)
- Dimensions (width × height in pixels, if available)
- Upload date
- Direct file URL link
- Edit company name field
- Delete with confirmation

### 6c. Metadata Extraction

The upload API automatically extracts metadata:

| Format | Extraction Method |
|--------|------------------|
| PNG | `sharp` library reads image metadata |
| SVG | Regex parses `width`/`height`/`viewBox` attributes |
| AI/EPS | No dimensions extracted |

---

## 7. Mockup Generator

> Uses **Fabric.js v7** for interactive canvas-based mockup generation. Available on the Style edit Customization tab and as a standalone page at **Logos → Mockup Generator** (`/admin/mockup`).

### 7a. Open Customization Tab

1. Navigate to **Styles** → click a style that has images
2. Click the **Customization** tab (third tab after Details, Variants)

**Expected behavior:**
- If the style has no images: "Add product images first to enable customization"
- If images exist: the Fabric.js canvas loads with the first image as background

### 7b. Select a Logo

1. In the form, select a logo from the dropdown
2. The logo appears on the canvas at the default placement position

**Expected behavior:**
- Dropdown shows: company name + format (e.g., "Acme Corp (PNG)")
- SVG/PNG logos render as actual images on canvas
- AI/EPS logos show a labeled placeholder box

### 7c. Choose Placement (5 Positions)

| Placement | Canvas Position | Description |
|-----------|-----------------|-------------|
| Center Front | Center-top area | Standard chest placement |
| Center Back | Center-top area | Back print/embroidery |
| From HSP | Upper-right area | High Shoulder Point placement |
| Center on WRS | Right-center area | Waist Right Seam |
| Center on WLS | Left-center area | Waist Left Seam |

### 7d. Switch Between Embroidery and Print

**Embroidery:**
- Logo opacity reduced to 85%
- Stitch texture overlay added
- Blue "Embroidery texture" badge appears top-left of canvas

**Print:**
- Logo at 95% opacity
- No texture overlay
- Clean, flat rendering

### 7e. Adjust Logo Size

- Set **Width (cm)** and **Height (cm)** fields (range: 0.5–50 cm)
- Logo on canvas resizes in real-time

### 7f. Export Mockup

1. Click **Download Mockup** below the canvas

**Expected behavior:**
- Canvas exported at 2× resolution (1000×1200 px) as PNG
- File downloads as `mockup-{styleId}-{placement}.png`
- Mockup also uploaded to Supabase Storage
- Toast: "Mockup exported and saved"

### 7g. Save / Edit / Delete Customizations

- **Save**: Click **Save Customization** — validates logo is selected, saves to `customizations` table
- **Edit**: Click **Edit** in the saved customizations table, modify, click **Update Customization**
- **Delete**: Click **Delete** in the table, confirms inline

---

## 8. Quote Request Management

### 8a. View Quotes List

1. Navigate to **Production → Quote Requests** (`/admin/quotes`)

**Expected behavior:**
- Search bar filters by customer name, email, or company
- Status dropdown filters by: All, New, Reviewed, Quoted, Accepted, Rejected, Converted
- Table shows: date, customer, company, product, quantity, status badge, quoted price, View button

### 8b. Create a New Quote Request

1. Click **New Quote Request**
2. Fill in the form:
   - **Customer Info**: Name (required), Email (required), Company, Phone
   - **Product**: Existing Style (optional dropdown) or free-text description, Quantity
   - **Variant Breakdown**: Dynamic rows — add size/color/qty lines
   - **Customization Preferences**: Placement, Technique, Pantone Color
   - **Customer Message**: Free-text textarea
3. Click **Create Quote Request**

### 8c. Review a Quote

1. Click **View** on any quote row
2. The detail page has a 3-column layout:

**Left column:**
- Customer details (name, email, company, phone)
- Customer message
- Variant breakdown

**Middle column:**
- Linked style or product description
- Style images (first 3)
- Base cost, lead time, material
- Quantity
- Customization preferences (placement, technique, pantone)
- Customer logo (if uploaded)

**Right column:**
- Price Calculator
- Quote response (quoted price + date)
- Internal notes
- Action buttons

### 8d. Use the Price Calculator

In the right column:

1. Enter **Unit Base Cost** (EUR)
2. Enter **Customization Fee** (EUR)
3. Enter **Margin %**
4. The breakdown calculates live: (unit + cust) × quantity, + margin = **Total**
5. Click **Apply as Quoted Price** to push the total into the Quoted Price field

### 8e. Change Quote Status

- Use the **status dropdown** in the top-right of the quote detail page
- Status options: New → Reviewed → Quoted → Accepted / Rejected → Converted
- Status badge updates color immediately

### 8f. Send Quote Email

1. Enter a quoted price (required — otherwise button is disabled)
2. Click **Send Quote Email**
3. The email modal opens with pre-filled:
   - Recipient: "Customer Name <email>"
   - Subject: "Quote for [Product] – [Company]"
   - Body: greeting, product details, total price, lead time estimate, signature
4. Edit the subject or body as needed
5. Choose:
   - **Copy to Clipboard** — copies the body text
   - **Open in Email Client** — opens a mailto: link in your default email app

**Expected behavior:**
- Button disabled if no quoted price has been set
- Escape key closes the modal

### 8g. Convert Quote to Style

1. On the quote detail page, click **Create Style from Quote**
2. A modal opens with:
   - Style Name (pre-filled from product name or company)
   - Concept + Category (required dropdowns)
   - Gender, Supplier (optional)
   - Base Cost (optional)
   - Checkboxes: Create variants from breakdown, Use customer logo, Create customization entry
3. Click **Create & Link to Quote**

**Expected behavior:**
- New Style created in the database
- Variants created from the quote's variant breakdown (if checked)
- Customization entry created (if checked)
- Quote status updated to "Converted"
- Emerald "converted" banner appears on the quote detail page with a link to the new style

---

## 9. Order Management

### 9a. View Orders

1. Navigate to **Production → Orders** (`/admin/orders`)

**Expected behavior:**
- List of all orders with status badges
- Active orders (confirmed/in_production/shipped) shown on Dashboard

### 9b. Create a New Order

1. Click **New Order** (or use the New Order modal)
2. Fill in order details
3. Save

### 9c. Track Order Status

Orders progress through: **Confirmed → In Production → Shipped → Delivered**

Update the status on the order detail page.

---

## 10. Views & Export

### 10a. Create a View

1. Navigate to **Views → All Views** (`/admin/views`)
2. Click **New View**
3. Configure across 4 tabs:
   - **Data Selection**: Which style attributes to display
   - **Data Management**: Filters, sort rules, group-by
   - **Display Options**: Gallery or Grid, items per row, image size, pagination
   - **View Settings**: Name, default flag, PDF export options

### 10b. Render a View

1. Click **Open** on any view card
2. The view renders styles in the configured layout with filters, sorting, and grouping applied

### 10c. Export View

1. From the rendered view, navigate to the export page
2. View the configured export settings

**Note:** PDF generation is not yet implemented — the page shows a placeholder message.

---

## 11. UX Features

### 11a. Keyboard Shortcuts

| Shortcut | Action | Where |
|----------|--------|-------|
| `Cmd/Ctrl + S` | Save current form | Style edit (Details tab), Logo detail, Supplier edit, Concept edit, Category edit |
| `Escape` | Close modal | Quick Add variant modal, Email Quote modal, Create Style from Quote modal |

**How to test:**
1. Open a style edit page (Details tab)
2. Make a change to any field
3. Press `Cmd + S` (Mac) or `Ctrl + S` (Windows/Linux)
4. Form should submit and show "Changes saved" toast

### 11b. Toast Notifications (Sonner)

| Action | Toast Type | Message Example |
|--------|------------|-----------------|
| Save success | Success | "Changes saved" |
| Delete success | Success | "Style archived" |
| Validation error | Error | "Please select a logo." |
| Server error | Error | (Supabase error message) |
| Login error | Error | "Invalid login credentials" |
| Export success | Success | "Mockup exported and saved" |
| Quote created | Success | "Quote request created" |

- Appear top-right corner
- Dark theme (bg-neutral-900, white text)
- Auto-dismiss after 3 seconds

### 11c. Loading States (Skeleton Loaders)

| Component | Where Used |
|-----------|-----------|
| `SkeletonCard` | Style cards, logo cards while loading |
| `SkeletonRow` | Supplier list, category rows |
| `SkeletonLogoCard` | Logo library grid |
| `SkeletonMetric` | Dashboard metric cards |
| `EmptyState` | Any list with zero items |

### 11d. Empty States

| Section | Empty State Message |
|---------|-------------------|
| Styles | "No styles yet — Create your first style..." |
| Suppliers | "No suppliers yet — Add your production partners..." |
| Logos | "No logos uploaded — Upload client logos..." |
| Views | "No views created yet — Views let you create custom..." |
| Customizations | "No customizations saved yet." |

### 11e. Responsive Design

- Dashboard: 3-column → 1-column grid
- Style list: multi-column → single column
- Style edit form: side-by-side → stacked layout
- Customization canvas + form: 2-column → stacked

---

## Quick Demo Script (5-Minute Version)

For a fast demo, follow this abbreviated flow:

1. **Login** → Show the login page, enter credentials
2. **Dashboard** → Point out the styles metrics, production metrics, and recent quotes table
3. **Create a Concept** → Quick concept with one category
4. **Create a Style** → Fill in key fields, upload 2 images, save
5. **Add Variants** → Use bulk Quick Add (S, M, L × 2 colors)
6. **Upload a Logo** → Upload a PNG logo
7. **Mockup** → Open style → Customization tab → select logo → pick placement → toggle embroidery → download mockup
8. **Quote Flow** → Create a quote request → open it → use price calculator → send quote email
9. **Show UX** → Trigger a toast, show keyboard save, show empty state on Factories

---

## Appendix: Demo Data Suggestions

### Sample Concept
- **Name:** "Spring/Summer 2025"
- **Slug:** `spring-summer-2025`

### Sample Categories
- "Shirts" → under Spring/Summer 2025
- "Outerwear" → under Spring/Summer 2025

### Sample Style
- **Name:** "Premium Oxford Shirt"
- **Concept:** Spring/Summer 2025
- **Category:** Shirts
- **Gender:** Men's
- **Material:** 100% Egyptian Cotton
- **Base Cost:** €45.00
- **Collection Type:** Signature

### Sample Supplier
- **Name:** "TextilePro Milano"
- **Email:** info@textilepro.it
- **MOQ:** 100
- **Lead Time:** 21 days
- **Location:** Milan, Italy

### Sample Logo
- **Company:** "Acme Corp"
- **File:** Any PNG or SVG logo (square format works best)

### Sample Quote Request
- **Customer:** "John Doe", john@acme.com
- **Company:** "Acme Corp"
- **Style:** Premium Oxford Shirt
- **Quantity:** 100
- **Variant Breakdown:** M/Black ×50, L/White ×30, XL/Navy ×20
- **Customization:** Center Front, Embroidery, Pantone 286 C
