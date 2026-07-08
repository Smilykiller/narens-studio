import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "fallback_secret";

    // Create expected signature
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = shasum.digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      if (orderId) {
        // Update Prisma order
        await prisma.order.update({
          where: { id: orderId },
          data: {
            payment_status: "paid",
            razorpay_payment_id,
            razorpay_signature,
          },
        });
      }
      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { payment_status: "failed" },
        });
      }
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
