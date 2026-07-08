"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPackages() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: "asc" },
    });
    return packages;
  } catch (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
}

export async function createPackage(formData) {
  try {
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const tier_color = formData.get("tier_color");
    const limits = formData.get("limits");
    if (!name || isNaN(price) || !tier_color || !limits) {
      return { success: false, error: "All fields are required" };
    }

    await prisma.package.create({
      data: {
        name,
        price,
        tier_color,
        limits,
        is_active: true,
      },
    });

    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error) {
    console.error("Error creating package:", error);
    return { success: false, error: "Failed to create package" };
  }
}

export async function updatePackage(id, formData) {
  try {
    const name = formData.get("name");
    const price = parseFloat(formData.get("price"));
    const tier_color = formData.get("tier_color");
    const limits = formData.get("limits");
    if (!name || isNaN(price) || !tier_color || !limits) {
      return { success: false, error: "All fields are required" };
    }

    await prisma.package.update({
      where: { id },
      data: {
        name,
        price,
        tier_color,
        limits,
      },
    });

    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error) {
    console.error("Error updating package:", error);
    return { success: false, error: "Failed to update package" };
  }
}

export async function togglePackageActive(id, is_active) {
  try {
    await prisma.package.update({
      where: { id },
      data: { is_active },
    });

    revalidatePath("/admin/packages");
    return { success: true };
  } catch (error) {
    console.error("Error toggling package active state:", error);
    return { success: false, error: "Failed to update package status" };
  }
}
