Zentry Hub — Engineering Blueprint V2 | Naren's Studio
NS
ZENTRY HUB
ENGINEERING BLUEPRINT · V2.0
Daemon
Watermark
Calendar
DB Schema
Advanced
TECHNICAL DEEP-DIVE · PRODUCTION-READY · V2.0
NAREN'S 
STUDIO
ENGINEERING BLUEPRINT
Architecture modifications, WebSocket pipelines, geofencing calendar logic, and a complete PostgreSQL DDL for the Zentry Hub platform.
01 · Architecture Decoupling
LOCAL CAMERA DAEMON — TETHERING ARCHITECTURE
    Browsers cannot access the local filesystem directly (sandboxed by design). The solution is a lightweight
local Node.js daemon
 running natively on the studio workstation that bridges the camera hot-folder to your
    cloud backend via a private authenticated WebSocket or HTTP tunnel. This is the only secure, reliable way to
    achieve sub-second raw-file-to-client-screen delivery.
SYSTEM ARCHITECTURE — TWO PROCESSES, ONE PIPELINE
📷 Tethered Camera
Shoots RAW (CR3/ARW/NEF) → dumps to hot-folder via Capture One / DigiCamControl / native USB tether
🖥️ Studio Workstation Daemon
chokidar watches hot-folder · Sharp converts RAW→JPEG + watermark · pushes to Express API via authenticated HTTP POST or direct WS emit
☁️ Express / Node.js Backend (Render.com)
Receives processed JPEG bytes · uploads to Cloudflare R2 · writes DB record · emits 
photo:new
 to client Socket.io room
⚡ Socket.io Client Room
Client browser in the session room receives signed R2 URL in real-time · renders photo
💾 NAS / Local Archive
Post-session BullMQ archive job pulls originals from daemon local disk, transfers via SFTP/local move, marks is_archived=true
⚠️
Why NOT an Electron App?
Electron adds ~200MB binary overhead and complex auto-update pipelines. A plain Node.js daemon (installable via 
npm i -g narens-daemon
) runs as a background service using 
pm2
 or 
node-windows
/
launchd
 — zero UI, zero overhead, fully scriptable, restartable on crash.
DAEMON BOOTSTRAP — INSTALL ONCE ON STUDIO MACHINE
# Install globally on studio workstation
npm
 install 
-g
 pm2
npm
 install chokidar sharp @aws-sdk/client-s3 axios dotenv socket.io-client
# .env on studio machine
DAEMON_SECRET
=
super_long_random_hex_64
# shared secret, never in git
API_BASE
=
https://api.narenstudio.in
HOT_FOLDER
=
C:\NarenStudio\HotFolder
# or /Users/naren/HotFolder on Mac
NAS_ROOT
=
\\NAS\sessions
# UNC path or /mnt/nas
R2_ENDPOINT
=
https://&lt;account&gt;.r2.cloudflarestorage.com
R2_ACCESS_KEY
=
...
R2_SECRET_KEY
=
...
R2_BUCKET
=
narens-live
DAEMON CORE — daemon/index.js
const
 chokidar = 
require
(
'chokidar'
);
const
 sharp    = 
require
(
'sharp'
);
const
 axios    = 
require
(
'axios'
);
const
 path     = 
require
(
'path'
);
const
 fs       = 
require
(
'fs'
);
const
 { S3Client, PutObjectCommand } = 
require
(
'@aws-sdk/client-s3'
);
require
(
'dotenv'
).config();
const
 r2 = 
new
S3Client
({
  region: 
'auto'
,
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
});
// Active session state — polled from backend every 5s
let
 activeSession = 
null
;
async function
pollActiveSession
() {
try
 {
const
 { data } = 
await
 axios.get(
`${process.env.API_BASE}/daemon/session`
, {
      headers: { 
'x-daemon-secret'
: process.env.DAEMON_SECRET }
    });
    activeSession = data.session; 
// null if no LIVE session
  } 
catch
 (e) { console.error(
'Poll error'
, e.message); }
}
setInterval
(pollActiveSession, 
5000
);
pollActiveSession
();
// Queue: prevents concurrent Sharp workers overwhelming the machine
const
 queue = [];
let
 processing = 
false
;
async function
processNext
() {
if
 (processing || queue.length === 
0
) 
return
;
  processing = 
true
;
const
 filePath = queue.shift();
try
 {
await
processFile
(filePath);
  } 
finally
 {
    processing = 
false
;
processNext
();
  }
}
async function
processFile
(filePath) {
if
 (!activeSession || activeSession.status !== 
'LIVE'
) 
return
;
const
 { sessionId, watermarkPath, watermarkPosition,
           watermarkScale, compressionLevel } = activeSession;
const
 originalFilename = path.basename(filePath);
const
 outKey = 
`sessions/${sessionId}/${originalFilename.replace(/\.\w+$/, '')}.jpg`
;
// Sharp pipeline: decode → resize → composite watermark → JPEG compress
let
 pipeline = sharp(filePath, { failOnError: 
false
 })
    .rotate() 
// auto-orient from EXIF
    .resize({ width: 
2400
, withoutEnlargement: 
true
 })
    .jpeg({ quality: 
mapCompression
(compressionLevel), mozjpeg: 
true
 });
if
 (watermarkPath) {
const
 wm = 
await
buildWatermark
(watermarkPath, watermarkPosition, watermarkScale);
    pipeline = pipeline.composite([{ input: wm, gravity: watermarkPosition }]);
  }
const
 buffer = 
await
 pipeline.toBuffer();
await
 r2.send(
new
 PutObjectCommand({
    Bucket: process.env.R2_BUCKET, Key: outKey,
    Body: buffer, ContentType: 
'image/jpeg'
  }));
await
 axios.post(
`${process.env.API_BASE}/daemon/photo-ready`
, {
    sessionId, originalFilename, r2Key: outKey
  }, { headers: { 
'x-daemon-secret'
: process.env.DAEMON_SECRET } });
}
chokidar
.watch(process.env.HOT_FOLDER, {
  persistent: 
true
, ignoreInitial: 
true
,
  awaitWriteFinish: { stabilityThreshold: 
1500
, pollInterval: 
300
 }
}).on(
'add'
, (filePath) => {
if
 (/\.(cr3|arw|nef|cr2|raf|dng|jpg|jpeg)$/i.test(filePath)) {
    queue.push(filePath);
processNext
();
  }
});
console.log(
'🎞️  Naren\'s Studio daemon running — watching'
, process.env.HOT_FOLDER);
BACKEND DAEMON RECEIVER — Express Endpoint
// POST /daemon/photo-ready — internal only, guarded by daemon secret
router.post(
'/photo-ready'
, 
daemonAuth
, 
async
 (req, res) => {
const
 { sessionId, originalFilename, r2Key } = req.body;
const
 signedUrl = 
await
getR2SignedUrl
(r2Key, 
3600
); 
// 1hr expiry
// Persist to DB
const
 photo = 
await
 supabase.from(
'photos'
).insert({
    session_id: sessionId,
    filename: originalFilename,
    proxy_url: signedUrl,
    r2_key: r2Key,
    client_choice: 
'PENDING'
,
    watermark_applied: 
true
  }).select().single();
// Push to all sockets in this session room
  io.to(
`session:${sessionId}`
).emit(
'photo:new'
, {
    id: photo.data.id,
    filename: originalFilename,
    url: signedUrl
  });
  res.json({ ok: 
true
 });
});
✅
Process Manager: pm2
pm2 start daemon/index.js --name narens-daemon --watch false -- restart-delay=3000
 — auto-restarts on crash, survives machine reboots with 
pm2 startup
. Logs visible with 
pm2 logs narens-daemon
.
02 · Dynamic Watermark Engineering
LIVE WATERMARK — WEBSOCKET EVENT PIPELINE
    The security watermark in Engine B serves two entirely different functions that must be handled at two separate layers:
server-burned watermarks
 (permanent, in JPEG pixels — for file protection) and
client-side canvas overlays
 (CSS/Canvas DOM manipulation — for live admin adjustability without
    re-processing). Understanding this split is the entire architecture insight.
🔒 LAYER 1 — SERVER-BURNED (JPEG)
Applied by Sharp during initial processing. Cannot be adjusted live. This is the 
fallback protection
 — even if the client screenshots or right-clicks, the underlying file is already watermarked. Opacity: ~15%. Position: center. Scale: 40% of image width.
Permanent in pixels
Not adjustable live
Defense against screen capture
🎨 LAYER 2 — CLIENT CANVAS OVERLAY (DOM)
A transparent 
&lt;canvas&gt;
 or 
&lt;div&gt;
 absolutely positioned over the 
&lt;img&gt;
 tag. Renders the studio logo/text via Canvas 2D API. Admin controls position, opacity, scale, and text 
live via WebSocket
 — no file reprocessing. Opacity: 40–70%.
Admin-adjustable live
DOM only — not in file
Zero server lag
💡
The Core Security Insight
The canvas overlay is purely visual presentation. The underlying JPEG already has the light server-burned watermark baked in. Even if a technically savvy user disables the canvas overlay via DevTools, they still get a watermarked JPEG. The canvas layer is for visible deterrence — its adjustability is a UX feature, not a security feature.
WEBSOCKET EVENT PIPELINE — FULL TRACE
👨‍💼
Admin Panel
Changes opacity slider or text
→
📡
Emit WS Event
watermark:update → server
→
🔁
Socket.io Server
Broadcasts to session room
→
📡
All Clients Receive
watermark:config event
→
🖼️
Canvas Re-render
requestAnimationFrame redraws overlay
→
✅
Instant Visual
&lt;2ms DOM repaint, zero server I/O
WEBSOCKET EVENT SPECIFICATION
Event Name
Direction
Payload
Description
watermark:update
Admin→Server
{ opacity, scale, position, text, color }
Admin changes any watermark param
watermark:config
Server→All Clients
{ opacity, scale, position, text, color, sessionId }
Server broadcasts to session room
watermark:ack
Client→Server
{ clientId, ts }
Optional acknowledgement for latency logging
session:state
Server→All Clients
{ status: 'PAUSED'|'LIVE'|'COMPLETED' }
Session lifecycle changes
photo:new
Server→Clients
{ id, filename, url }
New photo added to selection room
selection:limit_update
Server→Clients
{ newLimit, sessionId }
Admin updates max selection count live
CLIENT-SIDE CANVAS OVERLAY — React Component
// WatermarkCanvas.jsx — overlaid absolutely on top of each &lt;img&gt;
import
 { useEffect, useRef } 
from
'react'
;
export function
WatermarkCanvas
({ config, imageRef }) {
const
 canvasRef = useRef(
null
);
  useEffect(() => {
const
 canvas = canvasRef.current;
const
 img    = imageRef.current;
if
 (!canvas || !img) 
return
;
const
 ctx = canvas.getContext(
'2d'
);
    canvas.width  = img.naturalWidth  || img.offsetWidth;
    canvas.height = img.naturalHeight || img.offsetHeight;
    ctx.clearRect(
0
, 
0
, canvas.width, canvas.height);
const
 { opacity, scale, position, text, color } = config;
    ctx.globalAlpha = opacity; 
// 0.0 – 1.0
    ctx.fillStyle   = color || 
'rgba(255,255,255,0.85)'
;
const
 fontSize = Math.floor(canvas.width * scale * 
0.08
);
    ctx.font        = 
`bold ${fontSize}px 'Bebas Neue', sans-serif`
;
    ctx.textAlign   = 
'center'
;
    ctx.textBaseline= 
'middle'
;
// Diagonal tiled repeat — hardest to crop out
    ctx.save();
    ctx.translate(canvas.width / 
2
, canvas.height / 
2
);
    ctx.rotate(
-
Math.PI / 
6
); 
// -30°
const
 cols = Math.ceil(canvas.width  / (fontSize * 
8
)) + 
2
;
const
 rows = Math.ceil(canvas.height / (fontSize * 
3
)) + 
2
;
for
 (
let
 r = 
-
rows; r 
for
 (
let
 c = 
-
cols; c 
'© NAREN\'S STUDIO'
,
          c * fontSize * 
8
, r * fontSize * 
3
);
      }
    }
    ctx.restore();
  }, [config]);
return
 (
    &lt;
canvas
 ref={canvasRef}
      style={{ position: 
'absolute'
, inset: 
0
, pointerEvents: 
'none'
,
               width: 
'100%'
, height: 
'100%'
 }} /&gt;
  );
}
// In SelectionRoom.jsx:
// socket.on('watermark:config', (cfg) => setWatermarkConfig(cfg));
// Wrap each &lt;img&gt; in &lt;div style={{position:'relative'}}&gt;&lt;img /&gt;&lt;WatermarkCanvas .../&gt;&lt;/div&gt;
✅
No Session Pause Required
Because watermark updates only touch the DOM canvas layer (not the JPEG on disk), the admin can change opacity, scale, text, or position at any time without pausing the session. The server-side config in Redis/DB is also updated for new clients who join mid-session.
03 · Multi-Team Calendar Logic
RESOURCE ALLOCATION ENGINE — GEOFENCED CALENDAR
    The key paradigm shift: individual staff and equipment kits are each treated as independent bookable
resources
 — not the studio as a monolith. Multiple bookings can coexist simultaneously
    as long as different resources are assigned. Geofencing calculates transit impossibility automatically.
🗂️ RESOURCE ENTITY MODEL
Each bookable asset is a row in 
studio_resources
:
PHOTOGRAPHER
VIDEOGRAPHER
DRONE_OPERATOR
EQUIPMENT_KIT
VEHICLE
Each resource has its own booking calendar. Booking = start/end time + venue coordinates. Buffer windows are auto-inserted before and after each assignment.
🧮 FEASIBILITY ALGORITHM
1
Parse venue coordinates
 from booking form (Google Places autocomplete → lat/lng)
2
Calculate transit time
 via Google Maps Distance Matrix API (or Nominatim + OSRM for zero-cost fallback)
3
Add 2hr buffer
 before (setup) and after (teardown) each assignment
4
Check resource calendar
 for any overlap in the buffered window
5
If conflict
, flag with transit warning and offer alternative resources
BOOKING CREATION ALGORITHM — Node.js Service
// services/bookingFeasibility.js
const
 SETUP_BUFFER_MS  = 
2
 * 
60
 * 
60
 * 
1000
; 
// 2 hours in ms
async function
checkResourceFeasibility
(resourceId, proposedStart, proposedEnd, venueCoords) {
// 1. Fetch the most recent assignment for this resource before proposedStart
const
 prevAssignment = 
await
 db.query(
`
    SELECT ra.*, b.venue_lat, b.venue_lng, b.event_end
    FROM   resource_assignments ra
    JOIN   bookings b ON b.id = ra.booking_id
    WHERE  ra.resource_id = $1
      AND  b.event_end + INTERVAL '2 hours' > $2::timestamptz
      AND  b.event_start &lt; $3::timestamptz
    ORDER  BY b.event_end DESC LIMIT 1
  `
, [resourceId, proposedStart, proposedEnd]);
if
 (prevAssignment.rows.length === 
0
) 
return
 { feasible: 
true
 };
const
 prev = prevAssignment.rows[
0
];
const
 prevEventEnd = 
new
 Date(prev.event_end);
const
 bufferEnd    = 
new
 Date(prevEventEnd.getTime() + SETUP_BUFFER_MS);
// 2. Direct time overlap check (before even calling Maps API)
if
 (bufferEnd > 
new
 Date(proposedStart)) {
// 3. Fetch transit time between previous venue and new venue
const
 transitSecs = 
await
getTransitTime
(
      { lat: prev.venue_lat, lng: prev.venue_lng },
      venueCoords
    );
const
 earliestFeasibleStart = 
new
 Date(
      prevEventEnd.getTime() + SETUP_BUFFER_MS + transitSecs * 
1000
    );
if
 (earliestFeasibleStart > 
new
 Date(proposedStart)) {
return
 {
        feasible: 
false
,
        reason: 
'TRANSIT_IMPOSSIBLE'
,
        details: {
          prevVenue: { lat: prev.venue_lat, lng: prev.venue_lng },
          newVenue: venueCoords,
          transitMinutes: Math.ceil(transitSecs / 
60
),
          bufferMinutes: 
120
,
          earliestFeasibleStart: earliestFeasibleStart.toISOString(),
          proposedStart
        }
      };
    }
  }
return
 { feasible: 
true
 };
}
// OSRM fallback for zero-cost transit (no Maps API key needed)
async function
getTransitTime
(origin, dest) {
const
 url = 
`http://router.project-osrm.org/route/v1/driving/`
    + 
`${origin.lng},${origin.lat};${dest.lng},${dest.lat}?overview=false`
;
const
 { data } = 
await
 axios.get(url);
return
 data.routes[
0
]?.duration ?? 
7200
; 
// default 2hr if API fails
}
BOOKING CREATION FLOW WITH VETO OVERRIDE
// POST /api/bookings — Admin creates a booking with resource assignments
router.post(
'/bookings'
, 
adminAuth
, 
async
 (req, res) => {
const
 {
    clientId, packageId, venueAddress, venueCoords,
    eventStart, eventEnd, resourceIds,
    adminOverride = 
false
,  
// explicit checkbox on frontend
    overrideReason = 
null
  } = req.body;
const
 bufferStart = 
new
 Date(
new
 Date(eventStart).getTime() - SETUP_BUFFER_MS);
const
 bufferEnd   = 
new
 Date(
new
 Date(eventEnd).getTime()   + SETUP_BUFFER_MS);
const
 conflicts = [];
for
 (
const
 resourceId 
of
 resourceIds) {
const
 result = 
await
checkResourceFeasibility
(
      resourceId, eventStart, eventEnd, venueCoords
    );
if
 (!result.feasible) conflicts.push({ resourceId, ...result });
  }
if
 (conflicts.length > 
0
 && !adminOverride) {
return
 res.status(
409
).json({
      error: 
'FEASIBILITY_CONFLICT'
,
      conflicts,
      message: 
'Set adminOverride=true with overrideReason to force booking'
    });
  }
// Insert booking with buffer columns + optional override audit trail
const
 booking = 
await
 db.query(
`
    INSERT INTO bookings
      (client_id, package_id, venue_address, venue_lat, venue_lng,
       event_start, event_end, buffer_start_time, buffer_end_time,
       admin_override, override_reason, override_by, override_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, NOW())
    RETURNING *
  `
, [clientId, packageId, venueAddress, venueCoords.lat, venueCoords.lng,
       eventStart, eventEnd, bufferStart, bufferEnd,
       adminOverride, overrideReason, req.user.id]);
for
 (
const
 resourceId 
of
 resourceIds) {
await
 db.query(
`
      INSERT INTO resource_assignments (booking_id, resource_id, buffer_start, buffer_end)
      VALUES ($1, $2, $3, $4)
    `
, [booking.rows[
0
].id, resourceId, bufferStart, bufferEnd]);
  }
  res.json({ booking: booking.rows[
0
] });
});
🚨
Example: Tiruchendur→Coimbatore Conflict Warning
Tiruchendur to Coimbatore is ~580 km / ~8.5 hrs drive. If the morning event ends at 14:00 and the evening session starts at 18:00, the system computes: 
earliestFeasibleStart = 14:00 + 2hr buffer + 8.5hr transit = 00:30 next day
. This is after 18:00, so a TRANSIT_IMPOSSIBLE conflict fires. The UI shows a modal with the exact route data, transit time, and requires an admin confirmation checkbox + typed justification before the override is saved to the audit log.
04 · PostgreSQL DDL
COMPLETE DATABASE SCHEMA — PRODUCTION DDL
    Drop this into your Supabase SQL editor as a migration file. All tables use UUID PKs, TIMESTAMPTZ, JSONB for unstructured blobs, full foreign key constraints, and targeted indexes for query performance. Row Level Security policies are declared at the end.
-- ============================================================
-- NAREN'S STUDIO · ZENTRY HUB — PRODUCTION SCHEMA
-- Version: 2.0 | Supabase / PostgreSQL 15+
-- Run as: supabase/migrations/001_init.sql
-- ============================================================
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS
"uuid-ossp"
;
CREATE EXTENSION IF NOT EXISTS
"pg_trgm"
; 
-- for text search
-- ───────────────────────────────────────────
-- ENUMS
-- ───────────────────────────────────────────
CREATE TYPE
 user_role          
AS ENUM
 (
'ADMIN'
, 
'CLIENT'
);
CREATE TYPE
 preferred_lang     
AS ENUM
 (
'en'
, 
'ta'
, 
'hi'
);
CREATE TYPE
 session_status     
AS ENUM
 (
'PENDING'
, 
'LIVE'
, 
'PAUSED'
, 
'COMPLETED'
);
CREATE TYPE
 gallery_status     
AS ENUM
 (
'DRAFT'
, 
'ACTIVE'
, 
'EXPIRED'
, 
'ARCHIVED'
);
CREATE TYPE
 client_choice      
AS ENUM
 (
'PENDING'
, 
'SELECTED'
, 
'WAITLIST'
, 
'TRASH'
);
CREATE TYPE
 payment_method     
AS ENUM
 (
'RAZORPAY'
, 
'UPI'
, 
'CASH'
, 
'PENDING'
);
CREATE TYPE
 payment_status     
AS ENUM
 (
'UNPAID'
, 
'PAID'
, 
'REFUNDED'
);
CREATE TYPE
 production_status  
AS ENUM
 (
'NEW'
, 
'IN_PRODUCTION'
, 
'READY'
, 
'DELIVERED'
);
CREATE TYPE
 product_category   
AS ENUM
 (
'RESIN'
, 
'MATTE_GLASS'
, 
'LED'
, 
'CANVAS'
, 
'ACRYLIC'
);
CREATE TYPE
 resource_type      
AS ENUM
 (
'PHOTOGRAPHER'
, 
'VIDEOGRAPHER'
, 
'DRONE_OPERATOR'
, 
'EQUIPMENT_KIT'
, 
'VEHICLE'
);
CREATE TYPE
 backup_vault_status 
AS ENUM
 (
'UNVERIFIED'
, 
'VAULTED'
, 
'MISSING'
);
-- ───────────────────────────────────────────
-- TABLE: users
-- ───────────────────────────────────────────
CREATE TABLE
 users (
  id               
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  auth_uid         
UUID
UNIQUE
,      
-- Supabase Auth user.id
  role             user_role        
NOT NULL DEFAULT
'CLIENT'
,
  full_name        
VARCHAR(120)
NOT NULL
,
  email            
VARCHAR(255)
NOT NULL UNIQUE
,
  phone            
VARCHAR(20)
,
  preferred_lang   preferred_lang   
NOT NULL DEFAULT
'en'
,
  is_active        
BOOLEAN
NOT NULL DEFAULT TRUE
,
  created_by       
UUID
REFERENCES
 users(id) 
ON DELETE SET NULL
,
  created_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_users_email  
ON
 users(email);
CREATE INDEX
 idx_users_role   
ON
 users(role);
CREATE INDEX
 idx_users_phone  
ON
 users(phone);
-- ───────────────────────────────────────────
-- TABLE: studio_resources (staff + equipment)
-- ───────────────────────────────────────────
CREATE TABLE
 studio_resources (
  id               
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  name             
VARCHAR(100)
NOT NULL
,         
-- "Karthik (Photographer)"
  resource_type    resource_type   
NOT NULL
,
  user_id          
UUID
REFERENCES
 users(id) 
ON DELETE SET NULL
, 
-- if staff
  phone            
VARCHAR(20)
,                       
-- for WA notifications
  color_hex        
VARCHAR(7)
,                        
-- calendar display color
  is_active        
BOOLEAN
NOT NULL DEFAULT TRUE
,
  metadata         
JSONB
NOT NULL DEFAULT
'{}'
, 
-- drone specs, kit contents, etc.
  created_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_resources_type 
ON
 studio_resources(resource_type);
-- ───────────────────────────────────────────
-- TABLE: equipment_kits (granular gear tracking)
-- ───────────────────────────────────────────
CREATE TABLE
 equipment_kits (
  id               
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  resource_id      
UUID
NOT NULL REFERENCES
 studio_resources(id) 
ON DELETE CASCADE
,
  item_name        
VARCHAR(120)
NOT NULL
,   
-- "Sony A7IV Body", "DJI Air 3"
  serial_number    
VARCHAR(80)
UNIQUE
,
  purchase_date    
DATE
,
  notes            
TEXT
,
  created_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
-- ───────────────────────────────────────────
-- TABLE: packages (service packages)
-- price_hidden_on_public: CRITICAL — hides price on /services page
-- ───────────────────────────────────────────
CREATE TABLE
 packages (
  id                    
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  name                  
VARCHAR(80)
NOT NULL
,
  description           
TEXT
,
  max_selections        
INT
NOT NULL DEFAULT
50
,
  validity_days         
INT
NOT NULL DEFAULT
30
,
  price                 
DECIMAL(10,2)
NOT NULL
,
  price_hidden_on_public 
BOOLEAN
NOT NULL DEFAULT TRUE
,  
-- PUBLIC page hides price
  display_order         
SMALLINT
NOT NULL DEFAULT
0
,
  is_active             
BOOLEAN
NOT NULL DEFAULT TRUE
,
  upsell_per_extra      
DECIMAL(8,2)
,   
-- price per extra photo unlock (upsell feature)
  upsell_batch_price    
DECIMAL(8,2)
,   
-- price to unlock entire waitlist batch
  created_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
COMMENT ON COLUMN
 packages.price_hidden_on_public 
IS
'When TRUE, the /services public page renders the package without price. Price is revealed only on the checkout screen.'
;
-- ───────────────────────────────────────────
-- TABLE: bookings (event bookings with geofencing)
-- ───────────────────────────────────────────
CREATE TABLE
 bookings (
  id                 
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  client_id          
UUID
NOT NULL REFERENCES
 users(id),
  package_id         
UUID
NOT NULL REFERENCES
 packages(id),
  venue_address      
TEXT
NOT NULL
,
  venue_lat          
DECIMAL(10,7)
NOT NULL
,
  venue_lng          
DECIMAL(10,7)
NOT NULL
,
  event_start        
TIMESTAMPTZ
NOT NULL
,
  event_end          
TIMESTAMPTZ
NOT NULL
,
  buffer_start_time  
TIMESTAMPTZ
NOT NULL
,  
-- event_start - 2hr setup
  buffer_end_time    
TIMESTAMPTZ
NOT NULL
,  
-- event_end + 2hr teardown
  admin_override     
BOOLEAN
NOT NULL DEFAULT FALSE
,
  override_reason    
TEXT
,           
-- mandatory when admin_override=true
  override_by        
UUID
REFERENCES
 users(id),
  override_at        
TIMESTAMPTZ
,
  transit_warnings   
JSONB
NOT NULL DEFAULT
'[]'
, 
-- archived conflict data
  notes              
TEXT
,
  created_by         
UUID
NOT NULL REFERENCES
 users(id),
  created_at         
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
CONSTRAINT
 chk_event_order  
CHECK
 (event_end > event_start),
CONSTRAINT
 chk_buffer_order 
CHECK
 (buffer_end_time > buffer_start_time),
CONSTRAINT
 chk_override_reason 
CHECK
 (
    admin_override = FALSE OR (admin_override = TRUE AND override_reason IS NOT NULL)
  )
);
CREATE INDEX
 idx_bookings_client      
ON
 bookings(client_id);
CREATE INDEX
 idx_bookings_event_start  
ON
 bookings(event_start);
CREATE INDEX
 idx_bookings_buffer_range 
ON
 bookings(buffer_start_time, buffer_end_time);
CREATE INDEX
 idx_bookings_venue_geo    
ON
 bookings(venue_lat, venue_lng);
-- ───────────────────────────────────────────
-- TABLE: resource_assignments (booking ↔ resource mapping)
-- ───────────────────────────────────────────
CREATE TABLE
 resource_assignments (
  id             
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  booking_id     
UUID
NOT NULL REFERENCES
 bookings(id) 
ON DELETE CASCADE
,
  resource_id    
UUID
NOT NULL REFERENCES
 studio_resources(id),
  buffer_start   
TIMESTAMPTZ
NOT NULL
,
  buffer_end     
TIMESTAMPTZ
NOT NULL
,
UNIQUE
(booking_id, resource_id)
);
CREATE INDEX
 idx_assignments_resource 
ON
 resource_assignments(resource_id);
CREATE INDEX
 idx_assignments_buffer   
ON
 resource_assignments(resource_id, buffer_start, buffer_end);
-- ───────────────────────────────────────────
-- TABLE: galleries
-- ───────────────────────────────────────────
CREATE TABLE
 galleries (
  id               
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  client_id        
UUID
NOT NULL REFERENCES
 users(id),
  booking_id       
UUID
REFERENCES
 bookings(id),
  package_id       
UUID
NOT NULL REFERENCES
 packages(id),
  status           gallery_status   
NOT NULL DEFAULT
'DRAFT'
,
  expires_at       
TIMESTAMPTZ
,
  nas_folder_path  
TEXT
,            
-- local NAS path post-archive
  created_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_galleries_client  
ON
 galleries(client_id);
CREATE INDEX
 idx_galleries_status  
ON
 galleries(status);
CREATE INDEX
 idx_galleries_expires 
ON
 galleries(expires_at);
-- ───────────────────────────────────────────
-- TABLE: live_sessions (Engine A + B)
-- ───────────────────────────────────────────
CREATE TABLE
 live_sessions (
  id                   
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  gallery_id           
UUID
NOT NULL REFERENCES
 galleries(id),
  status               session_status  
NOT NULL DEFAULT
'PENDING'
,
  qr_auth_token        
TEXT
,           
-- short-lived JWT; nulled on COMPLETED
  qr_expires_at        
TIMESTAMPTZ
,
  selection_limit      
INT
NOT NULL DEFAULT
50
,  
-- editable live
  compression_level    
SMALLINT
NOT NULL DEFAULT
7
CHECK
(compression_level 
BETWEEN
1
AND
10
),
  watermark_config     
JSONB
NOT NULL DEFAULT
'{"opacity":0.45,"scale":1,"position":"center","text":"© NAREN'\''S STUDIO","color":"rgba(255,255,255,0.85)"}'
,
  watermark_server_config 
JSONB
NOT NULL DEFAULT
'{"opacity":0.15,"scale":0.4,"position":"center"}'
,
  logo_position        
VARCHAR(20)
NOT NULL DEFAULT
'south'
,  
-- sharp gravity
  logo_scale           
DECIMAL(4,2)
NOT NULL DEFAULT
0.15
,
  is_selection_room    
BOOLEAN
NOT NULL DEFAULT FALSE
,  
-- Engine A vs B
  started_at           
TIMESTAMPTZ
,
  ended_at             
TIMESTAMPTZ
,
  created_by           
UUID
NOT NULL REFERENCES
 users(id),
  created_at           
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_sessions_gallery 
ON
 live_sessions(gallery_id);
CREATE INDEX
 idx_sessions_status  
ON
 live_sessions(status);
CREATE INDEX
 idx_sessions_wm_config 
ON
 live_sessions 
USING
 gin(watermark_config);
-- ───────────────────────────────────────────
-- TABLE: photos (the heart of the system)
-- facial_data: JSONB array of face clusters
-- vault_status: NAS backup verification
-- ───────────────────────────────────────────
CREATE TABLE
 photos (
  id                 
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  session_id         
UUID
NOT NULL REFERENCES
 live_sessions(id) 
ON DELETE CASCADE
,
  gallery_id         
UUID
NOT NULL REFERENCES
 galleries(id),
  filename           
VARCHAR(255)
NOT NULL
,      
-- original RAW filename, NEVER changed
  proxy_url          
TEXT
,                          
-- R2 signed URL (nulled after archive)
  r2_key             
TEXT
,                          
-- R2 object key for programmatic delete
  nas_path           
TEXT
,                          
-- local path after archiving
  client_choice      client_choice  
NOT NULL DEFAULT
'PENDING'
,
  is_archived        
BOOLEAN
NOT NULL DEFAULT FALSE
,
  watermark_applied  
BOOLEAN
NOT NULL DEFAULT FALSE
,
  vault_status       backup_vault_status 
NOT NULL DEFAULT
'UNVERIFIED'
,
  vault_verified_at  
TIMESTAMPTZ
,
  sort_order         
INT
NOT NULL DEFAULT
0
,
-- AI face clustering: [{clusterId, label, boundingBox:{x,y,w,h}, confidence}]
  facial_data        
JSONB
NOT NULL DEFAULT
'[]'
,
  created_at         
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at         
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
UNIQUE
(session_id, filename)
);
CREATE INDEX
 idx_photos_session         
ON
 photos(session_id);
CREATE INDEX
 idx_photos_gallery         
ON
 photos(gallery_id);
CREATE INDEX
 idx_photos_choice          
ON
 photos(gallery_id, client_choice);
CREATE INDEX
 idx_photos_vault           
ON
 photos(vault_status);
CREATE INDEX
 idx_photos_facial_gin      
ON
 photos 
USING
 gin(facial_data); 
-- face cluster queries
CREATE INDEX
 idx_photos_not_archived    
ON
 photos(session_id) 
WHERE
 is_archived = FALSE;
-- ───────────────────────────────────────────
-- TABLE: products (frame shop)
-- ───────────────────────────────────────────
CREATE TABLE
 products (
  id                   
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  name                 
VARCHAR(120)
NOT NULL
,
  description          
TEXT
,
  category             product_category  
NOT NULL
,
  base_price           
DECIMAL(10,2)
NOT NULL
,
  price_per_sq_inch    
DECIMAL(6,4)
NOT NULL DEFAULT
0
,
  overlay_image_url    
TEXT
,             
-- transparent PNG from Supabase Storage
-- Gallery: 4 photo URLs + 1 video URL
  media_photos         
TEXT[]
CHECK
(array_length(media_photos,
1
) &lt;= 
4
),
  media_video_url      
TEXT
,
  is_active            
BOOLEAN
NOT NULL DEFAULT TRUE
,
  display_order        
SMALLINT
NOT NULL DEFAULT
0
,
  review_aggregate     
JSONB
NOT NULL DEFAULT
'{"avg":0,"count":0}'
,
  created_at           
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_products_category 
ON
 products(category);
CREATE INDEX
 idx_products_active   
ON
 products(is_active, display_order);
-- ───────────────────────────────────────────
-- TABLE: orders (single-photo frame orders)
-- ───────────────────────────────────────────
CREATE TABLE
 orders (
  id                    
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  client_id             
UUID
REFERENCES
 users(id),   
-- null for guest
  guest_email           
VARCHAR(255)
,
  guest_phone           
VARCHAR(20)
,
  guest_verify_token    
VARCHAR(64)
UNIQUE
,  
-- UUID hex for guest order tracking URL
  photo_id              
UUID
REFERENCES
 photos(id),
  product_id            
UUID
NOT NULL REFERENCES
 products(id),
  dimensions            
VARCHAR(20)
NOT NULL
,
  total_price           
DECIMAL(10,2)
NOT NULL
,
  payment_method        payment_method      
NOT NULL DEFAULT
'PENDING'
,
  payment_status        payment_status      
NOT NULL DEFAULT
'UNPAID'
,
  razorpay_order_id     
VARCHAR(100)
,
  razorpay_payment_id   
VARCHAR(100)
,
  production_status     production_status   
NOT NULL DEFAULT
'NEW'
,
  custom_notes          
TEXT
,
  whatsapp_notified_at  
TIMESTAMPTZ
,
  created_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
CONSTRAINT
 chk_order_owner 
CHECK
 (client_id IS NOT NULL OR guest_email IS NOT NULL)
);
CREATE INDEX
 idx_orders_client         
ON
 orders(client_id);
CREATE INDEX
 idx_orders_production     
ON
 orders(production_status);
CREATE INDEX
 idx_orders_payment_status 
ON
 orders(payment_status);
CREATE INDEX
 idx_orders_guest_token    
ON
 orders(guest_verify_token);
-- ───────────────────────────────────────────
-- TABLE: collage_orders (multi-photo AI canvas orders)
-- photo_ids: UUID array of selected photos for the collage
-- layout_template: JSON descriptor of the grid arrangement
-- ───────────────────────────────────────────
CREATE TABLE
 collage_orders (
  id                    
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  client_id             
UUID
REFERENCES
 users(id),
  guest_email           
VARCHAR(255)
,
  guest_phone           
VARCHAR(20)
,
  guest_verify_token    
VARCHAR(64)
UNIQUE
,
  photo_ids             
UUID[]
NOT NULL
,   
-- e.g. [uuid1, uuid2, uuid3]
  product_id            
UUID
NOT NULL REFERENCES
 products(id),
  dimensions            
VARCHAR(20)
NOT NULL
,
-- Layout: { template: "TRIPTYCH_3H"|"QUAD_2x2"|"DIPTYCH_2V", slots:[{photoId,x,y,w,h}] }
  layout_template       
JSONB
NOT NULL
,
  canvas_preview_url    
TEXT
,           
-- client-generated canvas PNG snapshot (optional)
  total_price           
DECIMAL(10,2)
NOT NULL
,
  payment_method        payment_method   
NOT NULL DEFAULT
'PENDING'
,
  payment_status        payment_status   
NOT NULL DEFAULT
'UNPAID'
,
  razorpay_order_id     
VARCHAR(100)
,
  production_status     production_status 
NOT NULL DEFAULT
'NEW'
,
  custom_notes          
TEXT
,
  whatsapp_notified_at  
TIMESTAMPTZ
,
  created_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
(),
  updated_at            
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_collage_client      
ON
 collage_orders(client_id);
CREATE INDEX
 idx_collage_photo_ids   
ON
 collage_orders 
USING
 gin(photo_ids); 
-- array lookup
CREATE INDEX
 idx_collage_layout      
ON
 collage_orders 
USING
 gin(layout_template);
-- ───────────────────────────────────────────
-- TABLE: guest_pass_links (social sharing hub — Engine A)
-- ───────────────────────────────────────────
CREATE TABLE
 guest_pass_links (
  id               
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  session_id       
UUID
NOT NULL REFERENCES
 live_sessions(id) 
ON DELETE CASCADE
,
  created_by       
UUID
NOT NULL REFERENCES
 users(id),
  access_token     
VARCHAR(64)
NOT NULL UNIQUE
,  
-- URL slug token
  label            
VARCHAR(80)
,                    
-- "Grandma's phone"
  expires_at       
TIMESTAMPTZ
NOT NULL
,
  view_count       
INT
NOT NULL DEFAULT
0
,
  is_revoked       
BOOLEAN
NOT NULL DEFAULT FALSE
,
  created_at       
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
CREATE INDEX
 idx_guest_pass_token   
ON
 guest_pass_links(access_token);
CREATE INDEX
 idx_guest_pass_session 
ON
 guest_pass_links(session_id);
-- ───────────────────────────────────────────
-- TABLE: upsell_transactions (Unlock Extra Deliverables)
-- ───────────────────────────────────────────
CREATE TABLE
 upsell_transactions (
  id                  
UUID
PRIMARY KEY DEFAULT
 uuid_generate_v4(),
  session_id          
UUID
NOT NULL REFERENCES
 live_sessions(id),
  client_id           
UUID
NOT NULL REFERENCES
 users(id),
  upsell_type         
VARCHAR(30)
NOT NULL
,  
-- 'EXTRA_10'|'FULL_WAITLIST'
  extra_slots         
INT
NOT NULL DEFAULT
0
,
  amount_paid         
DECIMAL(8,2)
NOT NULL
,
  razorpay_payment_id 
VARCHAR(100)
,
  payment_status      payment_status   
NOT NULL DEFAULT
'UNPAID'
,
  created_at          
TIMESTAMPTZ
NOT NULL DEFAULT NOW
()
);
-- ───────────────────────────────────────────
-- FUNCTION: auto-update updated_at timestamp
-- ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION
 trigger_set_updated_at()
RETURNS TRIGGER AS
 $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW
;
END
;
$$ 
LANGUAGE plpgsql
;
DO
 $$
DECLARE
 t 
TEXT
;
BEGIN
FOREACH
 t 
IN ARRAY ARRAY
[
'users'
,
'packages'
,
'galleries'
,
'photos'
,
'orders'
,
'collage_orders'
] 
LOOP
EXECUTE
 format(
'CREATE TRIGGER trg_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at()'
, t);
END LOOP
;
END
;
$$ 
LANGUAGE plpgsql
;
-- ───────────────────────────────────────────
-- ROW LEVEL SECURITY
-- Enable on all tables; admin bypass via service_role key
-- ───────────────────────────────────────────
ALTER TABLE
 users              
ENABLE ROW LEVEL SECURITY
;
ALTER TABLE
 galleries          
ENABLE ROW LEVEL SECURITY
;
ALTER TABLE
 live_sessions      
ENABLE ROW LEVEL SECURITY
;
ALTER TABLE
 photos             
ENABLE ROW LEVEL SECURITY
;
ALTER TABLE
 orders             
ENABLE ROW LEVEL SECURITY
;
ALTER TABLE
 collage_orders     
ENABLE ROW LEVEL SECURITY
;
-- Clients can only see their own galleries
CREATE POLICY
 client_own_gallery 
ON
 galleries
FOR SELECT USING
 (client_id = auth.uid());
-- Clients can only see photos in their own gallery
CREATE POLICY
 client_own_photos 
ON
 photos
FOR SELECT USING
 (
    gallery_id 
IN
 (
SELECT
 id 
FROM
 galleries 
WHERE
 client_id = auth.uid())
  );
-- Clients can only UPDATE their own photo choices
CREATE POLICY
 client_update_choice 
ON
 photos
FOR UPDATE USING
 (
    gallery_id 
IN
 (
SELECT
 id 
FROM
 galleries 
WHERE
 client_id = auth.uid())
  )
WITH CHECK
 (client_choice 
IN
 (
'SELECTED'
, 
'WAITLIST'
, 
'TRASH'
, 
'PENDING'
));
-- Clients can see their own orders
CREATE POLICY
 client_own_orders 
ON
 orders
FOR SELECT USING
 (client_id = auth.uid());
-- NOTE: All admin operations use the Supabase SERVICE_ROLE key on the backend,
-- which bypasses RLS entirely. Never expose the service role key to the frontend.
🔑
RLS Architecture Pattern
The Next.js frontend uses the 
anon
 key with user JWTs (RLS enforced). The Express backend uses the 
service_role
 key (RLS bypassed — full admin access). The daemon also uses 
service_role
. Never ship 
service_role
 in any client-side bundle.
05 · Advanced Feature Implementations
ADVANCED FEATURES — TECHNICAL SPEC
Implementation notes for the Revenue Boosters, AI Face Grouping, NAS Backup Auditor, and Fail-Safe selection state.
💸 UPSELL MICROTRANSACTION TRIGGER
1
Trigger condition
: Client marks image SELECTED when 
selected_count === selection_limit
 AND 
waitlist_count > 0
2
Frontend fires
: instant overlay modal (no server round-trip) offering "Unlock 10 more for ₹999" or "Unlock your entire Waitlist (N photos) for ₹1,999"
3
One-click Razorpay
: Opens Razorpay Checkout SDK inline. On 
payment.captured
 webhook, backend increments 
live_sessions.selection_limit
 and inserts into 
upsell_transactions
4
Socket broadcast
: Server emits 
selection:limit_update
 with new limit to the client's session room — counter updates instantly
🧠 AI FACE GROUPING WORKER
1
face-api.js in Web Worker
: Runs 
detectAllFaces().withFaceLandmarks().withFaceDescriptors()
 on each photo's 
&lt;img&gt;
 DOM element — off main thread, no UI freeze
2
Euclidean distance clustering
: faceapi.euclideanDistance threshold 0.5 groups faces into clusters. Admin labels clusters: "Bride", "Groom", "Guest 1"
3
PATCH /photos/:id/facial_data
: Cluster data is POSTed to the backend and stored in the 
facial_data JSONB
 column (GIN indexed for fast 
?
 queries)
4
Filter UI
: Toggling a face badge fires a 
SELECT
 query: 
WHERE facial_data @> '[{"clusterId":"bride"}]'
 — sub-50ms results
💾 REDIS FAIL-SAFE — ZERO DATA LOSS ON DISCONNECT
Client selection state is written to 
three layers simultaneously
 on every interaction:
Layer 1 — localStorage
Instant synchronous write on every SELECTED/WAITLIST/TRASH toggle. Key: 
selection:{sessionId}:{clientId}
. Survives page refresh.
Layer 2 — Upstash Redis (debounced)
250ms debounce — writes full selection state JSON to Redis key with 7-day TTL. Survives network disconnect. Used for cross-device resume.
Layer 3 — Supabase PostgreSQL (authoritative)
Authoritative record. Updated via server-side PATCH from the Socket.io event handler. Used for final extraction and admin report.
// Client-side: every selection toggle triggers this
function
persistSelection
(sessionId, photoId, choice) {
// Layer 1: localStorage (synchronous, instant)
const
 key = 
`sel:${sessionId}`
;
const
 state = JSON.parse(localStorage.getItem(key) || 
'{}'
);
  state[photoId] = choice;
  localStorage.setItem(key, JSON.stringify(state));
// Layer 2: Redis via server (debounced 250ms)
debouncedSync
(sessionId, state);
// Layer 3: DB via Socket.io event
  socket.emit(
'selection:update'
, { photoId, choice });
}
// On page load / reconnect: restore from localStorage first, validate vs Redis
async function
restoreSelectionState
(sessionId) {
const
 local = JSON.parse(localStorage.getItem(
`sel:${sessionId}`
) || 
'{}'
);
const
 server = 
await
 fetch(
`/api/sessions/${sessionId}/state`
).then(r => r.json());
// Merge: server state wins for photos server has confirmed, local wins for unsynced
return
 { ...local, ...server.state };
}
🗄️ NAS BACKUP AUDITOR — VAULT VERIFICATION
// workers/vaultAuditor.js — runs as a BullMQ job after session COMPLETED
async function
auditVault
(sessionId) {
const
 photos = 
await
 db.query(
'SELECT id, filename, nas_path, client_choice FROM photos WHERE session_id=$1'
,
    [sessionId]
  );
for
 (
const
 photo 
of
 photos.rows) {
if
 (!photo.nas_path) {
await
updateVaultStatus
(photo.id, 
'MISSING'
);
continue
;
    }
// Check if file physically exists on NAS path
// NAS is mounted locally on the daemon machine; daemon exposes a /verify endpoint
const
 { data } = 
await
 axios.post(
`${process.env.API_BASE}/daemon/verify-file`
,
      { path: photo.nas_path },
      { headers: { 
'x-daemon-secret'
: process.env.DAEMON_SECRET } }
    );
await
updateVaultStatus
(photo.id, data.exists ? 
'VAULTED'
 : 
'MISSING'
);
  }
}
// Admin UI shows a badge per photo: 🟢 VAULTED | 🔴 MISSING | ⚪ UNVERIFIED
// Admin can re-trigger audit manually from the session detail page
06 · Implementation Summary
DELIVERY CHECKLIST
Everything needed to begin Phase 1 development immediately.
📁 FILES TO CREATE
daemon/index.js
daemon/watermarkBuilder.js
services/bookingFeasibility.js
routes/daemon.js
supabase/migrations/001_init.sql
workers/vaultAuditor.js
components/WatermarkCanvas.jsx
hooks/useSelectionState.js
🔑 ENV VARS NEEDED
DAEMON_SECRET
R2_ENDPOINT / ACCESS / SECRET
R2_BUCKET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
UPSTASH_REDIS_URL
RAZORPAY_KEY_ID / SECRET
HOT_FOLDER / NAS_ROOT
⚡ PHASE 1 PRIORITIES
1
Run the DDL migration
: paste schema into Supabase SQL editor, run, verify all tables
2
Install daemon on workstation
: configure .env, pm2 start, verify chokidar picks up test files
3
Build /daemon/* Express routes
: 
/session
, 
/photo-ready
, 
/verify-file
4
Socket.io room setup
: session namespacing, join/leave events, auth middleware
NAREN'S STUDIO · ENGINEERING BLUEPRINT V2
Architecture · WebSocket Pipeline · Geofencing Calendar · Full PostgreSQL DDL
Confidential · Internal Use Only · Naren's Studio © 2025