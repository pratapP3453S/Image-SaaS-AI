// import { NextRequest, NextResponse } from "next/server";
// import Razorpay from "razorpay";
// import Order from "@/lib/database/models/order.model";
// import { connectToDatabase } from "@/lib/database/mongoose";
// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(req: NextRequest) {
//   const { user } = useUser();
//   const [mongoUserId, setMongoUserId] = useState(null);

//   useEffect(() => {
//     if (user) {
//       // Fetch MongoDB user ID using Clerk user ID
//       fetch(`/api/user?clerkUserId=${user.id}`)
//         .then((response) => response.json())
//         .then((data) => setMongoUserId(data.userId))
//         .catch((error) => console.error(error));
//     }
//   }, [user]);

//   try {
//     const { productId, variant } = await req.json();
//     await connectToDatabase();

//     // Create Razorpay order
//     const order = await razorpay.orders.create({
//       amount: Math.round(variant.price * 100),
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         productId: productId.toString(),
//       },
//     });
//     const newOrder = await Order.create({
//       userId: mongoUserId,
//       productId,
//       variant,
//       razorpayOrderId: order.id,
//       amount: variant.price,
//       status: "pending",
//     });

//     return NextResponse.json({
//       orderId: order.id,
//       amount: order.amount,
//       currency: order.currency,
//       dbOrderId: newOrder._id,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return NextResponse.json(
//       { error: "Failed to create order" },
//       { status: 500 }
//     );
//   }
// }


// import { NextRequest, NextResponse } from "next/server";
// import Razorpay from "razorpay";
// import Order from "@/lib/database/models/order.model";
// import { connectToDatabase } from "@/lib/database/mongoose";
// import User from "@/lib/database/models/user.model";

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID!,
//   key_secret: process.env.RAZORPAY_KEY_SECRET!,
// });

// export async function POST(req: NextRequest) {
//   try {
//     // Parse the request body
//     const { productId, variant, clerkUserId } = await req.json();

//     // Validate the payload
//     if (!productId || !variant || !clerkUserId) {
//       return NextResponse.json(
//         { error: "Missing required fields in the request payload" },
//         { status: 400 }
//       );
//     }

//     // Connect to the database
//     await connectToDatabase();
//     console.log("Connected to the database");

//     // Fetch MongoDB user ID using Clerk user ID
//     const user = await User.findOne({ clerkUserId });
//     if (!user) {
//       return NextResponse.json(
//         { error: "User not found in database" },
//         { status: 404 }
//       );
//     }
//     console.log("User found:", user._id);

//     // Create Razorpay order
//     const razorpayOrder = await razorpay.orders.create({
//       amount: Math.round(variant.price * 100), // Convert to paise
//       currency: "INR",
//       receipt: `receipt_${Date.now()}`,
//       notes: {
//         productId: productId.toString(),
//       },
//     });
//     console.log("Razorpay order created:", razorpayOrder.id);

//     // Save order to database
//     const newOrder = await Order.create({
//       userId: user._id, // MongoDB user ID
//       clerkId: clerkUserId, // Clerk user ID (as a string)
//       productId,
//       variant,
//       razorpayOrderId: razorpayOrder.id,
//       amount: variant.price,
//       status: "pending",
//     });
//     console.log("Order saved to database:", newOrder._id);

//     // Return success response
//     return NextResponse.json({
//       orderId: razorpayOrder.id,
//       amount: razorpayOrder.amount,
//       currency: razorpayOrder.currency,
//       dbOrderId: newOrder._id,
//     });
//   } catch (error: any) {
//     console.error("Error creating order:", error);
//     return NextResponse.json(
//       { error: "Failed to create order", details: error.message },
//       { status: 500 }
//     );
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import Order from "@/lib/database/models/order.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import User from "@/lib/database/models/user.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const payload = await req.json();
    console.log("Request Payload:", payload); // Log the payload for debugging

    const { productId, variant, clerkId } = payload;

    // Validate the payload
    if (!productId || !variant || !clerkId) {
      return NextResponse.json(
        {
          error: "Missing required fields in the request payload",
          details: {
            productId: !!productId,
            variant: !!variant,
            clerkId: !!clerkId,
          },
        },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDatabase();
    console.log("Connected to the database");

    // Fetch MongoDB user ID using Clerk user ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }
    console.log("User found:", user._id);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(variant.price * 100), // Convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        productId: productId.toString(),
      },
    });
    console.log("Razorpay order created:", razorpayOrder.id);

    // Save order to database
    const newOrder = await Order.create({
      userId: user._id, // MongoDB user ID
      clerkId: clerkId, // Clerk user ID (as a string)
      productId,
      variant,
      razorpayOrderId: razorpayOrder.id,
      amount: variant.price,
      status: "pending",
    });
    console.log("Order saved to database:", newOrder._id);

    // Return success response
    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      dbOrderId: newOrder._id,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}