"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function getPackages() {
  try {
    const packages = await prisma.package.findMany({
      where: { is_active: true },
      orderBy: { price: "asc" }, // or 'created_at' if display_order isn't there
    });
    return packages;
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return [];
  }
}

export async function submitBooking(data) {
  try {
    // 1. Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    let tempPassword = "";
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      tempPassword = Math.random().toString(36).slice(-8); // Generate 8 char password
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      user = await prisma.user.create({
        data: {
          email: data.email,
          full_name: data.name,
          phone: data.phone,
          password_hash: passwordHash,
          role: "client",
          is_verified: true, // Assume verified since they booked
        },
      });
    }

    // Combine date and time into a valid Date object for Prisma
    const eventStart = new Date(`${data.date}T${data.time}:00`);
    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        client_id: user.id,
        title: data.packageName,
        event_start: eventStart,
        event_end: new Date(eventStart.getTime() + 4 * 60 * 60 * 1000), // Default 4 hr end
        venue_address: data.venue,
        venue_lat: 0,
        venue_lng: 0,
        notes: data.notes,
        status: "pending",
      },
    });

    // Send Welcome Email if it's a new user
    if (isNewUser) {
      await sendEmail({
        to: user.email,
        subject: "Welcome to Naren's Studio!",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #FF6B00;">Your Account Has Been Created!</h2>
            <p>Hi ${user.full_name},</p>
            <p>Thank you for booking with us! We have created an account for you so you can track your booking status, view selection rooms, and download your photos.</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Your Login Credentials:</strong></p>
              <p style="margin: 0 0 5px 0;">Email: <strong>${user.email}</strong></p>
              <p style="margin: 0;">Temporary Password: <strong>${tempPassword}</strong></p>
            </div>
            <p>Please log in and change your password as soon as possible.</p>
            <p>Alternatively, you can also log in anytime using a one-time passcode (OTP) sent to this email address.</p>
            <p>Best,<br/>Naren's Studio</p>
          </div>
        `,
      });
    }

    return { success: true, booking };
  } catch (error) {
    console.error("Failed to submit booking:", error);
    return { success: false, error: "Failed to submit booking request" };
  }
}
