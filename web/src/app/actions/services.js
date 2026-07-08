"use server";

import { prisma } from "@/lib/prisma";
import { getAuthState } from "./auth";
import { revalidatePath } from "next/cache";

const DEFAULT_SERVICES = [
  {
    title: "Wedding Cinematography & Photography",
    category: "Signature Collection",
    description:
      "Immortalize your special day with our award-winning cinematic storytelling. We blend candid moments with breathtaking portraiture to craft timeless heirlooms.",
    price: "Custom Quotes Available",
    icon_name: "Heart",
    features: [
      "Full-day multi-camera coverage",
      "4K cinematic highlight film & full feature documentary",
      "Dedicated creative director & master colorist",
      "Complimentary pre-wedding editorial shoot",
      "Private online proofing gallery & luxury Italian leather album",
    ].join("\n"),
    sort_order: 1,
    is_active: true,
  },
  {
    title: "Commercial & Brand Editorial",
    category: "Corporate & Fashion",
    description:
      "Elevate your brand identity with high-impact visual campaigns tailored for modern digital landscapes, fashion magazines, and global billboards.",
    price: "Day Rates & Campaign Pricing",
    icon_name: "Camera",
    features: [
      "Creative direction & moodboard development",
      "High-speed studio strobe lighting & Phase One medium format systems",
      "Commercial usage & full licensing rights",
      "Professional styling & hair/makeup team coordination",
      "24-48 hour rapid turnaround for press releases",
    ].join("\n"),
    sort_order: 2,
    is_active: true,
  },
  {
    title: "Drone & Aerial Visuals",
    category: "Specialized Media",
    description:
      "Capture grand perspectives with our FAA-certified drone pilots using state-of-the-art cinematic aerial cinematography platforms.",
    price: "Available as Add-on or Standalone",
    icon_name: "Plane",
    features: [
      "6K ProRes RAW aerial cinematography",
      "Dual-operator gimbal tracking for dynamic action",
      "Real estate, architectural, and landscape showcases",
      "Night flight & indoor precision drone operations",
      "Fully insured & permitted flight plans",
    ].join("\n"),
    sort_order: 3,
    is_active: true,
  },
  {
    title: "Fine Art Retouching & Print Restoration",
    category: "Post-Production",
    description:
      "Our in-house master retouchers meticulously enhance every pixel while preserving natural skin textures and authentic lighting.",
    price: "Per Image or Project Based",
    icon_name: "Sparkles",
    features: [
      "High-end frequency separation skin retouching",
      "Color grading matched to analog film stocks (Kodak Portra, Ilford)",
      "Archival restoration of vintage & damaged family photographs",
      "Museum-grade giclée print prep & color calibration",
      "Custom framing consultation in our studio workshop",
    ].join("\n"),
    sort_order: 4,
    is_active: true,
  },
];

export async function seedSampleServices(force = false) {
  try {
    if (force) {
      await prisma.service.deleteMany({});
    }
    const count = await prisma.service.count();
    if (count === 0 || force) {
      for (const s of DEFAULT_SERVICES) {
        await prisma.service.create({ data: s });
      }
    }
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to seed sample services" };
  }
}

export async function getServices({ includeInactive = false } = {}) {
  try {
    const count = await prisma.service.count();
    if (count === 0) {
      for (const s of DEFAULT_SERVICES) {
        await prisma.service.create({ data: s });
      }
    }

    const whereClause = includeInactive ? {} : { is_active: true };
    const services = await prisma.service.findMany({
      where: whereClause,
      orderBy: [{ sort_order: "asc" }, { created_at: "asc" }],
    });

    return services;
  } catch (error) {
    console.error("Error fetching services:", error);
    // Fallback to defaults if DB table isn't initialized yet
    return DEFAULT_SERVICES.map((s, idx) => ({
      ...s,
      id: `default-${idx + 1}`,
    }));
  }
}

export async function createService(formData) {
  const auth = await getAuthState();
  if (!auth.isAuthenticated || auth.user?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim() || "General";
  const description = formData.get("description")?.toString().trim();
  const price = formData.get("price")?.toString().trim() || "Custom Quote";
  const icon_name = formData.get("icon_name")?.toString().trim() || "Sparkles";
  const features = formData.get("features")?.toString().trim() || "";
  const sort_order = parseInt(formData.get("sort_order") || "10", 10);
  const is_active = formData.get("is_active") === "true";

  if (!title || !description) {
    return { error: "Title and description are required" };
  }

  try {
    const service = await prisma.service.create({
      data: {
        title,
        category,
        description,
        price,
        icon_name,
        features,
        sort_order,
        is_active,
      },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, service };
  } catch (error) {
    console.error("createService error:", error);
    return { error: "Failed to create service" };
  }
}

export async function updateService(id, formData) {
  const auth = await getAuthState();
  if (!auth.isAuthenticated || auth.user?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title")?.toString().trim();
  const category = formData.get("category")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const price = formData.get("price")?.toString().trim();
  const icon_name = formData.get("icon_name")?.toString().trim();
  const features = formData.get("features")?.toString().trim();
  const sort_order = parseInt(formData.get("sort_order") || "10", 10);
  const is_active = formData.get("is_active") === "true";

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        title,
        category,
        description,
        price,
        icon_name,
        features,
        sort_order,
        is_active,
      },
    });

    revalidatePath("/services");
    revalidatePath("/admin/services");

    return { success: true, service };
  } catch (error) {
    console.error("updateService error:", error);
    return { error: "Failed to update service" };
  }
}

export async function deleteService(id) {
  const auth = await getAuthState();
  if (!auth.isAuthenticated || auth.user?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/services");
    revalidatePath("/admin/services");
    return { success: true };
  } catch (error) {
    console.error("deleteService error:", error);
    return { error: "Failed to delete service" };
  }
}
