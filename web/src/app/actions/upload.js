"use server";

import { uploadImageBuffer } from "@/lib/cloudinary";

export async function uploadImageToCloudinary(formData) {
  try {
    const file = formData.get("file");
    if (!file) {
      return { error: "No file provided" };
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload using centralized Cloudinary utility
    const url = await uploadImageBuffer(buffer, "narensstudio_portfolio");
    return { url };
  } catch (err) {
    console.error("Error in upload action:", err);
    return { error: err.message || "An unexpected error occurred during upload" };
  }
}
