"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getResources() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { created_at: "desc" },
    });
    return { success: true, resources };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createResource(formData) {
  try {
    const name = formData.get("name");
    const type = formData.get("type");

    if (!name || !type) {
      return { success: false, error: "Name and type are required." };
    }

    const resource = await prisma.resource.create({
      data: { name, type },
    });

    revalidatePath("/admin/resources");
    return { success: true, resource };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function toggleResourceStatus(id, isActive) {
  try {
    await prisma.resource.update({
      where: { id },
      data: { is_active: isActive },
    });
    revalidatePath("/admin/resources");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteResource(id) {
  try {
    await prisma.resource.delete({
      where: { id },
    });
    revalidatePath("/admin/resources");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
