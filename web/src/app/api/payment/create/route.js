import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { amount, orderId, notes } = body;

    // amount is in INR (so multiply by 100 for paise)
    const options = {
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: orderId || `rcpt_${Date.now()}`,
      notes: notes || {},
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (orderId) {
      // Update Prisma order with the Razorpay order ID
      await prisma.order.update({
        where: { id: orderId },
        data: {
          razorpay_order_id: razorpayOrder.id,
        },
      });
    }

    return NextResponse.json({ success: true, order: razorpayOrder });
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
