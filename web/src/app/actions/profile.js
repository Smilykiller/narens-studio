"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value;
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const full_name = formData.get("full_name");
    const phone = formData.get("phone");
    const address = formData.get("address");
    const city = formData.get("city");
    const pincode = formData.get("pincode");

    await prisma.user.update({
      where: { id: userId },
      data: {
        full_name,
        phone,
        address,
        city,
        pincode,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(formData) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value;
    if (!userId) {
      return { success: false, error: "Not authenticated" };
    }

    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const bcrypt = require("bcryptjs");

    // Compare plain-text password for the prototype
    if (!user.password_hash) {
      return { success: false, error: "User has no password set" };
    }
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: passwordHash },
    });

    return { success: true, message: "Password updated successfully" };
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, error: "Failed to change password" };
  }
}
