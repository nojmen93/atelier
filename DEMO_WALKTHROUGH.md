# Atelier Admin — Demo Walkthrough

A step-by-step guide to showcasing every feature of the Atelier Admin panel. Follow the sections in order for a complete demo, or jump to any section independently.

**App URL:** `http://localhost:3000`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Dashboard Overview](#2-dashboard-overview)
3. [Style Management](#3-style-management-products)
4. [Supplier Management](#4-supplier-management)
5. [Concept & Category Management](#5-concept--category-management)
6. [Logo Library](#6-logo-library)
7. [Customization Engine](#7-customization-engine--mockup-generator)
8. [Views & Export](#8-views--export)
9. [UX Features](#9-ux-features)

---

## 1. Authentication

### Login with Demo Credentials

1. Navigate to `http://localhost:3000/login`
2. Enter your admin email and password
3. Click **Login**

**Expected behavior:**
- Login form shows centered on a black background with "Atelier Admin" heading
- On success: redirects to `/admin` (Dashboard)
- On failure: a toast notification appears in the top-right corner with the error message (e.g., "Invalid login credentials")
- Loading state: button text changes to "Loading..." while authenticating

<!-- Screenshot: Login page -->
> 📸 `[Screenshot: Login page with email/password fields]`

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

### Metric Cards

The dashboard displays 4 metric cards in a responsive grid:

| Card            | What It Tracks                                    |
|-----------------|---------------------------------------------------|
| **Total Styles** | Count of all styles in the database               |
| **Active Styles** | Count of styles with `status = 'active'`          |
| **Concepts**     | Count of all concepts (collections/product lines)  |
| **Suppliers**    | Count of all registered suppliers                  |

**Expected behavior:**
- Cards display large numeric values with descriptive labels
- Data is fetched server-side (no loading spinner needed)
- Cards are arranged in a 4-column grid on desktop, single column on mobile

<!-- Screenshot: Dashboard -->
> 📸 `[Screenshot: Dashboard with 4 metric cards]`

### Navigation Bar

The top nav bar includes links to:
- **Dashboard** — `/admin`
- **Styles** — `/admin/styles`
- **Concepts** — `/admin/concepts`
- **Suppliers** — `/admin/suppliers`
- **Logos** — `/admin/logos`
- **Views** — `/admin/views`

---

## 3. Style Management (Products)

> **Note:** In Atelier, products are called "Styles." The `/admin/products` route redirects to `/admin/styles`.

### 3a. Create a New Style

1. Navigate to **Styles** (`/admin/styles`)
2. Click **New Style** (top-right button)
3. Fill in the form:

| Field                | Example Value                  | Required |
|----------------------|--------------------------------|----------|
| Style Name           | "Premium Oxford Shirt"         | Yes      |
| Concept              | (select from dropdown)         | Yes      |
| Category             | (populates after concept)      | Yes      |
| Gender               | "Men's"                        | Yes      |
| Collection Type      | "Signature"                    | Yes      |
| Product Capability   | "Simple Customizable"          | Yes      |
| Status               | "Development"                  | No       |
| Description          | "A premium oxford..."          | No       |
| Material             | "100% Egyptian Cotton"         | No       |
| Base Supplier        | (select from dropdown)         | No       |
| Base Cost (EUR)      | "45.00"                        | No       |
| Lead Time (days)     | "21"                           | No       |
| Customization Mode   | "logo placement, embroidery"   | No       |

4. Click **Create Style**

**Expected behavior:**
- Concept dropdown loads all concepts
- Category dropdown is disabled until a concept is selected; then shows that concept's categories
- Toast notification: "Style created" on success
- Redirects back to styles list

<!-- Screenshot: New Style form -->
> 📸 `[Screenshot: New style form with all fields]`

### 3b. Upload Multiple Images

1. On the style edit page, scroll to the **Images** section
2. Click the upload area or drag files
3. Upload multiple JPG/PNG/WebP images (max 5MB each)

**Expected behavior:**
- Progress indicator shows during upload
- Images appear as thumbnails after upload
- First image is marked as primary

> 📸 `[Screenshot: Image upload area with multiple thumbnails]`

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
5. Review the size x color matrix with auto-generated SKUs

**Expected behavior:**
- SKUs auto-generated from style name + size + color (e.g., `PREMIUM-OXFORD-M-NAVY`)
- Bulk creation generates all combinations at once
- Variants display in a table with inline editing
- Toast notifications on save/delete

> 📸 `[Screenshot: Variant table with bulk creation modal]`

### 3e. Drag to Reorder Styles

1. Go to **Styles** list (`/admin/styles`)
2. Grab the drag handle (6-dot grip icon) on any style card
3. Drag to a new position
4. Release

**Expected behavior:**
- Opacity reduction on the dragged item
- Overlay follows cursor during drag
- 8px activation distance prevents accidental drags
- Order saved to database immediately on drop
- Uses @dnd-kit/sortable for smooth animations

### 3f. Edit Style

1. Click any style card in the list
2. Modify any fields
3. Click **Save Changes** or press `Cmd/Ctrl + S`

**Expected behavior:**
- All existing data pre-populated
- Keyboard shortcut (`Cmd+S` / `Ctrl+S`) triggers save
- Toast: "Changes saved"
- Redirects to styles list

### 3g. Status Toggle (Development / Active / Archived)

1. On the style edit page, use the **status dropdown** in the top-right
2. Switch between: Development, Active, Archived

**Expected behavior:**
- Status badge changes color:
  - **Active** — green
  - **Development** — yellow
  - **Archived** — red
- Archived styles are hidden from the main styles list (soft delete)

### 3h. Archive Style (Soft Delete)

1. On the style edit page, click **Archive** (red button at bottom)
2. Confirmation prompt appears: "Archive this style?"
3. Click **Yes, Archive**

**Expected behavior:**
- Style is not permanently deleted — status is set to `archived`
- Toast: "Style archived"
- Redirects to styles list
- Style no longer appears in the list (filtered by `status != 'archived'`)

---

## 4. Supplier Management

### 4a. Create Supplier

1. Navigate to **Suppliers** (`/admin/suppliers`)
2. Click **New Supplier**
3. Fill in:

| Field               | Example Value            |
|---------------------|--------------------------|
| Name                | "TextilePro Milano"      |
| Contact Email       | "info@textilepro.it"     |
| MOQ                 | 100                      |
| Lead Time (days)    | 21                       |
| Production Location | "Milan, Italy"           |

4. Click **Save**

**Expected behavior:**
- Form validates required fields (name)
- Toast notification on success
- Redirects to suppliers list
- Empty state shown if no suppliers exist (with icon and CTA)

> 📸 `[Screenshot: Supplier list showing card layout]`

### 4b. Edit Supplier

1. Click any supplier card in the list
2. Modify fields
3. Click **Save Changes**

**Expected behavior:**
- Pre-populated form with existing data
- Delete with confirmation dialog
- Toast notifications for save/delete

### 4c. Supplier Linked to Styles

1. When editing a style, the **Base Supplier** dropdown lists all suppliers
2. Select a supplier to link it to the style

**Expected behavior:**
- Supplier dropdown shows all available suppliers
- Optional field — can be set to "None"

---

## 5. Concept & Category Management

> **Note:** The system uses a two-level hierarchy: **Concepts** contain **Categories**.

### 5a. Create Concept

1. Navigate to **Concepts** (`/admin/concepts`)
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
- Categories inherit concept-level defaults (MOQ, supplier, lead time)

### 5c. Drag to Reorder Concepts

1. On the **Concepts** list page
2. Grab the drag handle on any concept
3. Drag to reorder

**Expected behavior:**
- Same drag-and-drop behavior as styles
- Display order saved immediately to database
- Uses @dnd-kit with 8px activation distance

### 5d. Cascading to Styles

When assigning a style to a concept + category:
1. Select a concept in the style form — this loads that concept's categories
2. Select a category — the category may have default MOQ, supplier, and lead time

**Expected behavior:**
- Changing the concept clears the selected category
- Category defaults can auto-fill style fields

---

## 6. Logo Library

### 6a. Upload Logo

1. Navigate to **Logos** (`/admin/logos`)
2. Click **Upload New Logo**
3. Enter company name (e.g., "Acme Corp")
4. Click the upload area and select a file

| Supported Formats | Max Size |
|-------------------|----------|
| SVG, PNG, AI, EPS | 10 MB    |

**Expected behavior:**
- File validation: checks extension and size on both client and server
- **SVG/PNG:** Shows live preview after selection, extracts dimensions automatically
- **AI/EPS:** Shows format label instead of preview ("Preview not available for this format")
- Upload progress bar animates from 0% to 100%
- Redirects to logos list on success

> 📸 `[Screenshot: Logo upload with preview and dimensions]`

### 6b. View Logo Details

1. Click any logo card in the grid
2. View the detail page

**Details shown:**
- Large logo preview (for SVG/PNG)
- Format badge (SVG, PNG, AI, EPS)
- Dimensions (width x height in pixels, if available)
- Upload date
- Direct file URL link
- Edit company name field
- Delete with confirmation

> 📸 `[Screenshot: Logo detail page showing metadata]`

### 6c. Metadata Extraction

The upload API automatically extracts metadata:

| Format | Extraction Method                      |
|--------|----------------------------------------|
| PNG    | `sharp` library reads image metadata   |
| SVG    | Regex parses `width`/`height`/`viewBox` attributes |
| AI/EPS | No dimensions extracted                |

---

## 7. Customization Engine & Mockup Generator

> This is the most complex feature. It uses **Fabric.js** for interactive canvas-based mockup generation.

### 7a. Open Customization Tab

1. Navigate to **Styles** → click a style that has images
2. Click the **Customization** tab (third tab after Details, Variants)

**Expected behavior:**
- If the style has no images, a message says: "Add product images first to enable customization"
- If images exist, the Fabric.js canvas loads with the first image as background

> 📸 `[Screenshot: Customization tab with canvas and form]`

### 7b. Select a Logo

1. In the form on the right side, select a logo from the dropdown
2. The logo appears on the canvas at the default placement position

**Expected behavior:**
- Dropdown shows: company name + format (e.g., "Acme Corp (PNG)")
- If no logos exist, a message links to "Upload a logo"
- SVG/PNG logos render as actual images on canvas
- AI/EPS logos show a labeled placeholder box on canvas

### 7c. Choose Placement (5 Positions)

Use the **Placement** dropdown to select from:

| Placement               | Canvas Position     | Description                    |
|--------------------------|---------------------|--------------------------------|
| Center Front             | Center-top area     | Standard chest placement       |
| Center Back              | Center-top area     | Back print/embroidery          |
| From HSP                 | Upper-right area    | High Shoulder Point placement  |
| Center on WRS            | Right-center area   | Waist Right Seam              |
| Center on WLS            | Left-center area    | Waist Left Seam               |

**Expected behavior:**
- Logo repositions on canvas instantly when placement changes
- Placement label shows in bottom-left corner of canvas
- Logo is selectable and can be manually dragged to fine-tune position

### 7d. Switch Between Embroidery and Print

1. Click **Embroidery** or **Print** toggle buttons

**Expected behavior:**
- **Embroidery** (blue):
  - Logo opacity reduced to 85%
  - Stitch texture overlay added (shadow effect simulating raised thread)
  - Blue "Embroidery texture" badge appears top-left of canvas
  - Hint text: "Stitch texture and raised effect applied to preview"
- **Print** (purple):
  - Logo at 95% opacity
  - No texture overlay
  - Clean, flat rendering

### 7e. Adjust Logo Size

1. Set **Width (cm)** and **Height (cm)** fields
2. Range: 0.5 cm to 50 cm, step 0.1

**Expected behavior:**
- Logo on canvas resizes in real-time as values change
- Size is proportionally mapped to canvas dimensions
- Minimum 30px, maximum 200px on canvas

### 7f. Drag Logo on Canvas

1. Click the logo on the canvas
2. Drag it to any position

**Expected behavior:**
- Logo is selectable (shows border when selected)
- Free dragging within canvas bounds
- No resize handles (controlled via width/height inputs)
- Embroidery overlay follows the logo position

### 7g. Zoom Controls

1. Use the **+** / **-** buttons in the bottom-right of the canvas
2. Click the percentage to reset to 100%

**Expected behavior:**
- Zoom range: 50% to 200%
- Smooth CSS transition on zoom
- Displays current zoom percentage

### 7h. Switch Product Image Views

If the style has multiple images:
1. Click **Front**, **Back**, **Detail** tabs above the canvas

**Expected behavior:**
- Background image swaps to selected view
- Logo position is maintained across views
- Labels auto-assigned: "Front", "Back", "Detail", then "View 4", "View 5", etc.

### 7i. Save Customization

1. Fill in all fields (logo, placement, technique, optional pantone color and size)
2. Click **Save Customization**

**Expected behavior:**
- Validates that a logo is selected (shows error toast if missing)
- Saves to `customizations` table in Supabase
- Toast: "Customization saved"
- Form resets
- New row appears in the Saved Customizations table below

### 7j. Edit Existing Customization

1. In the **Saved Customizations** table, click **Edit** on any row
2. Form populates with that customization's data
3. Modify and click **Update Customization**

**Expected behavior:**
- Button changes to "Update Customization"
- Cancel button appears to abort edit
- Toast: "Customization updated"

### 7k. Export Mockup

1. Click **Download Mockup** below the canvas

**Expected behavior:**
- Canvas is exported at 2x resolution (1000x1200 px) as PNG
- File automatically downloads to your computer as `mockup-{styleId}-{placement}.png`
- Mockup is also uploaded to Supabase Storage under `mockups/{styleId}/`
- If editing an existing customization, the `mockup_url` is saved to the record
- Toast: "Mockup exported and saved"
- On storage upload failure: "Download complete, but storage upload failed"

> 📸 `[Screenshot: Exported mockup PNG file]`

### 7l. Saved Customizations Table

The table below the editor shows all saved customizations:

| Column    | Content                                    |
|-----------|--------------------------------------------|
| Logo      | Logo thumbnail + company name              |
| Placement | Human-readable placement label             |
| Technique | Color-coded badge (blue for embroidery, purple for print) |
| Color     | Pantone color reference                    |
| Size      | Width x height in cm                       |
| Actions   | Edit / Delete buttons                      |

**Expected behavior:**
- Loading state: animated skeleton placeholders while fetching
- Empty state: "No customizations saved yet."
- Delete removes row with confirmation (inline, not modal)
- Toast: "Customization deleted"

---

## 8. Views & Export

### 8a. Create a View

1. Navigate to **Views** (`/admin/views`)
2. Click **New View**
3. Configure:
   - View name
   - Type: Gallery or Grid
   - Select which attributes to display
   - Add filters (optional)
   - Set as default (optional)

### 8b. Render a View

1. Click **Open** on any view card
2. The view renders styles in the configured layout

### 8c. Export View

1. From the rendered view, navigate to the export page
2. View the export settings configured in the view builder

**Expected behavior:**
- Export page shows configured settings: page size, header text, include images, include header
- Shows count of selected styles
- **Note:** PDF generation is not yet implemented — the page displays a placeholder message
- Gallery views show large images with overlaid attributes
- Grid views show tabular data
- Filters narrow down which styles appear

> 📸 `[Screenshot: View rendered in gallery mode]`

---

## 9. UX Features

### 9a. Loading States (Skeleton Loaders)

Navigate to any page to observe loading states:

| Component          | Where Used                                  |
|--------------------|---------------------------------------------|
| `SkeletonCard`     | Style cards, logo cards while loading       |
| `SkeletonRow`      | Supplier list, category rows               |
| `SkeletonLogoCard` | Logo library grid                          |
| `SkeletonMetric`   | Dashboard metric cards                     |
| `EmptyState`       | Any list with zero items                   |

**Expected behavior:**
- Animated pulse effect (opacity shimmer)
- Matches the shape of actual content
- Transitions smoothly to real content once loaded

> 📸 `[Screenshot: Skeleton loading state on styles page]`

### 9b. Toast Notifications (Sonner)

Toast notifications appear for all user actions:

| Action              | Toast Type | Message Example             |
|---------------------|------------|-----------------------------|
| Save success        | Success    | "Changes saved"             |
| Delete success      | Success    | "Style archived"            |
| Validation error    | Error      | "Please select a logo."     |
| Server error        | Error      | (Supabase error message)    |
| Login error         | Error      | "Invalid login credentials" |
| Export success      | Success    | "Mockup exported and saved" |

**Expected behavior:**
- Appear in top-right corner
- Dark theme styling matching the app (bg-neutral-900, white text)
- Auto-dismiss after 3 seconds
- Stack vertically if multiple toasts fire

> 📸 `[Screenshot: Toast notification example]`

### 9c. Error Handling

1. Try submitting a form with invalid data
2. Try an action when the network is down

**Expected behavior:**
- Server errors display the Supabase error message in a toast
- Form validation prevents submission of incomplete required fields
- Upload errors show specific messages (file type, file size)
- Inline error banners for upload forms (red background with border)

### 9d. Keyboard Shortcuts

| Shortcut          | Action              | Where                                                    |
|-------------------|---------------------|----------------------------------------------------------|
| `Cmd/Ctrl + S`    | Save current form   | Style edit, Logo detail, Supplier edit, Concept edit, Category edit |
| `Escape`          | Close modal/dialog  | Quick Add variant modal                                  |

**How to test:**
1. Open a style edit page (Details tab)
2. Make a change to any field
3. Press `Cmd + S` (Mac) or `Ctrl + S` (Windows/Linux)
4. Form should submit and show "Changes saved" toast

**Expected behavior:**
- Browser's default save dialog is prevented (`e.preventDefault()`)
- Works on both Mac (metaKey) and Windows/Linux (ctrlKey)
- Only triggers on the Details tab (not Variants or Customization)

### 9e. Empty States

Visit any section with no data to see styled empty states:

| Section    | Empty State Message                                          |
|------------|--------------------------------------------------------------|
| Styles     | "No styles yet — Create your first style..."                |
| Suppliers  | "No suppliers yet — Add your production partners..."        |
| Logos      | "No logos uploaded — Upload client logos..."                 |
| Views      | "No views created yet — Views let you create custom..."     |
| Customizations | "No customizations saved yet."                          |

**Expected behavior:**
- Centered layout with icon, title, description, and CTA button
- Dashed border styling
- CTA links directly to creation page

> 📸 `[Screenshot: Empty state for styles page]`

### 9f. Responsive Design

1. Resize the browser window or use device emulation

**Expected behavior:**
- Dashboard: 4-column → 1-column grid
- Style list: multi-column → single column
- Style edit form: side-by-side → stacked layout
- Customization canvas + form: 2-column → stacked
- Navigation: always visible (horizontal scroll on small screens)

---

## Quick Demo Script (5-Minute Version)

For a fast demo, follow this abbreviated flow:

1. **Login** → Show the login page, enter credentials
2. **Dashboard** → Point out the 4 metrics
3. **Create a Concept** → Quick concept with one category
4. **Create a Style** → Fill in key fields, upload 2 images, save
5. **Add Variants** → Use bulk add (S, M, L x 2 colors)
6. **Upload a Logo** → Upload a PNG logo
7. **Customization** → Open style → Customization tab → select logo → pick placement → toggle embroidery → download mockup
8. **Show UX** → Trigger a toast, show keyboard save, show empty state on Suppliers

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
