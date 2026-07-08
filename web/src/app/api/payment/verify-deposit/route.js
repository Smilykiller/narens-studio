import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      invoiceId,
    } = await request.json();

    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server misconfiguration: Missing Razorpay Secret" },
        { status: 500 },
      );
    }
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment successful, update invoice and booking
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "paid" },
        });
      }

      if (bookingId) {
        const booking = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: "confirmed" },
          include: { client: true },
        });

        // Trigger Email Notification
        if (booking.client?.email) {
          await sendEmail({
            to: booking.client.email,
            subject: "Booking Confirmed - Naren's Studio",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #FF6B00;">Booking Confirmed!</h2>
                <p>Hi ${booking.client.full_name},</p>
                <p>Your deposit has been successfully received, and your session for <strong>${booking.title}</strong> is now confirmed.</p>
                <p>We'll reach out shortly with further details about your shoot.</p>
                <p>Best,<br/>Naren's Studio</p>
              </div>
            `,
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Razorpay Verify Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
