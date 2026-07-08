# NAREN'S STUDIO — COMPLETE TEST CASES
# Run through each section manually after setup. Mark ✅ PASS or ❌ FAIL.
# Last updated: Phase 1–5 complete

---

## 🔐 AUTH — Login & Access Control

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| A1 | Admin login | Go to /login, enter admin email+password | Redirects to /admin dashboard | |
| A2 | Client login | Go to /login, enter client email+password | Redirects to /client/dashboard | |
| A3 | Wrong password | Enter correct email, wrong password | Shows "Invalid credentials" error | |
| A4 | Self-registration blocked | Try to access /signup or click any register link | No such page exists; invite-only notice shown on login | |
| A5 | Client can't access admin | Login as client, manually go to /admin | Redirected away (403) | |
| A6 | Admin can't access /client | Login as admin, go to /client/dashboard | Redirected away (403) | |
| A7 | Guest can't access client routes | Not logged in, go to /client/gallery | Redirected to /login | |
| A8 | Login redirect | Visit /client/gallery as guest, login | Lands on /client/gallery after login | |
| A9 | Logout from navbar | Click logout icon in navbar | Session cleared, redirected to / | |
| A10 | Logout from mobile menu | Open mobile nav, tap Sign Out | Session cleared, redirected to / | |
| A11 | Splash screen | Load the app fresh | 3D logo spins in, loading bar completes, then main app appears | |

---

## 🌐 PUBLIC PAGES

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| P1 | Home page loads | Visit / without login | Full landing page visible — hero, stats, features, how-it-works, CTA | |
| P2 | 3D floating logo | Hover over logo in hero | Logo floats in 3D with orange glow | |
| P3 | Gallery page | Visit /gallery | Studio portfolio grid + "Client Login" CTA visible | |
| P4 | Frame Shop page | Visit /shop | Product cards shown; "Access Client Portal" CTA | |
| P5 | About page | Visit /about | Studio info, location, language section visible | |
| P6 | Nav active state | Click each nav link | Active link shows orange color + focus dot | |
| P7 | Nav scroll effect | Scroll down on any page | Navbar darkens + bottom border appears | |
| P8 | Mobile nav open | Resize to mobile, tap camera icon | Slide-in panel from right with camera theme | |
| P9 | Mobile nav links | Open mobile nav, tap Gallery | Nav closes, navigates to /gallery | |
| P10 | Mobile nav filmstrip | Open mobile menu | Decorative filmstrip strip visible at top of panel | |
| P11 | Mobile nav aperture | Open mobile menu | Aperture icon visible as divider between nav and account sections | |

---

## 👤 ADMIN — Client Management

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| C1 | View clients list | Admin → Clients | Table shows all clients with email, phone, language, joined date | |
| C2 | Search clients | Type in search box | Table filters in real-time | |
| C3 | Create client | Click "New Client", fill form, submit | Success toast; client appears in table | |
| C4 | Client email validation | Enter invalid email in create form | Form rejects before submit | |
| C5 | Password min length | Enter 5-char password | Form rejects (min 8 chars) | |
| C6 | Duplicate email | Create client with existing email | Backend returns error: email already exists | |
| C7 | Language selection | Create client with Tamil selected | Client's preferred_lang = 'ta' in DB | |

---

## ⚡ ADMIN — Live Sessions

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| S1 | Sessions list | Admin → Sessions | Stats row + list of sessions | |
| S2 | No sessions state | Empty DB | "No sessions yet" state with Start button | |
| S3 | Start session — no client | Admin → Sessions → New, submit without client | Error: select client | |
| S4 | Start session — valid | Select client + package, click Start | Session created, QR URL generated and shown | |
| S5 | Copy QR link | Click "QR Link" button on active session | Clipboard filled, toast shows "QR link copied!" | |
| S6 | Complete session | Click "Complete" on active session | Status changes to COMPLETED, ended_at set | |
| S7 | Gallery auto-created | After session created | Gallery row appears in galleries table automatically (trigger) | |
| S8 | Session duration | Active session shows duration | e.g. "23m" or "1h 5m" | |

---

## 🖼️ ADMIN — Gallery Management

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| G1 | View galleries | Admin → Galleries | List with client name, status badge, progress bar | |
| G2 | Gallery search | Type client name | Filters in real-time | |
| G3 | Filter by status | Click ACTIVE / EXPIRED / ARCHIVED | List filters accordingly | |
| G4 | Click gallery row | Click any gallery | Side detail panel opens | |
| G5 | Expiry countdown | Gallery with 5 days left | Shows yellow "5d left" warning | |
| G6 | Extend gallery | Select +30 days, click Extend | expires_at updated, status set ACTIVE, success toast | |
| G7 | Archive gallery | Click Archive in side panel | Status set to ARCHIVED, side panel closes | |
| G8 | View photos button | Click "View Photos" | Navigates to /admin/galleries/:id/photos | |
| G9 | No relationship error | Open galleries page | No "multiple relationship" error in console | |

---

## 📸 ADMIN — Gallery Photos

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| GP1 | Photo grid view | Open gallery photos | Grid of photos with selection badges | |
| GP2 | List view toggle | Click list icon | Switches to list view with metadata | |
| GP3 | Filter SELECTED | Click SELECTED tab | Only SELECTED photos shown | |
| GP4 | Filter UNSORTED | Click UNSORTED tab | Only untagged photos shown | |
| GP5 | Filter HIDDEN | Click HIDDEN tab | Only hidden photos shown | |
| GP6 | Hide photo | Hover photo, click eye-off icon | Photo hidden from client; badge appears | |
| GP7 | Unhide photo | Click eye icon on hidden photo | Photo visible to client again | |
| GP8 | Lightbox | Click zoom icon on any photo | Full-screen lightbox opens | |
| GP9 | Selection progress | Gallery with 10 selected | Progress bar and "10/20" shown | |
| GP10 | Count badges | Gallery stats row | Total, Selected, Trashed, Hidden counts accurate | |

---

## 📦 ADMIN — Packages

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| PK1 | View packages | Admin → Packages | Cards with colored tier, price, limits | |
| PK2 | Create package | Click "New Package", fill all fields | Package card appears with correct color | |
| PK3 | Edit package | Click Edit on a package | Modal pre-fills with existing values | |
| PK4 | Save edit | Change price, save | Card updates with new price | |
| PK5 | Toggle active | Click eye icon on package | Card dims if deactivated | |
| PK6 | Required fields | Submit empty form | Form rejects with HTML validation | |
| PK7 | "Add Package" card | Click the dashed card | Opens create modal | |

---

## 🖼️ ADMIN — Products

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| PR1 | View products | Admin → Products | Grid of product cards with thumbnails | |
| PR2 | Create product — no image | Submit form without any image | Error: "At least one product image is required" | |
| PR3 | Upload main image | Click Photo 1 slot, select image | Preview appears in slot | |
| PR4 | Upload optional images | Upload 2nd, 3rd, 4th images | All previews shown; slots fill independently | |
| PR5 | Upload video | Click video slot, select MP4 | Video preview with play icon shown | |
| PR6 | Remove image | Click × on image slot | Slot clears back to empty state | |
| PR7 | Remove video | Click × on video slot | Video slot clears | |
| PR8 | Save with 1 image | Fill details + 1 image, save | Product created; thumbnail shows in grid | |
| PR9 | Edit product | Click edit icon | Modal pre-fills with all existing data and media previews | |
| PR10 | Toggle active | Click eye icon | Product hidden from client shop | |
| PR11 | Invalid JSON sizes | Enter bad JSON in sizes field | Error toast: "Invalid sizes JSON" | |
| PR12 | Image count badge | Product with 3 images | Badge "🖷 3" visible on card thumbnail | |
| PR13 | Video badge | Product with video | "▶ Video" badge visible on card | |

---

## 📋 ADMIN — Orders Kanban

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| OR1 | View kanban | Admin → Orders | 4 columns: NEW / IN PRODUCTION / READY / DELIVERED | |
| OR2 | Revenue stats | Orders with paid status | Revenue Paid stat shows correct total | |
| OR3 | Move order | Click "Move to IN PRODUCTION" | Card moves to next column | |
| OR4 | Mark cash paid | Cash order — click "Paid ✓" | payment_status = PAID, badge turns green | |
| OR5 | Filter unpaid | Click "Unpaid Only" | Only orders with non-PAID status shown | |
| OR6 | Client phone link | Order card with phone | Phone number is a tel: link | |
| OR7 | Empty column | Column with no orders | Shows "Empty" placeholder text | |

---

## ⚙️ ADMIN — Settings

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| ST1 | View settings | Admin → Settings | All fields shown: Studio Name, WhatsApp, Razorpay x2, Language | |
| ST2 | Click Edit — WhatsApp | Click Edit on WhatsApp | Field turns into input box; Cancel and ✓ buttons appear | |
| ST3 | Save WhatsApp | Enter "+91 9876543210", click ✓ | Input disappears, new value shown, success toast | |
| ST4 | Cancel edit | Click Edit, then Cancel | Field reverts to previous value | |
| ST5 | Password field masking | Razorpay fields | Values shown as bullets ••••••• | |
| ST6 | Show/hide password | Click eye icon while editing | Toggles between hidden and visible text | |
| ST7 | Language dropdown | Edit Default Language | Dropdown shows English, தமிழ், हिन्दी | |
| ST8 | Studio Name not editable | Studio Name row | No Edit button shown | |

---

## 🖼️ CLIENT — Gallery

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| CG1 | View gallery | Client → My Gallery | Sidebar with gallery list; photos in main area | |
| CG2 | Auto-open active gallery | Login as client with 1 active gallery | Gallery auto-selected and photos loaded | |
| CG3 | Select photo | Hover photo, click "Select" | Green border, checkmark badge; counter increments | |
| CG4 | Toggle select off | Click "Selected" button on already-selected photo | Photo deselected; counter decrements | |
| CG5 | Trash photo | Click "Remove" on photo | Red border applied | |
| CG6 | Selection limit | Select max photos (e.g. 20) | 21st photo's Select button is greyed out with cursor:not-allowed | |
| CG7 | Limit toast | Attempt to select over limit | Error toast: "Selection limit of X reached" | |
| CG8 | Filter SELECTED | Click SELECTED tab | Only selected photos shown | |
| CG9 | Filter UNSORTED | Click UNSORTED tab | Only untagged photos shown | |
| CG10 | Expiry warning | Gallery with ≤7 days left | Yellow warning banner shown | |
| CG11 | Instructions banner | Gallery with 0 selections | Blue info banner explaining how to select | |
| CG12 | Lightbox open | Click zoom icon | Fullscreen lightbox with Select/Remove buttons | |
| CG13 | Lightbox select | Click Select in lightbox | Photo selected; lightbox closes | |
| CG14 | Completion CTA | Select all max photos | Green "Order Frames →" bar appears at bottom | |
| CG15 | No gallery state | Client with no sessions | "No Gallery Yet" empty state shown | |

---

## 🛒 CLIENT — Frame Shop

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| SH1 | Step 1 — Gallery tab | Open shop | Gallery tab active by default; selected photos shown | |
| SH2 | Gallery tab no photos | Client with no selections | Empty state + "Go to Gallery" and "Upload Instead" buttons | |
| SH3 | Select gallery photo | Click photo thumbnail | Orange border + checkmark; mini-preview shown at bottom | |
| SH4 | Upload tab | Click "Upload from Device" | Upload drop zone shown with info banner | |
| SH5 | Drag & drop | Drag image file onto drop zone | File preview appears | |
| SH6 | Browse files | Click "Browse Files" | OS file picker opens | |
| SH7 | Invalid file type | Drop a .pdf file | Error toast: "Only JPEG, PNG, WebP or HEIC allowed" | |
| SH8 | File over 10MB | Drop file >10MB | Error toast: "Max 10MB" | |
| SH9 | Remove uploaded | Click × on preview | Drop zone clears back to empty | |
| SH10 | Selected photo preview | After choosing photo | Mini thumbnail + source label shown before Next button | |
| SH11 | Step 2 — Product | Choose photo, click Next | Product grid shown | |
| SH12 | Select product | Click product card | Orange border; "Selected" label appears | |
| SH13 | Step 3 — Size | Choose product, click Next | Left: live frame mockup; Right: size grid | |
| SH14 | Frame preview update | Select different product | Mockup border/style changes (wood for resin, LED glow for LED panel) | |
| SH15 | Preview with photo | Photo visible in frame mockup | Uploaded or gallery photo shown inside frame | |
| SH16 | Size selection | Click a size | Size highlights in orange; price updates | |
| SH17 | Quantity change | Click + and − | Quantity and total update | |
| SH18 | Total price | Size × qty shown | Correct calculation | |
| SH19 | Step 4 — Payment | Choose size, click Next | Payment method selection shown | |
| SH20 | Payment selection | Click UPI radio | UPI highlighted | |
| SH21 | Address optional | Leave address blank | Order still places successfully | |
| SH22 | Place order — gallery photo | Complete all steps with gallery photo | Order created; Step 5 confirmation shown | |
| SH23 | Place order — local upload | Complete all steps with uploaded photo | Photo uploaded to storage; order created; confirmation shown | |
| SH24 | Upload progress | Place order with local photo | Button shows "Uploading…" then "Placing…" | |
| SH25 | Order number shown | Step 5 confirmation | Order # visible in orange pill | |
| SH26 | Photo source label | Step 5 summary | Shows "📤 Your upload" or "🖼️ Gallery photo" | |
| SH27 | Track Orders button | Click on Step 5 | Navigates to /client/orders | |
| SH28 | Back navigation | Click Back at any step | Goes to previous step without losing selections | |
| SH29 | Step dots | Progress through steps | Completed steps show green ✓ dot | |

---

## 📦 CLIENT — Orders

| # | Test | Steps | Expected | Status |
|---|------|-------|----------|--------|
| CO1 | View orders | Client → My Orders | List of expandable order cards | |
| CO2 | No orders state | New client | Empty state with "Head to Frame Shop" message | |
| CO3 | Expand order | Click order card | Order expands showing timeline + details | |
| CO4 | Production timeline | Active order | Stage dots show correct stage highlighted in orange | |
| CO5 | Delivered order | Delivered order | All 4 timeline stages show green | |
| CO6 | Payment badge | Paid order | Green "Paid" badge shown | |
| CO7 | Cash pending notice | Cash order not yet paid | Yellow "Cash payment due at studio" note | |
| CO8 | Awaiting payment notice | Razorpay/UPI order | Blue "Payment link will be sent" note | |
| CO9 | Filter ACTIVE | Click Active tab | Only in-progress orders shown | |
| CO10 | Filter DONE | Click Done tab | Only delivered orders shown | |
| CO11 | Admin notes | Admin added note to order | Note shown in blue "Note from Studio" box | |

---

## 🔗 INTEGRATION FLOWS

| # | Test | Flow | Expected | Status |
|---|------|------|----------|--------|
| I1 | Full client journey | Admin creates client → client logs in → admin starts session → client joins via QR → session completes → gallery created → client selects photos → client orders frame → admin moves order through kanban | All steps work end-to-end | |
| I2 | Local upload order | Client uploads their own photo → selects product + size → places order → admin sees it in kanban NEW column | Order has frame_config.source = "local_upload" | |
| I3 | Gallery expiry | Admin extends expired gallery | Status resets to ACTIVE; new expiry shown | |
| I4 | Multi-gallery client | Client with 2 galleries | Sidebar shows both; clicking switches photos | |

---

## 🐛 KNOWN ISSUES TRACKER

| # | Issue | Fix Applied | Status |
|---|-------|-------------|--------|
| BUG-01 | `they're` apostrophe in Home.jsx broke parser | Changed to double-quoted string | ✅ Fixed |
| BUG-02 | `../lib/store` wrong import depth in admin pages | Changed to `../../lib/store` | ✅ Fixed |
| BUG-03 | Invalid API key on login | .env not filled with real Supabase keys | ✅ Fixed |
| BUG-04 | 500 on user profile fetch after login | RLS infinite recursion; fixed with `auth.jwt()` policies + metadata | ✅ Fixed |
| BUG-05 | `relation "users" does not exist` | Schema not run yet | ✅ Fixed |
| BUG-06 | `type "user_role" already exists` | Used `DO $$ BEGIN...EXCEPTION` wrappers | ✅ Fixed |
| BUG-07 | Storage policy `IF NOT EXISTS` syntax error | Removed; use `DROP IF EXISTS` + CREATE | ✅ Fixed |
| BUG-08 | Multiple relationship error galleries↔photos | Added `!photos_gallery_id_fkey` FK hint to all queries + dropped circular cover_photo_id FK | ✅ Fixed |
| BUG-09 | Settings Edit button did nothing | Rewrote Settings page with full inline edit state | ✅ Fixed |
| BUG-10 | Logout button not working from home | handleSignOut was defined but navigate wasn't called properly; fixed + added replace:true | ✅ Fixed |
| BUG-11 | Packages page showed placeholder | Built full Packages CRUD page | ✅ Fixed |
| BUG-12 | Products had no media | Rebuilt Products page with 4-image + 1-video upload per product | ✅ Fixed |

---

## 📋 SQL TO RUN IN ORDER

Run these files in Supabase SQL Editor, in this order:

```
1. supabase_schema_safe.sql          — Main schema (safe re-run)
2. supabase_phase3_fixed.sql         — Phase 3: gallery trigger, storage policies
3. supabase_phase4.sql               — Phase 4: order columns
4. supabase_fix_relationships.sql    — Drop circular FK causing embed errors
5. supabase_products_media.sql       — Product media bucket + columns
```

Then manually:
```sql
-- Create settings table
CREATE TABLE IF NOT EXISTS studio_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin
INSERT INTO users (id, full_name, email, role)
VALUES ('YOUR-UUID', 'Naren', 'naren@narensstudio.com', 'ADMIN')
ON CONFLICT (id) DO NOTHING;

-- Push ADMIN role into JWT
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"ADMIN"}'::jsonb
WHERE id = 'YOUR-UUID';
```

---

## 📁 FILES TO COPY INTO PROJECT

```
src/
├── App.jsx                              ← updated (all phases wired)
├── components/
│   └── Navbar.jsx                       ← camera-themed, mobile-responsive
├── lib/
│   └── i18n.js                          ← Phase 5: multi-language hook
├── pages/
│   ├── admin/
│   │   ├── AdminPlaceholders.jsx        ← cleared (all pages real now)
│   │   ├── Galleries.jsx                ← FK hint fix
│   │   ├── GalleryPhotos.jsx            ← FK hint fix
│   │   ├── Packages.jsx                 ← NEW: full CRUD
│   │   ├── Products.jsx                 ← NEW: with 4-image + video upload
│   │   └── Settings.jsx                 ← NEW: working inline edit
│   └── client/
│       ├── Gallery.jsx                  ← FK hint fix
│       └── Shop.jsx                     ← local upload from device feature

supabase_fix_relationships.sql           ← fix embed error
supabase_products_media.sql              ← product media bucket
```
