"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { is_active: true },
      orderBy: { created_at: "desc" },
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductById(id) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        sizes: true,
        media: {
          orderBy: { sort_order: "asc" },
        },
      },
    });
    return product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export async function submitEnquiry(data) {
  try {
    const enquiry = await prisma.enquiry.create({
      data: {
        client_id: data.client_id,
        product_id: data.product_id,
        dimensions: data.dimensions,
      },
    });
    return { success: true, enquiryId: enquiry.id };
  } catch (error) {
    console.error("Error submitting enquiry:", error);
    return { error: "Failed to submit enquiry" };
  }
}

export async function createOrder(data) {
  try {
    const order = await prisma.order.create({
      data: {
        client_id: data.client_id,
        product_id: data.product_id,
        size_id: data.size_id,
        total_amount: data.total_amount,
        shipping_address: data.shipping_address,
        status: "pending",
        payment_status: "pending",
        payment_method: data.payment_method || "cash",
      },
    });
    revalidatePath("/dashboard");
    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "Failed to create order" };
  }
}
