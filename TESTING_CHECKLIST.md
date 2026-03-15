# Atelier Admin — Testing Checklist

Comprehensive testing checklist for all features. Use this before releases, after major changes, or for QA walkthroughs.

---

## Authentication

### Login
- [ ] Enter valid email + password → redirects to `/admin`
- [ ] Enter invalid credentials → error toast appears ("Invalid login credentials")
- [ ] Submit with empty email → browser validation prevents submit
- [ ] Submit with empty password → browser validation prevents submit
- [ ] Button shows "Loading..." while authenticating
- [ ] Button is disabled while loading (prevents double-submit)

**Common issues:**
- Supabase auth not configured → "Invalid API key" error
- Email auth not enabled in Supabase dashboard

### Protected Routes
- [ ] Navigate to `/admin` while logged out → redirects to `/login`
- [ ] Navigate to `/admin/styles` while logged out → redirects to `/login`
- [ ] Navigate to `/admin/logos` while logged out → redirects to `/login`
- [ ] Navigate to `/admin/quotes` while logged out → redirects to `/login`
- [ ] No flash of protected content before redirect

**Common issues:**
- Server-side Supabase client not configured (missing env vars)
- Cookie not set properly (check `@supabase/ssr` setup)

### Sign Out
- [ ] "Sign Out" button appears in sidebar footer
- [ ] Clicking Sign Out ends the session
- [ ] After sign out, visiting `/admin` redirects to `/login`

---

## Navigation (Sidebar)

- [ ] Sidebar visible on all `/admin/*` pages
- [ ] "Atelier" brand link in sidebar header navigates to `/admin`
- [ ] **Dashboard** direct link works → `/admin`
- [ ] **Product** section expands/collapses on click
  - [ ] Hierarchy → `/admin/styles/hierarchy`
  - [ ] Product → `/admin/styles`
  - [ ] Colour Library → `/admin/styles/colours`
  - [ ] Specification → `/admin/styles/specification`
- [ ] **Production** section expands/collapses
  - [ ] Quote Requests → `/admin/quotes`
  - [ ] Orders → `/admin/orders`
  - [ ] Suppliers → `/admin/suppliers`
  - [ ] Factories → `/admin/factories`
- [ ] **Logos** section expands/collapses
  - [ ] Logo Library → `/admin/logos`
  - [ ] Upload Logo → `/admin/logos/new`
  - [ ] Mockup Generator → `/admin/mockup`
- [ ] **Views** section expands/collapses
  - [ ] All Views → `/admin/views`
  - [ ] New View → `/admin/views/new`
- [ ] **Settings** link in footer → `/admin/settings`
- [ ] Active page highlighted (white text + neutral-900 bg for direct links)
- [ ] Active section auto-expands on page load

---

## Dashboard

- [ ] "Dashboard" heading visible
- [ ] **Styles section** (3 cards): Total Styles, Active Styles, Concepts
- [ ] Total Styles card links to `/admin/styles`
- [ ] **Production section** (3 cards): Suppliers, Active Orders (blue), Pending Quotes (blue)
- [ ] Active Orders card links to `/admin/orders`
- [ ] Pending Quotes card links to `/admin/quotes`
- [ ] **Quote Requests section** (4 cards): Pending Review, Total Quotes, Accepted/Converted, Conversion Rate
- [ ] Pending Review card links to `/admin/quotes`
- [ ] Accepted/Converted count shown in green
- [ ] Conversion Rate calculated correctly (accepted ÷ quoted × 100)
- [ ] **Recent Quotes table** shows last 5 quotes (when quotes exist)
  - [ ] Columns: date, customer name, company, product, quantity, status badge, View link
  - [ ] "View all →" link navigates to `/admin/quotes`
  - [ ] Status badges color-coded correctly
  - [ ] Table hidden when no quotes exist

---

## Styles (CRUD)

### List Page (`/admin/styles`)
- [ ] Displays all non-archived styles
- [ ] Archived styles (`status = 'archived'`) are hidden
- [ ] Empty state shown when no styles exist (icon + CTA)
- [ ] Each card shows: name, status badge, concept/category, variant count
- [ ] "New Style" button links to `/admin/styles/new`

### Create Style (`/admin/styles/new`)
- [ ] All required fields enforced: name, concept, category, gender, collection type, product capability
- [ ] Concept dropdown loads all concepts from database
- [ ] Category dropdown is disabled until concept is selected
- [ ] Selecting a concept populates its categories in the category dropdown
- [ ] Changing concept clears the selected category
- [ ] Gender options: Men's, Women's, Unisex, N/A
- [ ] Collection type options: Editorial, Signature, Foundation, Special Projects
- [ ] Product capability options: None, Simple Customizable, Quote Only, Both
- [ ] Status options: Development, Active, Archived
- [ ] Optional fields accept empty values
- [ ] Save button shows "Saving..." while submitting
- [ ] Success toast on save
- [ ] Redirects to `/admin/styles` after save

### Edit Style (`/admin/styles/[id]`)
- [ ] All fields pre-populated with existing data
- [ ] Three tabs visible: Details, Variants, Customization
- [ ] Tab switching works without losing form data
- [ ] Status dropdown in top-right shows color-coded badge
  - [ ] Active → green
  - [ ] Development → yellow
  - [ ] Archived → red/neutral
- [ ] `Cmd/Ctrl + S` triggers save (Details tab only)
- [ ] Save shows success toast

### Images
- [ ] Upload area visible in the Details tab
- [ ] Accepts JPG, PNG, WebP files
- [ ] Rejects files over 5 MB
- [ ] Rejects invalid file types
- [ ] Multiple files can be uploaded
- [ ] Progress indicator visible during upload
- [ ] Thumbnails appear after upload
- [ ] Drag to reorder images works
- [ ] Image order persists after save

### Variants Tab
- [ ] "Add Variant" creates a new row in the table
- [ ] Can edit: size, color, SKU, stock, price modifier
- [ ] Can delete a variant (inline confirm)
- [ ] "Quick Add" opens the bulk creation modal
- [ ] Bulk modal: checkboxes for sizes (XS through XXL)
- [ ] Bulk modal: color presets + custom color input
- [ ] SKUs auto-generated from style name + size + color
- [ ] Pressing Escape closes the Quick Add modal
- [ ] Generated variants appear in the table

### Archive (Soft Delete)
- [ ] Click "Archive" button at bottom of edit form
- [ ] Confirmation prompt appears
- [ ] Confirming sets status to `archived`
- [ ] "Cancel" dismisses the confirmation
- [ ] Toast: "Style archived"
- [ ] Style disappears from list (filtered out)
- [ ] Style data still exists in database (not hard deleted)

### Drag-and-Drop Reorder
- [ ] Drag handle (6-dot icon) visible on each style card
- [ ] Clicking without dragging (< 8px movement) does not trigger reorder
- [ ] Dragging shows opacity change on source item
- [ ] Drop saves new order immediately to database
- [ ] Page refresh maintains the new order

---

## Suppliers

### List Page (`/admin/suppliers`)
- [ ] Displays all suppliers
- [ ] Each card shows: name, MOQ, lead time, location, contact email
- [ ] Empty state with icon and "Add First Supplier" CTA
- [ ] Clicking a supplier card navigates to edit page

### Create Supplier (`/admin/suppliers/new`)
- [ ] Name is required
- [ ] Optional fields: contact email, MOQ, lead time, location
- [ ] Save success → toast + redirect to list

### Edit Supplier (`/admin/suppliers/[id]`)
- [ ] All fields pre-populated
- [ ] Can update any field
- [ ] Delete with confirmation dialog
- [ ] Toast notifications on save/delete

---

## Factories

### List Page (`/admin/factories`)
- [ ] Displays all factories
- [ ] Empty state shown when none exist
- [ ] Clicking a factory navigates to edit page

### Create/Edit Factory
- [ ] Name is required
- [ ] Save success → toast + redirect to list
- [ ] Delete with confirmation

---

## Concepts & Categories

### Concepts List (`/admin/concepts`)
- [ ] Displays concepts with drag-and-drop ordering
- [ ] Each concept shows its categories inline
- [ ] "New Concept" button works

### Create Concept (`/admin/concepts/new`)
- [ ] Name field required
- [ ] Slug auto-generated from name
- [ ] Description optional
- [ ] Save redirects to concepts list

### Edit Concept (`/admin/concepts/[id]`)
- [ ] Name and description editable
- [ ] Categories section shows linked categories
- [ ] "New Category" button links to category creation page
- [ ] Delete concept with confirmation
- [ ] Deleting concept may cascade to categories

### Create Category (`/admin/concepts/[id]/categories/new`)
- [ ] Name required
- [ ] Slug auto-generated
- [ ] Category linked to parent concept
- [ ] Save redirects to concept edit page

### Drag-and-Drop (Concepts)
- [ ] Concepts can be reordered via drag handles
- [ ] Order persists in database
- [ ] 8px activation distance

---

## Logos

### Logo List (`/admin/logos`)
- [ ] Grid layout (2–4 columns responsive)
- [ ] PNG/SVG logos show image preview
- [ ] AI/EPS logos show format label ("Preview not available")
- [ ] Each card shows: company name, format badge, dimensions
- [ ] Empty state with "Upload First Logo" CTA
- [ ] Clicking card navigates to detail page

### Upload Logo (`/admin/logos/new`)
- [ ] Company name required
- [ ] File input accepts: .svg, .ai, .eps, .png
- [ ] File size limit: 10 MB
- [ ] Invalid file type → inline error message
- [ ] File too large → inline error message
- [ ] PNG/SVG: shows live preview after file selection
- [ ] PNG/SVG: extracts and displays dimensions
- [ ] AI/EPS: shows format label, no preview
- [ ] Upload progress bar animates
- [ ] Upload button disabled while uploading
- [ ] Success → redirects to logos list
- [ ] Server validates: auth, file type, file size
- [ ] Server extracts dimensions:
  - [ ] PNG → via `sharp` library
  - [ ] SVG → via regex on width/height/viewBox attributes

### Logo Detail (`/admin/logos/[id]`)
- [ ] Large preview (PNG/SVG) or format label (AI/EPS)
- [ ] Metadata grid: format, dimensions, upload date, file URL link
- [ ] File URL link opens in new tab
- [ ] Company name editable
- [ ] `Cmd/Ctrl + S` triggers save
- [ ] Save → toast: "Changes saved"
- [ ] Delete button → confirmation dialog
- [ ] Delete → toast: "Logo deleted" + redirect

---

## Mockup Generator (Customization)

### Prerequisites
- [ ] Style must have at least one image uploaded (for in-style tab)
- [ ] At least one logo must exist in the Logo Library

### Canvas Initialization
- [ ] Canvas loads with product image as background (500×600 px)
- [ ] Black background when no image loaded
- [ ] If no images (in-style tab): shows "Add product images first" message

### Image View Switching
- [ ] Multiple images → tabs appear: "Front", "Back", "Detail", "View 4"...
- [ ] Clicking tab switches background image
- [ ] Active tab highlighted

### Logo Selection
- [ ] Dropdown lists all logos: "Company Name (FORMAT)"
- [ ] No logos → shows link to upload page
- [ ] Selecting PNG/SVG logo → renders on canvas
- [ ] Selecting AI/EPS logo → renders labeled placeholder box
- [ ] No logo selected → dashed placeholder rectangle on canvas
- [ ] Changing logo updates canvas immediately

### Placement
- [ ] 5 placements available in dropdown
- [ ] Changing placement repositions logo on canvas
- [ ] Placement label shown in bottom-left corner of canvas

### Technique
- [ ] Two toggle buttons: Embroidery (blue), Print (purple)
- [ ] Embroidery: logo opacity 85%, shadow overlay, blue badge top-left
- [ ] Print: logo opacity 95%, no overlay, no badge

### Size Controls
- [ ] Width (cm) input: range 0.5–50, step 0.1
- [ ] Height (cm) input: range 0.5–50, step 0.1
- [ ] Changing values updates logo size on canvas in real-time

### Canvas Interaction
- [ ] Logo is selectable (click shows border)
- [ ] Logo can be dragged to new position
- [ ] Background image is NOT selectable/draggable

### Zoom
- [ ] "+" button increases zoom (max 200%)
- [ ] "−" button decreases zoom (min 50%)
- [ ] Percentage button resets to 100%

### Save Customization
- [ ] "Save Customization" requires logo selection
- [ ] Missing logo → error toast: "Please select a logo."
- [ ] Success toast: "Customization saved"
- [ ] Form resets after save
- [ ] New row appears in saved customizations table

### Edit / Delete Customization
- [ ] Click "Edit" → form populates with saved data, button changes to "Update Customization"
- [ ] "Cancel" resets the form
- [ ] Update success → toast: "Customization updated"
- [ ] Click "Delete" → row removes, toast: "Customization deleted"

### Export Mockup
- [ ] "Download Mockup" button below canvas
- [ ] PNG file downloads (1000×1200 px, 2× resolution)
- [ ] Filename: `mockup-{styleId}-{placement}.png`
- [ ] Mockup uploaded to Supabase Storage
- [ ] Success toast: "Mockup exported and saved"
- [ ] Storage failure: "Download complete, but storage upload failed"

---

## Quote Requests

### List Page (`/admin/quotes`)
- [ ] Table displays all quote requests
- [ ] Columns: date, customer name + email, company, product, quantity, status badge, quoted price, View button
- [ ] Search input filters by name, email, or company
- [ ] Status dropdown filters by: All Statuses, New, Reviewed, Quoted, Accepted, Rejected, Converted
- [ ] Results count updates based on active filters
- [ ] "No quotes match your filters." shown when filter returns nothing
- [ ] "New Quote Request" button links to `/admin/quotes/new`
- [ ] Empty state shown when no quotes exist

### Status Badge Colors
- [ ] New → blue
- [ ] Reviewed → yellow
- [ ] Quoted → purple
- [ ] Accepted → green
- [ ] Rejected → red
- [ ] Converted → emerald

### Create Quote Request (`/admin/quotes/new`)
- [ ] Customer Name required
- [ ] Customer Email required
- [ ] Company, Phone — optional
- [ ] Style dropdown — optional (links to existing style)
- [ ] Product Description — optional free text
- [ ] Quantity — number input
- [ ] Variant Breakdown — dynamic rows (size/color/qty); "Add line" adds rows; delete removes rows
- [ ] Placement dropdown — 5 options (Center Front, Center Back, From HSP, Center on WRS, Center on WLS)
- [ ] Technique dropdown — Embroidery, Print
- [ ] Pantone Color — optional text input
- [ ] Customer Message — optional textarea
- [ ] Submit button shows "Creating..." while saving
- [ ] Success → toast + redirect to quote detail
- [ ] Back link navigates to `/admin/quotes`

### Quote Detail (`/admin/quotes/[id]`)
- [ ] Status dropdown in top-right changes status
- [ ] Submission date shown in header
- [ ] Converted banner (emerald) shown if status is "converted", with link to the created style
- [ ] **Left column:** customer info, message, variant breakdown all displayed
- [ ] **Middle column:** linked style name (link to style edit), style images, base cost, lead time, material, quantity, customization prefs, customer logo
- [ ] **Right column:** price calculator, quote response, internal notes, action buttons
- [ ] "Save Changes" saves quoted price, notes, status → toast: "Changes saved"

### Price Calculator
- [ ] Unit Base Cost input (EUR)
- [ ] Customization Fee input (EUR)
- [ ] Margin % input
- [ ] Breakdown updates live as values change:
  - [ ] Shows unit + cust
  - [ ] Shows × quantity
  - [ ] Shows subtotal
  - [ ] Shows + margin amount
  - [ ] Shows total in large text
- [ ] "Apply as Quoted Price" pushes total to Quoted Price field

### Email Quote Modal
- [ ] "Send Quote Email" button is **disabled** if no quoted price is set
- [ ] Clicking "Send Quote Email" opens the email modal
- [ ] Recipient shown as "Name <email>" (read-only)
- [ ] Subject pre-filled: "Quote for [Product] – [Company]" (editable)
- [ ] Body pre-filled with template (editable textarea)
- [ ] "Copy to Clipboard" copies body text
- [ ] "Open in Email Client" opens mailto: link
- [ ] Cancel closes modal
- [ ] Escape key closes modal

### Convert Quote to Style (Create Style from Quote Modal)
- [ ] "Create Style from Quote" button visible when quote is not already converted
- [ ] Modal opens with Style Name pre-filled
- [ ] Concept dropdown required (empty until selected)
- [ ] Category dropdown required (populates after concept selected)
- [ ] Gender defaults to "Unisex"
- [ ] "Create variants" checkbox shows variant breakdown pills
- [ ] "Use customer logo" checkbox visible if quote has logo
- [ ] "Create customization entry" checkbox shows placement/technique from quote
- [ ] Logo selector dropdown appears when customization checkbox is checked
- [ ] "Create & Link to Quote" button disabled until concept + category selected
- [ ] On success:
  - [ ] New style created in database
  - [ ] Variants created (if checked)
  - [ ] Customization created (if checked)
  - [ ] Quote status updated to "Converted"
  - [ ] Converted banner appears on quote detail page
  - [ ] Banner links to the new style
- [ ] Escape key closes modal

---

## Orders

### List Page (`/admin/orders`)
- [ ] Displays all orders with status badges
- [ ] Empty state shown when no orders exist
- [ ] "New Order" button or modal accessible

### Create Order
- [ ] Required fields validated
- [ ] Save success → toast + redirect to list

### Order Detail (`/admin/orders/[id]`)
- [ ] Status dropdown updates order status
- [ ] Status options: Confirmed, In Production, Shipped, Delivered
- [ ] Save → toast: "Changes saved"
- [ ] Delete with confirmation

### Dashboard Active Orders Count
- [ ] Dashboard shows count of orders with status: confirmed, in_production, or shipped

---

## Views & Export

### Views List (`/admin/views`)
- [ ] Displays view cards in grid
- [ ] Each card shows: name, type badge (Gallery/Grid), attribute count, filter count
- [ ] Default badge shown for default view
- [ ] "Open" button → render view
- [ ] "Edit" button → edit view configuration
- [ ] Empty state message when no views exist

### Create/Edit View
- [ ] View name required
- [ ] Type selection: Gallery or Grid
- [ ] Attribute selection works
- [ ] Filter configuration (field, operator, value)
- [ ] Sort configuration (field, direction)
- [ ] Group by selection
- [ ] Display options (items per row, image size, pagination)
- [ ] Export options (header text, page size, include images)
- [ ] Save persists all configuration as JSON

### Render View
- [ ] Gallery mode: card grid with images and selected attributes
- [ ] Grid mode: table layout
- [ ] Filters applied correctly
- [ ] Sorting applied correctly
- [ ] Grouping shows section headers
- [ ] Pagination controls work (next/previous)
- [ ] Checkbox selection per item

### Export Page
- [ ] Export page accessible from rendered view
- [ ] Shows export settings: page size, header text, include images
- [ ] Displays "PDF export is not yet available" placeholder message

---

## UX Features

### Toast Notifications
- [ ] Appear in top-right corner
- [ ] Dark theme styling (neutral-900 bg, white text)
- [ ] Auto-dismiss after 3 seconds
- [ ] Success toasts show for: save, delete, archive, export, quote create
- [ ] Error toasts show for: validation failures, server errors
- [ ] Multiple toasts stack vertically

### Loading States
- [ ] `SkeletonCard`: matches product/logo card shape
- [ ] `SkeletonRow`: matches list row shape
- [ ] `SkeletonLogoCard`: matches logo card shape (square aspect ratio)
- [ ] `SkeletonMetric`: matches dashboard metric card shape
- [ ] All skeletons have `animate-pulse` effect

### Empty States
- [ ] Styles: icon + "No styles yet" + "Create First Style" CTA
- [ ] Suppliers: icon + "No suppliers yet" + "Add First Supplier" CTA
- [ ] Logos: icon + "No logos uploaded" + "Upload First Logo" CTA
- [ ] Views: "No views created yet" message
- [ ] Customizations: "No customizations saved yet." text
- [ ] Customization (no images): "Add product images first" with guidance
- [ ] Quotes: empty state when no quotes exist

### Keyboard Shortcuts
- [ ] `Cmd/Ctrl + S` saves form on style edit (Details tab only)
- [ ] `Cmd/Ctrl + S` saves form on logo detail page
- [ ] `Cmd/Ctrl + S` saves form on supplier edit page
- [ ] `Cmd/Ctrl + S` saves form on concept edit page
- [ ] Browser save dialog is prevented (no browser save-as popup)
- [ ] `Escape` closes Quick Add variant modal
- [ ] `Escape` closes Email Quote modal
- [ ] `Escape` closes Create Style from Quote modal
- [ ] Shortcuts work on both Mac (metaKey) and Windows/Linux (ctrlKey)

### Error Handling
- [ ] Invalid file type → client-side error message (inline)
- [ ] File too large → client-side error message (inline)
- [ ] Server error → toast with Supabase error message
- [ ] Missing required field → browser native validation
- [ ] Delete confirmation prevents accidental deletion

---

## Performance

### Page Load
- [ ] Dashboard loads within 2 seconds
- [ ] Style list loads within 2 seconds
- [ ] Logo gallery loads within 3 seconds (image-heavy)
- [ ] Quotes list loads within 2 seconds

### Image Upload
- [ ] Product image upload completes within 5 seconds (5 MB file)
- [ ] Logo upload completes within 5 seconds (10 MB file)
- [ ] Progress indicator updates during upload

### Canvas Performance
- [ ] Fabric.js canvas initializes within 1 second
- [ ] Logo placement updates are instant (< 100 ms)
- [ ] Switching techniques (embroidery/print) is instant
- [ ] Export to PNG completes within 3 seconds

### Drag-and-Drop
- [ ] Drag activation feels responsive (8px threshold)
- [ ] Reorder animation is smooth
- [ ] Database save on drop completes within 1 second

---

## Browser Compatibility

- [ ] Chrome (latest) — primary target
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iPad) — responsive layout
- [ ] Chrome Android — responsive layout

---

## Environment & Configuration

- [ ] `.env.local` has all required variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Supabase Storage buckets exist:
  - [ ] `product-images` (public read)
  - [ ] `logos` (public read)
- [ ] Supabase email auth enabled
- [ ] Admin user exists in Supabase auth
- [ ] All database tables created with correct schema
- [ ] Tables required: `styles`, `concepts`, `categories`, `suppliers`, `logos`, `customizations`, `variants`, `views`, `quote_requests`, `orders`
