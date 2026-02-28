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
- [ ] No flash of protected content before redirect

**Common issues:**
- Server-side Supabase client not configured (missing env vars)
- Cookie not set properly (check `@supabase/ssr` setup)

---

## Styles (CRUD)

### List Page (`/admin/styles`)
- [ ] Displays all non-archived styles
- [ ] Archived styles (`status = 'archived'`) are hidden
- [ ] Empty state shown when no styles exist (icon + CTA)
- [ ] Each card shows: name, status badge, category info, variant count
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
- [ ] Optional fields accept empty values: description, material, base cost, lead time, supplier, customization mode
- [ ] Save button shows "Saving..." while submitting
- [ ] Success toast: "Changes saved"
- [ ] Redirects to `/admin/styles` after save

### Edit Style (`/admin/styles/[id]`)
- [ ] All fields pre-populated with existing data
- [ ] Three tabs visible: Details, Variants, Customization
- [ ] Tab switching works without losing form data
- [ ] Status dropdown in top-right shows color-coded badge
  - [ ] Active → green
  - [ ] Development → yellow
  - [ ] Archived → red
- [ ] `Cmd/Ctrl + S` triggers save (Details tab only)
- [ ] Save shows success toast
- [ ] Redirects to styles list after save

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
- [ ] "Bulk Add" opens the bulk creation modal
- [ ] Bulk modal: checkboxes for sizes (XS through XXL)
- [ ] Bulk modal: color presets + custom color input
- [ ] SKUs auto-generated: `{STYLE-NAME}-{SIZE}-{COLOR}`
- [ ] Pressing Escape closes the bulk modal
- [ ] Generated variants appear in the table

**Common issues:**
- SKU uniqueness not enforced client-side (may fail on server)
- Empty size/color generates malformed SKU

### Archive (Soft Delete)
- [ ] Click "Archive" button at bottom of edit form
- [ ] Confirmation prompt appears: "Archive this style?"
- [ ] "Yes, Archive" button sets status to `archived`
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
- [ ] Works with keyboard (if @dnd-kit keyboard sensor enabled)

---

## Suppliers

### List Page (`/admin/suppliers`)
- [ ] Displays all suppliers sorted by name
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
- [ ] Delete removes supplier from database
- [ ] Toast notifications on save/delete

**Common issues:**
- Deleting a supplier linked to styles may cause FK constraint errors (depends on DB setup)

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
- [ ] Deleting concept may cascade to categories (verify behavior)

### Create Category (`/admin/concepts/[id]/categories/new`)
- [ ] Name required
- [ ] Slug auto-generated
- [ ] Category linked to parent concept
- [ ] Save redirects to concept edit page

### Drag-and-Drop (Concepts)
- [ ] Concepts can be reordered via drag handles
- [ ] Order persists in database
- [ ] 8px activation distance

**Common issues:**
- Category slug collision if same name used across concepts

---

## Logos

### Logo List (`/admin/logos`)
- [ ] Grid layout (2-4 columns responsive)
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
- [ ] PNG/SVG: extracts and displays dimensions (width x height px)
- [ ] AI/EPS: shows format label, no preview
- [ ] "Remove" button clears selected file
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
- [ ] Save → toast: "Changes saved" + redirect
- [ ] Delete button → confirmation dialog
- [ ] Delete → toast: "Logo deleted" + redirect
- [ ] Delete button shows "Deleting..." while processing

**Common issues:**
- CORS issues if Supabase Storage bucket not configured for public access
- SVG dimension extraction fails for SVGs without explicit width/height (falls back to viewBox)

---

## Customizations (Mockup Generator)

### Prerequisites
- [ ] Style must have at least one image uploaded
- [ ] At least one logo must exist in the Logo Library

### Canvas Initialization
- [ ] Canvas loads with first product image as background
- [ ] Canvas size: 500x600px
- [ ] Black background when no image loaded
- [ ] If no images: shows "Add product images first" message

### Image View Switching
- [ ] Multiple images → tabs appear: "Front", "Back", "Detail", "View 4"...
- [ ] Clicking tab switches background image
- [ ] Active tab highlighted (white bg)
- [ ] Single image → no tabs shown

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
- [ ] Center Front: logo at center-top
- [ ] Center Back: logo at center-top
- [ ] From HSP: logo at upper-right
- [ ] Center on WRS: logo at right-center
- [ ] Center on WLS: logo at left-center

### Technique
- [ ] Two toggle buttons: Embroidery (blue), Print (purple)
- [ ] Embroidery selected:
  - [ ] Logo opacity set to 85%
  - [ ] Shadow/stitch overlay added
  - [ ] Blue "Embroidery texture" badge top-left
  - [ ] Hint text below buttons
- [ ] Print selected:
  - [ ] Logo opacity set to 95%
  - [ ] No overlay
  - [ ] No badge

### Size Controls
- [ ] Width (cm) input: range 0.5-50, step 0.1
- [ ] Height (cm) input: range 0.5-50, step 0.1
- [ ] Changing values updates logo size on canvas in real-time
- [ ] Default values: 5 x 5 cm

### Pantone Color
- [ ] Text input for pantone color reference
- [ ] Optional field
- [ ] Value saved with customization

### Canvas Interaction
- [ ] Logo is selectable (click shows border)
- [ ] Logo can be dragged to new position
- [ ] Background image is NOT selectable/draggable
- [ ] Logo has no resize handles (controlled by width/height inputs)

### Zoom
- [ ] "+" button increases zoom (max 200%)
- [ ] "-" button decreases zoom (min 50%)
- [ ] Percentage button resets to 100%
- [ ] Smooth transition on zoom
- [ ] Zoom percentage displayed

### Save Customization
- [ ] "Save Customization" requires logo selection
- [ ] Missing logo → error toast: "Please select a logo."
- [ ] Button disabled while saving
- [ ] Button text: "Saving..." during save
- [ ] Success toast: "Customization saved"
- [ ] Form resets after save
- [ ] New row appears in saved customizations table

### Edit Customization
- [ ] Click "Edit" in table → form populates with saved data
- [ ] Button changes to "Update Customization"
- [ ] "Cancel" button appears
- [ ] Update success → toast: "Customization updated"
- [ ] Form resets after update

### Delete Customization
- [ ] Click "Delete" in table
- [ ] Row removes on success
- [ ] Toast: "Customization deleted"
- [ ] Delete button shows "..." while deleting

### Export Mockup
- [ ] "Download Mockup" button below canvas
- [ ] Button shows "Exporting..." during export
- [ ] PNG file downloads to computer
- [ ] Filename: `mockup-{styleId}-{placement}.png`
- [ ] Resolution: 2x (1000x1200px)
- [ ] Mockup uploaded to Supabase Storage (`mockups/{styleId}/`)
- [ ] If editing: mockup_url saved to customization record
- [ ] Success toast: "Mockup exported and saved"
- [ ] Storage failure: "Download complete, but storage upload failed"

### Saved Customizations Table
- [ ] Loading state: skeleton rows with pulse animation
- [ ] Empty state: "No customizations saved yet."
- [ ] Columns: Logo (thumbnail + name), Placement, Technique (badge), Color, Size, Actions
- [ ] Technique badge: blue for embroidery, purple for print
- [ ] Size displays as "W x H cm" format
- [ ] Hover effect on rows

**Common issues:**
- Fabric.js canvas may not render in SSR (ensure 'use client')
- CORS errors when loading product images cross-origin on canvas
- Large logos may exceed canvas bounds (capped at 200px)
- Embroidery overlay position may drift if logo is dragged

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
- [ ] Attribute selection (left/right column interface)
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
- [ ] Select all checkbox

### Export PDF
- [ ] Export with selected items
- [ ] PDF includes configured header
- [ ] Images included if enabled
- [ ] Page size respected (A4/Letter)

---

## UX Features

### Toast Notifications
- [ ] Appear in top-right corner
- [ ] Dark theme styling (neutral-900 bg, white text)
- [ ] Auto-dismiss after 3 seconds
- [ ] Success toasts show for: save, delete, archive, export
- [ ] Error toasts show for: validation failures, server errors
- [ ] Multiple toasts stack vertically
- [ ] Toasts visible across all pages (provider in root layout)

### Loading States
- [ ] `SkeletonCard`: matches product/logo card shape
- [ ] `SkeletonRow`: matches list row shape
- [ ] `SkeletonLogoCard`: matches logo card shape (square aspect ratio)
- [ ] `SkeletonMetric`: matches dashboard metric card shape
- [ ] All skeletons have `animate-pulse` effect
- [ ] Transitions cleanly to actual content

### Empty States
- [ ] Styles: icon + "No styles yet" + "Create First Style" CTA
- [ ] Suppliers: icon + "No suppliers yet" + "Add First Supplier" CTA
- [ ] Logos: icon + "No logos uploaded" + "Upload First Logo" CTA
- [ ] Views: "No views created yet" message
- [ ] Customizations: "No customizations saved yet." text
- [ ] Customization (no images): "Add product images first" with guidance

### Keyboard Shortcuts
- [ ] `Cmd/Ctrl + S` saves form on style edit (Details tab only)
- [ ] `Cmd/Ctrl + S` saves form on logo detail page
- [ ] Browser save dialog is prevented (no browser save-as popup)
- [ ] `Escape` closes bulk variant modal
- [ ] Shortcuts work on both Mac (metaKey) and Windows/Linux (ctrlKey)

### Error Handling
- [ ] Invalid file type → client-side error message (inline)
- [ ] File too large → client-side error message (inline)
- [ ] Server error → toast with Supabase error message
- [ ] Missing required field → browser native validation
- [ ] Network failure → toast error
- [ ] Delete confirmation prevents accidental deletion

### Navigation
- [ ] All edit/new pages have BackLink component
- [ ] BackLink shows arrow icon with hover state
- [ ] Top nav bar shows on all admin pages
- [ ] Nav links: Dashboard, Styles, Concepts, Suppliers, Logos, Views
- [ ] Active page not highlighted (known limitation)

---

## Performance

### Page Load
- [ ] Dashboard loads within 2 seconds
- [ ] Style list loads within 2 seconds
- [ ] Logo gallery loads within 3 seconds (image-heavy)
- [ ] Login page loads instantly (no data fetching)

### Image Upload
- [ ] Product image upload completes within 5 seconds (5 MB file)
- [ ] Logo upload completes within 5 seconds (10 MB file)
- [ ] Progress indicator updates during upload
- [ ] Multiple sequential uploads don't cause race conditions

### Canvas Performance
- [ ] Fabric.js canvas initializes within 1 second
- [ ] Logo placement updates are instant (< 100ms)
- [ ] Switching techniques (embroidery/print) is instant
- [ ] Zoom transitions are smooth (CSS transition)
- [ ] Export to PNG completes within 3 seconds

### Drag-and-Drop
- [ ] Drag activation feels responsive (8px threshold)
- [ ] Reorder animation is smooth
- [ ] Database save on drop completes within 1 second
- [ ] No visual glitches during drag

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
