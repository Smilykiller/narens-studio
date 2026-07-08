import fs from "fs";
import path from "path";
import crypto from "crypto";

function getCleanCloudinaryUrl() {
  if (!process.env.CLOUDINARY_URL) return null;
  let cleaned = process.env.CLOUDINARY_URL.trim();
  // Strip out accidental "export CLOUDINARY_URL=" prefix from copying
  if (cleaned.startsWith("export ")) {
    cleaned = cleaned.replace(/^export\s+CLOUDINARY_URL=/i, "").trim();
  }
  cleaned = cleaned.replace(/^["']|["']$/g, ""); // remove surrounding quotes if any
  if (!cleaned.startsWith("cloudinary://")) {
    return null;
  }
  return cleaned;
}

export async function uploadImageBuffer(buffer, folder = "narensstudio") {
  const cleanedUrl = getCleanCloudinaryUrl();
  if (cleanedUrl) {
    // Dynamically import cloudinary so it never evaluates during static Vercel builds!
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloudinary_url: cleanedUrl,
    });
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (result) return resolve(result.secure_url);
          reject(new Error("Unknown Cloudinary error"));
        },
      );
      uploadStream.end(buffer);
    });
  } else {
    // Fallback to local upload
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `${crypto.randomBytes(16).toString("hex")}.jpg`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/${filename}`;
  }
}
