"use server";

import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary using environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImageToCloudinary(formData) {
  try {
    const file = formData.get("file");
    if (!file) {
      return { error: "No file provided" };
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary using a Promise wrapper
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "narensstudio_portfolio" },
        (error, result) => {
          if (error) {
            console.error("Cloudinary Upload Error:", error);
            resolve({ error: "Upload to Cloudinary failed" });
          } else if (result) {
            resolve({ url: result.secure_url });
          }
        },
      );

      // Write the buffer to the upload stream
      uploadStream.end(buffer);
    });
  } catch (err) {
    console.error("Error in upload action:", err);
    return { error: "An unexpected error occurred during upload" };
  }
}
