"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { uploadImageBuffer } from "@/lib/cloudinary";

const SAMPLE_CATEGORIES = [
  { name: "Weddings", slug: "weddings" },
  { name: "Portraits", slug: "portraits" },
  { name: "Commercial", slug: "commercial" },
  { name: "Aerial", slug: "aerial" },
];

const SAMPLE_PHOTOS = [
  {
    title: "Sunset Wedding Vows at Amalfi Coast",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    catSlug: "weddings",
    is_public: true,
  },
  {
    title: "Intimate Editorial Bridal Portrait",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    catSlug: "weddings",
    is_public: true,
  },
  {
    title: "Cinematic High-Fashion Studio Portrait",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80",
    catSlug: "portraits",
    is_public: true,
  },
  {
    title: "Monochrome Editorial Headshot",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    catSlug: "portraits",
    is_public: true,
  },
  {
    title: "Luxury Watch Campaign Editorial",
    url: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1200&q=80",
    catSlug: "commercial",
    is_public: true,
  },
  {
    title: "Architectural Showcase - Modern Glass Villa",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    catSlug: "commercial",
    is_public: true,
  },
  {
    title: "Misty Mountain Aerial Horizon",
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    catSlug: "aerial",
    is_public: true,
  },
  {
    title: "Coastal Cliff Drone Panorama",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    catSlug: "aerial",
    is_public: true,
  },
];

export async function seedSamplePortfolio(force = false) {
  try {
    if (force) {
      await prisma.photo.deleteMany({});
      await prisma.galleryCategory.deleteMany({});
    }
    const catMap = {};
    for (const cat of SAMPLE_CATEGORIES) {
      let existing = await prisma.galleryCategory.findUnique({
        where: { slug: cat.slug },
      });
      if (!existing) {
        existing = await prisma.galleryCategory.create({ data: cat });
      }
      catMap[cat.slug] = existing.id;
    }

    const currentCount = await prisma.photo.count();
    if (currentCount === 0 || force) {
      for (const p of SAMPLE_PHOTOS) {
        await prisma.photo.create({
          data: {
            title: p.title,
            url: p.url,
            is_public: p.is_public,
            category_id: catMap[p.catSlug] || null,
          },
        });
      }
    }
    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    revalidatePath("/portfolio");
    return { success: true };
  } catch (err) {
    return { success: false, error: "Failed to seed sample portfolio" };
  }
}

async function seedSamplePortfolioIfEmpty() {
  await seedSamplePortfolio(false);
}

// Categories
export async function getCategories() {
  try {
    await seedSamplePortfolioIfEmpty();
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
    await seedSamplePortfolioIfEmpty();
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
    await seedSamplePortfolioIfEmpty();
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

export async function addPhotoByUrl({ title, url, category_id }) {
  try {
    if (!url) return { success: false, error: "Image URL is required" };
    const photo = await prisma.photo.create({
      data: {
        title: title || "Untitled",
        url,
        category_id: category_id || null,
        is_public: true,
      },
    });
    revalidatePath("/admin/portfolio");
    revalidatePath("/gallery");
    return { success: true, photo };
  } catch (error) {
    console.error("Error adding photo by URL:", error);
    return { success: false, error: error.message || "Failed to add photo" };
  }
}
