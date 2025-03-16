import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Order from "@/lib/database/models/order.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { sendPaymentSuccessEmail, sendPaymentUnsuccessEmail } from "@/lib/SendPaymentEmail";
// import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    console.log(body)
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    console.log("yes completed.")
    const event = JSON.parse(body);
    await connectToDatabase();

    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: payment.order_id },
        {
          razorpayPaymentId: payment.id,
          status: 'completed',
        }
      ).populate([
        { path: 'userId', select: 'email' },
        { path: 'productId', select: 'name amount razorpayOrderId' }, // Populate once with required fields
      ]);
      if (order) {
        // Send email only after payment is confirmed
        await sendPaymentSuccessEmail(
          order.userId.email, // Access email from userId
          order.productId.name, // Product name
          order.amount, // Amount
          order.razorpayOrderId, // Order ID
        );
      }
      //send email for unsuccessful payment
      if(!order){
        await sendPaymentUnsuccessEmail(
          order.userId.email, 
          order.productId.name, 
          order.amount, 
          order.razorpayOrderId,
        )
      }
       return NextResponse.json(order, { status: 200 })
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
