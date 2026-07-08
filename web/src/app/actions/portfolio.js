"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { uploadImageBuffer } from "@/lib/cloudinary";

// Categories
export async function getCategories() {
  try {
    return await prisma.galleryCategory.findMany({
      orderBy: { created_at: "asc" },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function createCategory(name) {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const category = await prisma.galleryCategory.create({
      data: { name, slug },
    });
    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true, category };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error.message || "Failed to create category",
    };
  }
}

export async function deleteCategory(id) {
  try {
    await prisma.galleryCategory.delete({ where: { id } });
    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: error.message || "Failed to delete category",
    };
  }
}

// Photos
export async function getPhotos() {
  try {
    return await prisma.photo.findMany({
      include: { category: true },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}

export async function getPublicPhotos() {
  try {
    return await prisma.photo.findMany({
      where: { is_public: true },
      include: { category: true },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Error fetching public photos:", error);
    return [];
  }
}

export async function uploadPhoto(formData) {
  try {
    const file = formData.get("file");
    const title = formData.get("title");
    const category_id = formData.get("category_id");

    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const publicUrl = await uploadImageBuffer(buffer, "portfolio");

    // Save to DB
    const photo = await prisma.photo.create({
      data: {
        title,
        url: publicUrl,
        category_id: category_id || null,
        is_public: true,
      },
    });

    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true, photo };
  } catch (error) {
    console.error("Error uploading photo:", error);
    return { success: false, error: error.message || "Failed to upload photo" };
  }
}

export async function deletePhoto(id, url) {
  try {
    // Delete from DB
    await prisma.photo.delete({ where: { id } });
    // Try to delete local file
    if (url.startsWith("/uploads/")) {
      const filename = url.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Error deleting photo:", error);
    return { success: false, error: error.message || "Failed to delete photo" };
  }
}

export async function togglePhotoVisibility(id, is_public) {
  try {
    await prisma.photo.update({
      where: { id },
      data: { is_public },
    });
    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true };
  } catch (error) {
    console.error("Error toggling photo visibility:", error);
    return {
      success: false,
      error: error.message || "Failed to update visibility",
    };
  }
}
