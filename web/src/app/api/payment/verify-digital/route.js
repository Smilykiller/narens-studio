import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

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

    if (expectedSignature === razorpay_signature) {
      // Find the pending order associated with this razorpay order ID
      const order = await prisma.order.findFirst({
        where: { razorpay_order_id: razorpay_order_id },
        include: { client: true },
      });

      if (order) {
        // Mark order as paid and delivered immediately for digital goods
        await prisma.order.update({
          where: { id: order.id },
          data: {
            payment_status: "paid",
            status: "delivered",
            razorpay_payment_id,
          },
        });

        // Send email with download link if we have client details and a photo URL
        if (order.client?.email && order.photo_url) {
          // Send high res download link
          // The actual download could be handled via a secure download route, but we just provide the direct Cloudinary URL here for now.
          await sendEmail({
            to: order.client.email,
            subject: "Your Digital Download - Naren's Studio",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                <h2 style="color: #FF6B00;">Thank You For Your Purchase!</h2>
                <p>Hi ${order.client.full_name},</p>
                <p>Your payment was successful. You can download your high-resolution photo using the link below:</p>
                <a href="${order.photo_url}" style="display:inline-block; padding:12px 24px; background:#FF6B00; color:#fff; text-decoration:none; border-radius:4px; margin:16px 0;">Download High-Res Photo</a>
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
    console.error("Verify Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
