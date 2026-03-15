# Atelier Admin - Visual Documentation

Complete visual documentation of every page in the admin panel.
All pages use a dark theme (black background, white text, neutral-800 borders).

---

## Global Layout

Every admin page shares this shell:

```
+----------------+------------------------------------------+
| Atelier        |                                          |
|----------------|  [page content with p-8 padding]         |
| Dashboard      |                                          |
|                |                                          |
| > Product      |                                          |
|   Hierarchy    |                                          |
|   Product      |                                          |
|   Colour Lib   |                                          |
|   Specification|                                          |
|                |                                          |
| > Production   |                                          |
|   Quote Req.   |                                          |
|   Orders       |                                          |
|   Suppliers    |                                          |
|   Factories    |                                          |
|                |                                          |
| > Logos        |                                          |
|   Logo Library |                                          |
|   Upload Logo  |                                          |
|   Mockup Gen.  |                                          |
|                |                                          |
| > Views        |                                          |
|   All Views    |                                          |
|   New View     |                                          |
|----------------|                                          |
| Settings       |                                          |
| Sign Out       |                                          |
+----------------+------------------------------------------+
```

- **Left sidebar** (`w-56`): fixed, black background, neutral-800 right border
- Brand: "Atelier" (lg bold) at top, links to `/admin`
- Sections are **collapsible** — click section header to expand/collapse sub-items
- Active page highlighted: white text + neutral-900 background
- Active section auto-expands on page load
- **Footer**: Settings link + Sign Out button at bottom of sidebar
- Auth check: redirects to `/login` if no session

---

## 1. Login Page

**Route:** `/login`

```
+----------------------------------------------------------+
|                                                          |
|                                                          |
|              Atelier Admin                               |
|                                                          |
|              +----------------------------+              |
|              | Email                      |              |
|              +----------------------------+              |
|              +----------------------------+              |
|              | Password                   |              |
|              +----------------------------+              |
|              +----------------------------+              |
|              |          Login             |              |
|              +----------------------------+              |
|                                                          |
+----------------------------------------------------------+
```

- Full-screen centered, black background
- Heading: "Atelier Admin" (3xl bold)
- Email input: placeholder "Email", type=email, required
- Password input: placeholder "Password", type=password, required
- Login button: white bg, black text, full width
- Loading state: button text changes to "Loading..."
- Error: toast notification via Sonner
- Success: redirects to /admin

---

## 2. Dashboard

**Route:** `/admin`

```
+----------------------------------------------------------+
| Dashboard                                                |
|                                                          |
| STYLES                                                   |
| +------------------+ +------------------+ +----------+  |
| |       12         | |        8         | |    3     |  |
| |   Total Styles   | |  Active Styles   | | Concepts |  |
| +------------------+ +------------------+ +----------+  |
|   (clickable link)                                       |
|                                                          |
| PRODUCTION                                               |
| +------------------+ +------------------+ +----------+  |
| |        4         | |    2 (blue)      | |  5 (blue)|  |
| |    Suppliers     | |  Active Orders   | |  Pending |  |
| |                  | |  (clickable)     | |  Quotes  |  |
| +------------------+ +------------------+ +----------+  |
|                         (clickable)      (clickable)     |
|                                                          |
| Quote Requests                                           |
|                                                          |
| +----------+ +----------+ +----------+ +-----------+    |
| |  5(blue) | |    18    | |  7(green)| |    42%    |    |
| | Pending  | |  Total   | |Accepted/ | |Conversion |    |
| | Review   | |  Quotes  | |Converted | |   Rate    |    |
| +----------+ +----------+ +----------+ +-----------+    |
|   (clickable)                                            |
|                                                          |
| Recent Quotes                          View all ->       |
| +------------------------------------------------------+ |
| | Date | Customer | Company | Product | Qty |Status|   | |
| |------+----------+---------+---------+-----+------+---| |
| | 01Mar| John Doe | Acme    | Polo    | 100 | New  |Vw | |
| | 28Feb| Jane S.  | —       | T-Shirt | 50  |Quoted|Vw | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Heading: "Dashboard" (3xl bold)
- **Styles section** (label: "STYLES", 3-column grid):
  - Total Styles (clickable → /admin/styles), Active Styles, Concepts
  - Each card: border neutral-800, number in 4xl bold, label in neutral-400
- **Production section** (label: "PRODUCTION", 3-column grid):
  - Suppliers
  - Active Orders (blue-300 number, clickable → /admin/orders)
  - Pending Quotes (blue-highlighted card border, clickable → /admin/quotes)
- **Quote Requests heading:** "Quote Requests" (xl semibold), 4-column grid:
  - Pending Review (blue-300, clickable → /admin/quotes)
  - Total Quotes
  - Accepted/Converted (green-300)
  - Conversion Rate (accepted ÷ quoted, as %)
- **Recent Quotes table:** last 5 quotes (hidden when no quotes exist)
  - Columns: Date, Customer, Company, Product, Qty, Status badge, View link
  - Status badges color-coded (see Status Badge Color Reference)
  - "View all →" link to /admin/quotes in table header

---

## 3. Styles List

**Route:** `/admin/styles`

```
+----------------------------------------------------------+
| Styles                                    [New Style]    |
|                                                          |
| +------------------+ +------------------+ +-----------+  |
| | :: +----------+  | | :: +----------+  | | :: (img)  |  |
| | :: |  image   |  | | :: | no image |  | | ::        |  |
| | :: +----------+  | | :: +----------+  | | ::        |  |
| | :: Oxford Shirt  | | :: Polo Shirt    | | :: ...    |  |
| | :: 100% Cotton   | | :: Pique Cotton  | | ::        |  |
| | :: Classic/Shirt | | :: Sport/Polo    | | ::        |  |
| | :: [Active]      | | :: [Development] | | ::        |  |
| | :: [Unisex]      | | :: [Men's]       | | ::        |  |
| | :: [Foundation]  | | :: [Editorial]   | | ::        |  |
| | :: [4 variants]  | | :: [2 variants]  | | ::        |  |
| +------------------+ +------------------+ +-----------+  |
+----------------------------------------------------------+
```

- Heading: "Styles" (3xl bold) + "New Style" button (white bg)
- **Grid:** 3-column responsive (1 on mobile, 2 on md, 3 on lg)
- **Each card:**
  - Drag handle (:: dots) on left border for reorder
  - Image (h-48 cover) or placeholder icon
  - Style name (xl semibold)
  - Material (neutral-500)
  - Concept / Category breadcrumb (neutral-500)
  - Badge row: Status, Gender, Collection Type, Variant count
  - Status colors: Active=green, Development=yellow, Archived=neutral
  - Entire card is a link to edit page
- **Drag-and-drop:** @dnd-kit, saves order to Supabase on drop
- **Empty state:** dashed border box with icon, "No styles yet" message, "Create First Style" button

---

## 4. New Style

**Route:** `/admin/styles/new`

```
+----------------------------------------------------------+
| <- Back to Styles                                        |
| New Style                                                |
|                                                          |
| Style Name                                               |
| +------------------------------------------------------+ |
| |                                                      | |
| +------------------------------------------------------+ |
|                                                          |
| Concept              | Category                          |
| +--------------------+ +-------------------------------+ |
| | Select concept   v | | Select a concept first      v | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Gender               | Collection Type                   |
| +--------------------+ +-------------------------------+ |
| | Unisex           v | | Foundation                  v | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Product Capability                                       |
| +------------------------------------------------------+ |
| | None                                               v | |
| +------------------------------------------------------+ |
| Controls frontend checkout and customization behavior    |
|                                                          |
| [Image Upload area - drag to reorder]                    |
|                                                          |
| Description                                              |
| +------------------------------------------------------+ |
| |                                                      | |
| +------------------------------------------------------+ |
|                                                          |
| Material                                                 |
| +------------------------------------------------------+ |
| |                                                      | |
| +------------------------------------------------------+ |
|                                                          |
| Base Supplier                                            |
| +------------------------------------------------------+ |
| | None                                               v | |
| +------------------------------------------------------+ |
|                                                          |
| Base Cost (EUR)      | Lead Time (days)                   |
| +--------------------+ +-------------------------------+ |
| |                    | |                               | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Customization Mode                                       |
| +------------------------------------------------------+ |
| | e.g. logo placement, embroidery                      | |
| +------------------------------------------------------+ |
|                                                          |
| [Create Style]                                           |
+----------------------------------------------------------+
```

- Back link: "<- Back to Styles"
- Heading: "New Style" (3xl bold)
- Max width: 2xl
- Fields: Style Name, Concept (cascading), Category, Gender (4 options), Collection Type (4 options), Product Capability (4 options), Image Upload, Description (textarea), Material, Base Supplier, Base Cost, Lead Time, Customization Mode
- Category defaults: auto-fills supplier and lead time from category defaults
- Submit button: "Create Style" / "Creating..."

---

## 5. Style Edit (Details Tab)

**Route:** `/admin/styles/[id]`

```
+----------------------------------------------------------+
| <- Back to Styles                                        |
| Edit Style                          [Development v]      |
|                                                          |
| [Details]  [Variants]  [Customization]                   |
| ---------                                                |
|                                                          |
| Style Name                                               |
| +------------------------------------------------------+ |
| | Oxford Button-Down Shirt                             | |
| +------------------------------------------------------+ |
|                                                          |
| Concept              | Category                          |
| +--------------------+ +-------------------------------+ |
| | Classic          v | | Shirts                      v | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Gender               | Collection Type                   |
| +--------------------+ +-------------------------------+ |
| | Men's            v | | Foundation                  v | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Product Capability                                       |
| +------------------------------------------------------+ |
| | Simple Customizable                                v | |
| +------------------------------------------------------+ |
|                                                          |
| [Product images with drag reorder]                       |
| Description, Material, Supplier, Cost, Lead Time...      |
|                                                          |
| [Save Changes]                           [Archive]       |
+----------------------------------------------------------+
```

- Same fields as New Style plus status dropdown in header
- Status dropdown: color-coded border (green/yellow/red)
- 3 tabs: Details, Variants, Customization (underline active)
- Keyboard shortcut: Cmd+S saves (Details tab only)
- Archive button: shows confirmation "Archive this style?" with Yes/Cancel
- Delete is soft-delete (sets status to "archived")

---

## 6. Style Edit (Variants Tab)

```
+----------------------------------------------------------+
| Edit Style                          [Active v]           |
|                                                          |
| [Details]  [Variants]  [Customization]                   |
|             ---------                                    |
|                                                          |
| Variants (6)                   [Quick Add] [Add Variant] |
|                                                          |
| +------------------------------------------------------+ |
| | SIZE | COLOR | SKU        | STOCK | PRICE +/- | ACT  | |
| |------+-------+------------+-------+-----------+------| |
| | [M]  | Black | OXFO-M-BLA |    25 |     —     |Ed Del| |
| | [M]  | White | OXFO-M-WHI |    18 |     —     |Ed Del| |
| | [L]  | Black | OXFO-L-BLA |     0 |     —     |Ed Del| |
| | [L]  | White | OXFO-L-WHI |    12 |   +2.50   |Ed Del| |
| | [XL] | Navy  | OXFO-XL-NAV|     5 |   +5.00   |Ed Del| |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Heading: "Variants (count)" with Quick Add and Add Variant buttons
- **Table columns:** Size, Color, SKU, Stock, Price +/-, Actions
- Size shown as badge pill
- SKU in monospace
- Stock: red text when 0
- Price modifier: green for positive, red for negative, dash for zero
- **Inline editing:** clicking Edit converts row to input fields
  - Size: dropdown (XS, S, M, L, XL, XXL)
  - Color: text input
  - SKU: auto-generated from style name + size + color, editable
  - Save/Cancel buttons in row
- **Add Variant:** new editable row at bottom
- **Empty state:** "No variants yet. Add sizes, colors, and stock levels."

---

## 7. Quick Add Variants Modal

```
+----------------------------------------------------------+
|                                                          |
|    +------------------------------------------------+    |
|    | Quick Add Variants                             |    |
|    |                                                |    |
|    | Select Sizes                                   |    |
|    | [XS] [S] [*M*] [*L*] [*XL*] [XXL]             |    |
|    |                                                |    |
|    | Select Colors                                  |    |
|    | [*Black*] [White] [*Navy*] [Grey]              |    |
|    | [Red] [Green] [Blue] [Beige]                   |    |
|    |                                                |    |
|    | +-------------------+ [Add]                    |    |
|    | | Custom color...   |                          |    |
|    | +-------------------+                          |    |
|    |                                                |    |
|    | Default Stock per Variant                      |    |
|    | +--------+                                     |    |
|    | |   0    |                                     |    |
|    | +--------+                                     |    |
|    |                                                |    |
|    | +--------------------------------------------+ |    |
|    | | 6 variants will be created:                | |    |
|    | | [M/Black] [M/Navy] [L/Black]               | |    |
|    | | [L/Navy] [XL/Black] [XL/Navy]              | |    |
|    | | SKU preview: OXFO-M-BLA                    | |    |
|    | +--------------------------------------------+ |    |
|    |                                                |    |
|    | Cancel                    [Create 6 Variants]  |    |
|    +------------------------------------------------+    |
|                                                          |
+----------------------------------------------------------+
```

- Modal: fixed overlay, bg-black/80, centered card
- **Sizes:** toggle buttons (XS-XXL), selected = white bg
- **Colors:** 8 preset toggle buttons + custom color input with Add
- **Stock:** number input for default per variant
- **Preview:** shows all size/color combinations as pills, plus SKU preview
- **Actions:** Cancel (left), Create N Variants (right, white bg)
- Escape key closes modal

---

## 8. Style Edit (Customization Tab)

```
+----------------------------------------------------------+
| Edit Style                          [Active v]           |
|                                                          |
| [Details]  [Variants]  [Customization]                   |
|                         ---------------                  |
|                                                          |
| Logo Customizations                 [Add Customization]  |
|                                                          |
| +------------------------------------------------------+ |
| | +-------+ Acme Corp Logo                      [Del]  | |
| | | logo  | Placement: Center Front                     | |
| | | img   | Technique: [Embroidery]                     | |
| | +-------+ Pantone: 186 C                              | |
| +------------------------------------------------------+ |
|                                                          |
| Mockup Generator                                         |
| +------------------------------------------------------+ |
| |                                                      | |
| |  [Fabric.js Canvas]                                  | |
| |                                                      | |
| |  Product image with draggable logo overlay           | |
| |  5 placement buttons, zoom, technique toggle         | |
| |                                                      | |
| +------------------------------------------------------+ |
| | Placements: [CF] [CB] [HSP] [WRS] [WLS]             | |
| | Zoom: [-] [+]   Technique: [Embroidery] [Print]     | |
| | [Export Mockup]                                      | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- **Customization list:** each entry shows logo image, placement, technique badge, pantone
- Technique badges: Embroidery = blue, Print = purple
- **Mockup Generator:** Fabric.js v7 canvas
  - Product image as background
  - Logo draggable/resizable overlay
  - 5 placement preset buttons (CF, CB, HSP, WRS, WLS)
  - Zoom controls
  - Technique toggle (Embroidery/Print)
  - Export Mockup button (saves canvas as image)

---

## 9. Suppliers List

**Route:** `/admin/suppliers`

```
+----------------------------------------------------------+
| Suppliers                              [New Supplier]    |
|                                                          |
| +------------------------------------------------------+ |
| | Shanghai Textiles Co.                                | |
| | MOQ         Lead Time    Location       Contact      | |
| | 500         21 days      Shanghai       email@...    | |
| +------------------------------------------------------+ |
| +------------------------------------------------------+ |
| | Porto Fabrics Ltd                                    | |
| | MOQ         Lead Time    Location       Contact      | |
| | 200         14 days      Porto          email@...    | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Heading: "Suppliers" (3xl bold) + "New Supplier" button
- **Card list:** vertical stack, each card is a link
  - Supplier name (xl semibold)
  - 4-column grid of details: MOQ, Lead Time, Location, Contact
  - Shows "N/A" for missing values
- **Empty state:** dashed border, "No suppliers yet" + description + "Add First Supplier" button

---

## 10. Concepts & Categories

**Route:** `/admin/concepts`

```
+----------------------------------------------------------+
| Concepts                               [New Concept]     |
|                                                          |
| +------------------------------------------------------+ |
| | :: Classic                              [Edit] [+Cat]| |
| |    +- Shirts                                         | |
| |    +- Trousers                                       | |
| |    +- Outerwear                                      | |
| +------------------------------------------------------+ |
| +------------------------------------------------------+ |
| | :: Sport                                [Edit] [+Cat]| |
| |    +- Polo Shirts                                    | |
| |    +- Activewear                                     | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Heading: "Concepts" (3xl bold) + "New Concept" button
- **Sortable concept list:** drag handle (::) for reorder
- Each concept card shows name + Edit/Add Category buttons
- Nested categories listed below each concept
- Categories are also sortable within their concept
- Drag-and-drop via @dnd-kit

---

## 11. Logos Library

**Route:** `/admin/logos`

```
+----------------------------------------------------------+
| Logos                                [Upload New Logo]   |
|                                                          |
| +----------+ +----------+ +----------+ +----------+     |
| |          | |          | |          | |          |     |
| | [logo]   | | [logo]   | |   AI    | | [logo]   |     |
| |          | |          | | Preview  | |          |     |
| |          | |          | |not avail | |          |     |
| +----------+ +----------+ +----------+ +----------+     |
| | Acme Corp| | Beta Inc | | Gamma   | | Delta    |     |
| | [PNG]    | | [SVG]    | | [AI]    | | [EPS]    |     |
| | 800x600  | | 1200x900 | |         | |          |     |
| +----------+ +----------+ +----------+ +----------+     |
+----------------------------------------------------------+
```

- Heading: "Logos" (3xl bold) + "Upload New Logo" button
- **Grid:** 4-column responsive (2 on mobile, 3 on md, 4 on lg)
- **Each card:**
  - Square aspect ratio preview area (bg neutral-900)
  - PNG/SVG: actual image preview
  - AI/EPS: format name + "Preview not available"
  - Company name (semibold, truncated)
  - Format badge (neutral-800 pill)
  - Dimensions if available
  - Entire card is a link to detail page
- **Empty state:** dashed border, "No logos uploaded" + description + "Upload First Logo" button

---

## 12. Quotes List

**Route:** `/admin/quotes`

```
+----------------------------------------------------------+
| Quotes                             [New Quote Request]   |
|                                                          |
| +----------------------------+ +---------------------+   |
| | Search by name, email...   | | All Statuses      v |   |
| +----------------------------+ +---------------------+   |
|                                                          |
| 12 quotes                                                |
|                                                          |
| +------------------------------------------------------+ |
| | DATE  |CUSTOMER    |COMPANY|PRODUCT|QTY|STATUS|PRICE|| |
| |-------+------------+-------+-------+---+------+-----|| |
| | 01 Mar| John Doe   | Acme  | Polo  |100| New  |  —  |V| |
| |       | john@...   |       |       |   |      |     | | |
| | 28 Feb| Jane Smith | —     |T-Shirt| 50|Quoted|250.0|V| |
| |       | jane@...   |       |       |   |      |     | | |
| | 25 Feb| Bob Wilson |BetaCo | Jacket|200|Accept|890.0|V| |
| |       | bob@...    |       |       |   |      |     | | |
| +------------------------------------------------------+ |
+----------------------------------------------------------+
```

- Heading: "Quotes" (3xl bold) + "New Quote Request" button
- **Filters row:**
  - Search input: "Search by name, email, or company..."
  - Status dropdown: All Statuses, New, Reviewed, Quoted, Accepted, Rejected, Converted
- **Results count:** "12 quotes" with active filter indicators
- **Table columns:** Date, Customer (name + email), Company, Product, Qty, Status, Quoted Price, Actions (View button)
- **Status badge colors:**
  - New: blue
  - Reviewed: yellow
  - Quoted: purple
  - Accepted: green
  - Rejected: red
  - Converted: emerald
- **Empty filter state:** "No quotes match your filters."

---

## 13. New Quote Request

**Route:** `/admin/quotes/new`

```
+----------------------------------------------------------+
| <- Back to Quotes                                        |
| New Quote Request                                        |
|                                                          |
| Customer Information                                     |
| Customer Name        | Email                              |
| +--------------------+ +-------------------------------+ |
| |                    | |                               | |
| +--------------------+ +-------------------------------+ |
| Company              | Phone                              |
| +--------------------+ +-------------------------------+ |
| |                    | |                               | |
| +--------------------+ +-------------------------------+ |
|                                                          |
| Product                                                  |
| Existing Style (optional)                                |
| +------------------------------------------------------+ |
| | -- Select existing style or leave blank --         v | |
| +------------------------------------------------------+ |
| Link to an existing style, or describe below             |
|                                                          |
| Product Description                                      |
| +------------------------------------------------------+ |
| | e.g. Custom polo shirt with embroidered logo         | |
| +------------------------------------------------------+ |
| Quantity                                                 |
| +--------+                                               |
| |   1    |                                               |
| +--------+                                               |
|                                                          |
| Variant Breakdown (optional)                             |
| +----------+ +-----------+ +-----+                       |
| | Size     | | Color     | | Qty | [x]                   |
| +----------+ +-----------+ +-----+                       |
| + Add line                                               |
|                                                          |
| Customization Preferences (optional)                     |
| Placement            | Technique                          |
| +--------------------+ +-------------------------------+ |
| | --               v | | --                          v | |
| +--------------------+ +-------------------------------+ |
| Pantone Color                                            |
| +------------------------------------------------------+ |
| | e.g. Pantone 186 C                                   | |
| +------------------------------------------------------+ |
|                                                          |
| Customer Message                                         |
| +------------------------------------------------------+ |
| | Any special requests or notes...                     | |
| +------------------------------------------------------+ |
|                                                          |
| [Create Quote Request]                                   |
+----------------------------------------------------------+
```

- Back link: "<- Back to Quotes"
- Heading: "New Quote Request" (3xl bold)
- Max width: 2xl
- **Sections:**
  1. Customer Info: Name (required), Email (required), Company, Phone
  2. Product: Style dropdown (optional), Product Description, Quantity
  3. Variant Breakdown: Dynamic rows (Size/Color/Qty) + "Add line"
  4. Customization: Placement (5 options), Technique (Embroidery/Print), Pantone Color
  5. Customer Message: textarea
- Submit: "Create Quote Request" / "Creating..."
- Placement options: Center Front, Center Back, From HSP, Center on WRS, Center on WLS

---

## 14. Quote Detail

**Route:** `/admin/quotes/[id]`

```
+----------------------------------------------------------+
| <- Back to Quotes                                        |
| Quote Request                            [Reviewed v]    |
| Submitted 1 March 2026                                   |
|                                                          |
| [Converted banner - if applicable]                       |
|                                                          |
| +----------------+ +----------------+ +----------------+ |
| | CUSTOMER       | | PRODUCT        | | PRICE CALC     | |
| |                | |                | |                | |
| | John Doe       | | Oxford Shirt   | | Unit Cost (EUR)| |
| | john@acme.com  | | [img][img][img]| | +----------+   | |
| |                | |                | | |  12.50   |   | |
| | Company        | | Base Cost      | | +----------+   | |
| | Acme Corp      | | EUR 12.50      | |                | |
| |                | | Lead Time      | | Cust Fee (EUR) | |
| | Phone          | | 21 days        | | +----------+   | |
| | +44 123...     | |                | | |   2.00   |   | |
| +----------------+ | Material       | | +----------+   | |
|                    | 100% Cotton    | |                | |
| MESSAGE            |                | | Margin (%)     | |
| +----------------+ | Quantity       | | +----------+   | |
| | Looking for    | |           100  | | |    30    |   | |
| | 100 custom...  | +----------------+ | +----------+   | |
| +----------------+ |                | |                | |
|                    | CUSTOMIZATION  | | Unit + cust    | |
| VARIANT BREAKDOWN  | +------------+ | |   EUR 14.50   | |
| +----------------+ | Placement    | | | x 100 units   | |
| | M / Black  x50 | | Center Front| | |  EUR 1450.00  | |
| | L / Black  x30 | | Technique   | | | + 30% margin  | |
| | XL / Navy  x20 | | [Embroidery]| | |   EUR 435.00  | |
| +----------------+ | Pantone      | | | -----------   | |
|                    | 186 C        | | | TOTAL         | |
|                    +------------+ | |  EUR 1885.00  | |
|                    |                | |                | |
|                    | CUSTOMER LOGO  | | [Apply Price]  | |
|                    | +------------+ | +----------------+ |
|                    | | [logo img] | | |                | |
|                    | +------------+ | | QUOTE RESPONSE | |
|                    +----------------+ | +----------+   | |
|                                       | | 1885.00  |   | |
|                                       | +----------+   | |
|                                       | Quoted 1 Mar   | |
|                                       +----------------+ |
|                                       |                | |
|                                       | INTERNAL NOTES | |
|                                       | +----------+   | |
|                                       | | Notes... |   | |
|                                       | +----------+   | |
|                                       +----------------+ |
|                                       |                | |
|                                       | [Save Changes] | |
|                                       | [Send Quote    | |
|                                       |  Email]        | |
|                                       | [Create Style  | |
|                                       |  from Quote]   | |
|                                       +----------------+ |
+----------------------------------------------------------+
```

- **Header:** "Quote Request" (3xl) + status dropdown (color-coded) + submission date
- **Converted banner:** emerald bg, "This quote has been converted" + link to style
- **3-column layout** (stacks on mobile):

**Left Column:**
- Customer card: name (lg semibold), email (blue link), company, phone
- Message card: whitespace-pre-wrap text
- Variant Breakdown card: size/color pairs with quantities

**Middle Column:**
- Product card: linked style name (link to style page) or product description
  - Style images (3-column grid, first 3)
  - Base Cost, Lead Time, Material
  - Quantity display (xl bold)
- Customization Preferences: Placement, Technique badge, Pantone Color
- Customer Logo: image preview

**Right Column:**
- Price Calculator:
  - Unit Base Cost input
  - Customization Fee input
  - Margin % input
  - Breakdown: unit+cust, x quantity, subtotal, + margin, total
  - "Apply as Quoted Price" button
- Quote Response: Quoted Price input + quoted date
- Internal Notes: textarea
- Action buttons (stacked, full width):
  - "Save Changes" (white bg, primary)
  - "Send Quote Email" (border, disabled without price)
  - "Create Style from Quote" (emerald border, hidden if already converted)

---

## 15. Email Quote Modal

```
+----------------------------------------------------------+
|                                                          |
|    +------------------------------------------------+    |
|    | Send Quote Email                               |    |
|    |                                                |    |
|    | To                                             |    |
|    | +--------------------------------------------+ |    |
|    | | John Doe <john@acme.com>                   | |    |
|    | +--------------------------------------------+ |    |
|    |                                                |    |
|    | Subject                                        |    |
|    | +--------------------------------------------+ |    |
|    | | Quote for Oxford Shirt - Acme Corp         | |    |
|    | +--------------------------------------------+ |    |
|    |                                                |    |
|    | Message                                        |    |
|    | +--------------------------------------------+ |    |
|    | | Dear John Doe,                             | |    |
|    | |                                            | |    |
|    | | Thank you for your interest in Oxford      | |    |
|    | | Shirt.                                     | |    |
|    | |                                            | |    |
|    | | Product: Oxford Shirt                      | |    |
|    | | Quantity: 100 units                        | |    |
|    | | Total Price: EUR 1885.00                   | |    |
|    | |                                            | |    |
|    | | Lead time: Approx 3-4 weeks...            | |    |
|    | |                                            | |    |
|    | | Best regards,                              | |    |
|    | | Atelier Team                               | |    |
|    | +--------------------------------------------+ |    |
|    |                                                |    |
|    | Cancel       [Copy to Clipboard]               |    |
|    |              [Open in Email Client]             |    |
|    +------------------------------------------------+    |
|                                                          |
+----------------------------------------------------------+
```

- Modal overlay (bg-black/80)
- **Recipient:** read-only display "Name <email>"
- **Subject:** editable, pre-filled "Quote for [Product] - [Company]"
- **Body:** editable textarea (14 rows, monospace), pre-filled template with:
  - Greeting with customer name
  - Product name, quantity, total price
  - Lead time estimate
  - Call to action
  - Signature
- **Actions:**
  - Cancel (left, text button)
  - Copy to Clipboard (border button)
  - Open in Email Client (white bg, opens mailto: link)
- Escape key closes modal

---

## 16. Create Style from Quote Modal

```
+----------------------------------------------------------+
|                                                          |
|    +------------------------------------------------+    |
|    | Create Style from Quote                        |    |
|    |                                                |    |
|    | Style Name                                     |    |
|    | +--------------------------------------------+ |    |
|    | | Acme Corp Custom                           | |    |
|    | +--------------------------------------------+ |    |
|    |                                                |    |
|    | Concept              | Category                |    |
|    | +--------------------+ +---------------------+ |    |
|    | | Select concept   v | | Select concept 1st v| |    |
|    | +--------------------+ +---------------------+ |    |
|    |                                                |    |
|    | Gender               | Supplier                |    |
|    | +--------------------+ +---------------------+ |    |
|    | | Unisex           v | | None              v | |    |
|    | +--------------------+ +---------------------+ |    |
|    |                                                |    |
|    | Base Cost (EUR)                                |    |
|    | +--------------------+                         |    |
|    | |                    |                         |    |
|    | +--------------------+                         |    |
|    |                                                |    |
|    | Auto-fill from Quote                           |    |
|    | ----------------------------------------       |    |
|    | [x] Create 5 variants                          |    |
|    |     [M/Black x50] [L/Black x30] [XL/Navy x20] |    |
|    |                                                |    |
|    | [x] Use customer logo                          |    |
|    |     Will link to customization entry            |    |
|    |                                                |    |
|    | [x] Create customization entry                 |    |
|    |     [center front] [Embroidery]                |    |
|    |                                                |    |
|    |     Link logo for customization                |    |
|    |     +--------------------------------------+   |    |
|    |     | -- Select logo from library --     v |   |    |
|    |     +--------------------------------------+   |    |
|    |                                                |    |
|    | Cancel                [Create & Link to Quote] |    |
|    +------------------------------------------------+    |
|                                                          |
+----------------------------------------------------------+
```

- Modal overlay
- **Style Name:** pre-filled from product_name or company name or quote ID
- **Required fields:** Concept + Category (cascading dropdowns)
- **Optional:** Gender (default Unisex), Supplier, Base Cost
- **Auto-fill section** (checkboxes):
  - Create variants: shows variant pills from quote data
  - Use customer logo: if quote has logo_file_url
  - Create customization: shows placement/technique from quote prefs
  - Logo selector: dropdown of logos from library (shown when customization checked)
- **Actions:** Cancel + "Create & Link to Quote" (emerald bg, disabled without concept+category)
- **On create:** inserts style, variants, customization; updates quote to "converted"
- Escape key closes modal

---

## 17. Views List

**Route:** `/admin/views`

```
+----------------------------------------------------------+
| Views                                    [New View]      |
|                                                          |
| +----------------+ +----------------+ +----------------+ |
| | All Products   | | Spring 2026    | | Custom Order   | |
| | [Default]      | |                | |                | |
| | [Gallery]      | | [Grid]         | | [Gallery]      | |
| |                | |                | |                | |
| | 8 attributes   | | 5 attributes   | | 6 attributes   | |
| | 2 filters      | | 3 filters      | |                | |
| |                | |                | |                | |
| | [Open] [Edit]  | | [Open] [Edit]  | | [Open] [Edit]  | |
| +----------------+ +----------------+ +----------------+ |
+----------------------------------------------------------+
```

- Heading: "Views" (3xl bold) + "New View" button
- **Grid:** 3-column responsive (1 on mobile, 2 on md, 3 on lg)
- **Each card:**
  - View name (lg semibold)
  - Default badge: green bg if is_default
  - Type badge: Gallery = blue, Grid = purple
  - Attribute count + filter count
  - Two buttons: Open (white bg, link to render page), Edit (border, link to edit page)
- **Empty state:** "No views created yet." + description of views feature

---

## Status Badge Color Reference

| Status      | Background           | Border        | Text          |
|-------------|----------------------|---------------|---------------|
| New         | blue-900/50          | blue-700      | blue-200      |
| Reviewed    | yellow-900/50        | yellow-700    | yellow-200    |
| Quoted      | purple-900/50        | purple-700    | purple-200    |
| Accepted    | green-900/50         | green-700     | green-200     |
| Rejected    | red-900/50           | red-700       | red-200       |
| Converted   | emerald-900/50       | emerald-700   | emerald-200   |
| Active      | green-900            | —             | green-100     |
| Development | yellow-900           | —             | yellow-100    |
| Archived    | neutral-800          | —             | neutral-400   |

---

## Common UI Patterns

**Input fields:** bg-neutral-900, border-neutral-800, rounded, focus:border-neutral-600
**Primary buttons:** bg-white, text-black, font-medium, rounded
**Secondary buttons:** border border-neutral-700, text-neutral-300
**Danger buttons:** text-red-400, border-red-900
**Cards:** border border-neutral-800, rounded-lg, p-6
**Section headers:** text-sm, font-semibold, text-neutral-400, uppercase, tracking-wide
**Empty states:** dashed border, centered icon + heading + description + CTA button
**Modals:** fixed overlay bg-black/80, centered card bg-neutral-950, Escape to close
**Toasts:** Sonner library, appears top-right
**Keyboard shortcuts:** Cmd+S to save (forms), Escape to close (modals)
**Loading states:** Button text changes to "Loading..."/"Saving..."/"Creating..."
**Sidebar:** Collapsible left sidebar (`w-56`), sections expand/collapse, active route highlighted
