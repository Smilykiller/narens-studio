import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const { photoId } = await request.json();
    // Digital download cost: ₹1,000 per photo
    const amountInINR = 1000;
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `digital_rcpt_${photoId?.substring(0, 8) || Date.now()}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save an Order in the DB with pending status
    const { prisma } = require("@/lib/prisma");
    const { cookies } = require("next/headers");
    const cookieStore = await cookies();
    const userId = cookieStore.get("mock_user_id")?.value;

    let photoUrl = "";
    if (photoId) {
      const photo = await prisma.photo.findUnique({ where: { id: photoId } });
      if (photo) photoUrl = photo.url;
    }

    const order = await prisma.order.create({
      data: {
        client_id: userId || null,
        photo_url: photoUrl,
        total_amount: amountInINR,
        status: "pending",
        payment_status: "pending",
        payment_method: "razorpay",
        razorpay_order_id: razorpayOrder.id,
        shipping_address: "Digital Delivery",
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    console.error("Razorpay Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
