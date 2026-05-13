import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/lib/database/models/order.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { sendPaymentSuccessEmail, sendPaymentUnsuccessEmail } from "@/lib/SendPaymentEmail";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Validate the webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    await connectToDatabase();

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;

      // Find and update the order
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: "completed",
        },
        { new: true } // Return the updated document
      ).populate([
        { path: "userId", select: "email" },
        { path: "productId", select: "name amount razorpayOrderId" },
      ]);

      if (!order) {
        console.error("Order not found for payment.captured event");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Send payment success email
      try {
        await sendPaymentSuccessEmail(
          order.userId.email, // User email
          order.productId.name, // Product name
          order.amount, // Amount
          order.razorpayOrderId // Order ID
        );
        console.log("Payment success email sent");
      } catch (emailError) {
        console.error("Failed to send payment success email:", emailError);
      }

      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    // Handle payment.failed event
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;

      // Find and update the order
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: "failed",
        },
        { new: true } // Return the updated document
      ).populate([
        { path: "userId", select: "email" },
        { path: "productId", select: "name amount razorpayOrderId" },
      ]);

      if (!order) {
        console.error("Order not found for payment.failed event");
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // Send payment unsuccessful email
      try {
        await sendPaymentUnsuccessEmail(
          order.userId.email, // User email
          order.productId.name, // Product name
          order.amount, // Amount
          order.razorpayOrderId // Order ID
        );
        console.log("Payment unsuccessful email sent");
      } catch (emailError) {
        console.error("Failed to send payment unsuccessful email:", emailError);
      }

      return NextResponse.json({ success: true, order }, { status: 200 });
    }

    // If the event is not handled, return a success response
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}