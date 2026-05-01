import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.status(200).json({
      order,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed" });
  }
});

router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.status(200).json({ message: "Payment verified" });
    }

    return res.status(400).json({ message: "Invalid payment signature" });
  } catch (error) {
    res.status(500).json({ message: "Payment verification failed" });
  }
});

export default router;
