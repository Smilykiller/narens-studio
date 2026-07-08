import fs from "fs";
import path from "path";
import crypto from "crypto";
import { supabase } from "./supabase";

function getCleanCloudinaryUrl() {
  if (!process.env.CLOUDINARY_URL) return null;
  let cleaned = process.env.CLOUDINARY_URL.trim();
  if (cleaned.startsWith("export ")) {
    cleaned = cleaned.replace(/^export\s+CLOUDINARY_URL=/i, "").trim();
  }
  cleaned = cleaned.replace(/^["']|["']$/g, "");
  if (!cleaned.startsWith("cloudinary://")) {
    return null;
  }
  return cleaned;
}

export async function uploadImageBuffer(buffer, folder = "narensstudio") {
  // 1. Primary Engine: Supabase Storage
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://dummy-build.supabase.co";

  if (hasSupabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || "photos";
    const filename = `${folder}/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.jpg`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      throw new Error(
        `Supabase Storage Error (${bucket}): ${error.message}. Ensure the bucket '${bucket}' exists in Supabase Storage and is set to Public.`
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  }

  // 2. Secondary Engine: Cloudinary (if Supabase not configured)
  const cleanedUrl = getCleanCloudinaryUrl();
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasCloudinary = cleanedUrl || (cloudName && apiKey && apiSecret);

  if (hasCloudinary) {
    const { v2: cloudinary } = await import("cloudinary");
    if (cleanedUrl) {
      cloudinary.config({
        cloudinary_url: cleanedUrl,
      });
    } else {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
    }
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          if (result && result.secure_url) return resolve(result.secure_url);
          reject(new Error("Unknown Cloudinary error"));
        },
      );
      uploadStream.end(buffer);
    });
  }

  // If running on Vercel serverless without either Supabase or Cloudinary:
  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    throw new Error(
      "No cloud storage configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel and create a public bucket named 'photos'."
    );
  }

  // 3. Fallback to local upload for local PC development
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filename = `${crypto.randomBytes(16).toString("hex")}.jpg`;
  const filePath = path.join(uploadDir, filename);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${filename}`;
}
