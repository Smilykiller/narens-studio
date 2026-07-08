"use server";
import { prisma } from "@/lib/prisma";

export async function getHomeData() {
  try {
    const packages = await prisma.package.findMany({
      where: { is_active: true },
      orderBy: { price: "asc" },
    });

    const showcasePhotos = await prisma.photo.findMany({
      where: { is_public: true },
      take: 12,
      orderBy: { created_at: "desc" },
    });

    const heroImages = await prisma.heroImage.findMany({
      orderBy: { sort_order: "asc" },
    });

    return { success: true, packages, showcasePhotos, heroImages };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
