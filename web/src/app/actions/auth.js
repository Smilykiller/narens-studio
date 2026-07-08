"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Mocking Supabase entirely since we switched to local SQLite for rapid prototyping
export async function getAuthState() {
  const cookieStore = await cookies();
  const mockRole = cookieStore.get("mock_role")?.value;
  const mockUserId = cookieStore.get("mock_user_id")?.value;
  if (mockRole && mockUserId) {
    const user = await prisma.user.findUnique({ where: { id: mockUserId } });
    if (user) {
      return { isAuthenticated: true, user };
    }
  }
  // Fallback to basic role check for admin testing
  if (mockRole === "admin") {
    return {
      isAuthenticated: true,
      user: {
        role: "admin",
        email: "admin@narensstudio.com",
        full_name: "Admin",
        id: "admin-1",
      },
    };
  }
  return { isAuthenticated: false, user: null };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("mock_role");
  cookieStore.delete("mock_user_id");
  return { success: true };
}

export async function handleAuthAction(formData) {
  const action = formData.get("action");
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const bcrypt = require("bcryptjs");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@narensstudio.com";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  // Admin bypass via Environment Variables or default local dev credentials
  if (email === adminEmail || email === "admin@narensstudio.com") {
    let isValidAdmin = false;
    // Support legacy ADMIN_PASSWORD or default local passwords ("admin123" or "admin")
    if (password === adminPass || password === "admin123" || password === "admin") {
      isValidAdmin = true;
    } else if (process.env.ADMIN_PASSWORD_HASH) {
      isValidAdmin = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH,
      );
    }

    if (isValidAdmin) {
      const cookieStore = await cookies();
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      };
      cookieStore.set("mock_role", "admin", cookieOptions);
      cookieStore.set("mock_user_id", "admin-1", cookieOptions);
      return { success: true, user: { role: "admin", email } };
    }
  }

  try {
    if (action === "login") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password_hash) {
        return { error: "Invalid credentials or user does not exist." };
      }
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return { error: "Invalid credentials." };
      }
      const cookieStore = await cookies();
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      };
      cookieStore.set("mock_role", user.role, cookieOptions);
      cookieStore.set("mock_user_id", user.id, cookieOptions);
      return { success: true, user };
    } else if (action === "register") {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.is_verified) {
        return { error: "User already exists. Please sign in." };
      }

      const fullName = formData.get("fullName");
      const phone = formData.get("phone");
      const address = formData.get("address");
      const city = formData.get("city");
      const pincode = formData.get("pincode");

      // Generate 6 digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const passwordHash = await bcrypt.hash(password, 10);

      if (existingUser) {
        // Update unverified user with new OTP
        await prisma.user.update({
          where: { email },
          data: {
            full_name: fullName,
            phone,
            address,
            city,
            pincode,
            password_hash: passwordHash,
            otp_code: otpCode,
            otp_expiry: otpExpiry,
          },
        });
      } else {
        // Create new unverified user
        await prisma.user.create({
          data: {
            email,
            full_name: fullName,
            phone,
            address,
            city,
            pincode,
            password_hash: passwordHash,
            role: "client",
            is_verified: false,
            otp_code: otpCode,
            otp_expiry: otpExpiry,
          },
        });
      }

      // Send OTP Email
      await sendEmail({
        to: email,
        subject: "Your Verification Code - Naren's Studio",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
            <h2 style="color: #FF6B00;">Verification Code</h2>
            <p>Hi ${fullName},</p>
            <p>Please use the following code to verify your account:</p>
            <h1 style="font-size: 32px; letter-spacing: 4px; background: #f4f4f4; padding: 16px; text-align: center; border-radius: 8px;">${otpCode}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>Best,<br/>Naren's Studio</p>
          </div>
        `,
      });

      return { success: true, requireOtp: true, email };
    }
  } catch (err) {
    console.error("Auth Error:", err);
    return { error: "Database error occurred." };
  }

  return { error: "Invalid action." };
}

export async function verifyOTP(formData) {
  const email = formData.get("email");
  const code = formData.get("code");

  if (!email || !code) {
    return { error: "Email and code are required." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "User not found." };
    }

    if (user.otp_code !== code) {
      return { error: "Invalid verification code." };
    }

    if (!user.otp_expiry || user.otp_expiry < new Date()) {
      return {
        error:
          "Verification code has expired. Please sign up again to get a new code.",
      };
    }

    // Verify user
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        is_verified: true,
        otp_code: null,
        otp_expiry: null,
      },
    });

    const cookieStore = await cookies();
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    };
    cookieStore.set("mock_role", updatedUser.role, cookieOptions);
    cookieStore.set("mock_user_id", updatedUser.id, cookieOptions);

    return { success: true, user: updatedUser };
  } catch (err) {
    console.error("Verify OTP Error:", err);
    return { error: "Database error occurred." };
  }
}
