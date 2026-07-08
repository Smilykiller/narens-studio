"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: "client" },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        preferred_lang: true,
        created_at: true,
      },
    });
    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
}

export async function createClient(formData) {
  try {
    const email = formData.get("email");
    const full_name = formData.get("full_name");
    const phone = formData.get("phone");
    const preferred_lang = formData.get("preferred_lang") || "en";
    const password = formData.get("password");

    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    if (password.length < 8) {
      return {
        success: false,
        error: "Password must be at least 8 characters",
      };
    }

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email already exists" };
    }

    // Hash the password securely using bcryptjs
    const bcrypt = require("bcryptjs");
    const password_hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email,
        full_name,
        phone,
        preferred_lang,
        password_hash,
        role: "client",
      },
    });

    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client" };
  }
}
