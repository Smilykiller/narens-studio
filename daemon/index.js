require('dotenv').config();
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

const HOT_FOLDER = path.join(__dirname, 'hotfolder');

// We now target the persistent Studio Live Room instead of requiring an ID
const ROOM_ID = "studio-live";

// Ensure hotfolder exists
if (!fs.existsSync(HOT_FOLDER)) {
  fs.mkdirSync(HOT_FOLDER, { recursive: true });
}

console.log(`📷 Naren's Studio Local Daemon initialized.`);
console.log(`Targeting Room: ${ROOM_ID}`);
console.log(`Watching folder: ${HOT_FOLDER}`);

const queue = [];
let isProcessing = false;

async function processNext() {
  if (isProcessing || queue.length === 0) return;
  isProcessing = true;
  const filePath = queue.shift();

  try {
    const filename = path.basename(filePath);
    
    // Simulate RAW to JPEG conversion & Burn-in Watermark (Removed sharp for simplicity in this pure-local version, just uploads the file)
    console.log(`Uploading: ${filename}`);
    
    // Upload to local Next.js API
    const formData = new FormData();
    // In Node.js >= 18, we can use fetch and Blob
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    formData.append("file", blob, filename);
    formData.append("roomId", ROOM_ID);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${appUrl}/api/daemon/upload`, {
      method: "POST",
      body: formData,
      headers: {
        "X-Daemon-Secret": process.env.DAEMON_SECRET || ""
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Server returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    console.log(`✅ Uploaded to Web App: ${data.url}`);

  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
  } finally {
    isProcessing = false;
    processNext();
  }
}

chokidar.watch(HOT_FOLDER, {
  ignored: /(^|[\/\\])\../, 
  persistent: true,
  awaitWriteFinish: { stabilityThreshold: 1000, pollInterval: 200 }
}).on('add', (filePath) => {
  if (/\.(jpg|jpeg|cr3|arw|nef|png)$/i.test(filePath)) {
    queue.push(filePath);
    processNext();
  }
});
