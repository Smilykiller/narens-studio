"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "global" },
    });
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "global",
        },
      });
    }
    return settings;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
}

export async function updateSiteSettings(data) {
  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "global" },
      update: data,
      create: {
        id: "global",
        ...data,
      },
    });
    revalidatePath("/contact");
    revalidatePath("/admin/settings");
    return { success: true, settings };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function getHeroImages() {
  try {
    const images = await prisma.heroImage.findMany({
      orderBy: { sort_order: "asc" },
    });
    return { success: true, images };
  } catch (error) {
    console.error("Failed to fetch hero images:", error);
    return { success: false, images: [] };
  }
}

export async function addHeroImage(url) {
  try {
    const count = await prisma.heroImage.count();
    const image = await prisma.heroImage.create({
      data: { url, sort_order: count },
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true, image };
  } catch (error) {
    console.error("Failed to add hero image:", error);
    return { success: false, error: "Failed to add hero image" };
  }
}

export async function deleteHeroImage(id) {
  try {
    await prisma.heroImage.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete hero image:", error);
    return { success: false, error: "Failed to delete hero image" };
  }
}
