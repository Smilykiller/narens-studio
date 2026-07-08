import { NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const { bookingId } = await request.json();
    // Deposit amount: Flat ₹5,000 for all bookings
    const amountInINR = 5000;
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `deposit_rcpt_${bookingId.substring(0, 8)}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save the razorpay_order_id to the booking (We need to add this to the model, or just use notes/status for now. Wait, Booking model doesn't have razorpay fields. Let's just create an Invoice and link it.)
    // Create an Invoice for the deposit
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking)
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });

    const invoice = await prisma.invoice.create({
      data: {
        client_id: booking.client_id,
        amount: amountInINR,
        status: "unpaid",
        due_date: new Date(),
        description: `Deposit for booking: ${booking.title}`,
        // Ideally we'd store razorpay_order_id here too if we added it to Invoice model. For now we just return the order to client.
      },
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      invoiceId: invoice.id,
    });
  } catch (error) {
    console.error("Razorpay Create Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
