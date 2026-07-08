"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import fs from "fs";
import path from "path";
import { uploadImageBuffer } from "@/lib/cloudinary";

async function saveFile(file, prefix) {
  if (!file || file.size === 0) return "";
  const buffer = Buffer.from(await file.arrayBuffer());
  return await uploadImageBuffer(buffer, `shop/${prefix}`);
}

export async function getAdminProducts() {
  try {
    return await prisma.product.findMany({
      include: {
        sizes: true,
        media: true,
      },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return [];
  }
}

export async function createAdminProduct(formData) {
  try {
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const file = formData.get("thumbnail");
    let thumbnail_url = "";
    if (file && file.size > 0) {
      thumbnail_url = await saveFile(file, "product-thumb");
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        thumbnail_url: thumbnail_url || null,
        is_active: true,
      },
    });
    revalidatePath("/admin/shop");
    return { success: true, product };
  } catch (error) {
    console.error("Error creating admin product:", error);
    return {
      success: false,
      error: error.message || "Failed to create product",
    };
  }
}

export async function updateAdminProduct(id, formData) {
  try {
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const file = formData.get("thumbnail");
    const is_active = formData.get("is_active") === "true";
    const data = { name, description, category, is_active };
    if (file && file.size > 0) {
      data.thumbnail_url = await saveFile(file, "product-thumb");
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });
    revalidatePath("/admin/shop");
    return { success: true, product };
  } catch (error) {
    console.error("Error updating admin product:", error);
    return {
      success: false,
      error: error.message || "Failed to update product",
    };
  }
}

export async function deleteAdminProduct(id) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/shop");
    return { success: true };
  } catch (error) {
    console.error("Error deleting admin product:", error);
    return {
      success: false,
      error: error.message || "Failed to delete product",
    };
  }
}

// Sizes
export async function addProductSize(productId, name, price) {
  try {
    const size = await prisma.productSize.create({
      data: { product_id: productId, name, price },
    });
    revalidatePath("/admin/shop");
    return { success: true, size };
  } catch (error) {
    console.error("Error adding product size:", error);
    return { success: false, error: error.message || "Failed to add size" };
  }
}

export async function removeProductSize(id) {
  try {
    await prisma.productSize.delete({ where: { id } });
    revalidatePath("/admin/shop");
    return { success: true };
  } catch (error) {
    console.error("Error removing product size:", error);
    return { success: false, error: error.message || "Failed to remove size" };
  }
}

// Media
export async function addProductMedia(formData) {
  try {
    const productId = formData.get("productId");
    const type = formData.get("type");
    const file = formData.get("file");

    if (!file || file.size === 0) {
      return { success: false, error: "No file uploaded" };
    }

    const url = await saveFile(file, `product-media-${type}`);

    const media = await prisma.productMedia.create({
      data: { product_id: productId, url, type, sort_order: 0 },
    });
    revalidatePath("/admin/shop");
    return { success: true, media };
  } catch (error) {
    console.error("Error adding product media:", error);
    return { success: false, error: error.message || "Failed to add media" };
  }
}

export async function removeProductMedia(id) {
  try {
    const media = await prisma.productMedia.findUnique({ where: { id } });
    if (media && media.url.startsWith("/uploads/")) {
      const filename = media.url.replace("/uploads/", "");
      const filePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.productMedia.delete({ where: { id } });
    revalidatePath("/admin/shop");
    return { success: true };
  } catch (error) {
    console.error("Error removing product media:", error);
    return { success: false, error: error.message || "Failed to remove media" };
  }
}

// Orders
export async function getAdminOrders() {
  try {
    return await prisma.order.findMany({
      include: {
        client: true,
        product: true,
        size: true,
      },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);
    return [];
  }
}

export async function updateOrderStatus(
  id,
  status,
  tracking_number,
  tracking_message,
) {
  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status, tracking_number, tracking_message },
    });
    revalidatePath("/admin/shop/orders");
    return { success: true, order };
  } catch (error) {
    console.error("Error updating order status:", error);
    return {
      success: false,
      error: error.message || "Failed to update order status",
    };
  }
}

// Enquiries
export async function getAdminEnquiries() {
  try {
    return await prisma.enquiry.findMany({
      include: {
        client: true,
        product: true,
        messages: true,
      },
      orderBy: { created_at: "desc" },
    });
  } catch (error) {
    console.error("Error fetching admin enquiries:", error);
    return [];
  }
}

export async function updateEnquiryStatus(id, status) {
  try {
    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin/shop/enquiries");
    return { success: true, enquiry };
  } catch (error) {
    console.error("Error updating enquiry status:", error);
    return {
      success: false,
      error: error.message || "Failed to update enquiry status",
    };
  }
}
