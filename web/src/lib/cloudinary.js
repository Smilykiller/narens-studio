import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Cloudinary is configured automatically if CLOUDINARY_URL is in the environment
// Format: cloudinary://my_key:my_secret@my_cloud_name

export async function uploadImageBuffer(buffer, folder = "narensstudio") {
  if (process.env.CLOUDINARY_URL) {
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
