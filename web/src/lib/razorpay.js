import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("WARNING: Razorpay keys are missing. Payments will fail.");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_dummy_build_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "dummy_build_secret",
});
