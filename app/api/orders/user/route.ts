// "use client"

// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/lib/database/mongoose";
// import Order from "@/lib/database/models/order.model";
// import { useUser } from "@clerk/nextjs";
// import { useEffect, useState } from "react";

// export async function GET() {
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
//     await connectToDatabase();
//     const orders = await Order.find({ userId: mongoUserId })
//       .populate({
//         path: "productId",
//         select: "imageUrl name",
//         // Return null if product not found instead of throwing error
//         options: { strictPopulate: false },
//       })
//       .sort({ createdAt: -1 })
//       .lean();

//     const validOrders = orders.map((order) => ({
//       ...order,
//       productId: order.productId || {
//         imageUrl: null,
//         name: "Product no longer available",
//       },
//     }));

//     return NextResponse.json(validOrders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Order from "@/lib/database/models/order.model";
import User from "@/lib/database/models/user.model"; // Import User model

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("clerkId"); // Get clerkUserId from query params

    if (!clerkId) {
      return NextResponse.json(
        { error: "clerkId is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Fetch MongoDB user ID using Clerk user ID
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // Fetch orders for the user
    const orders = await Order.find({ userId: user._id })
      .populate({
        path: "productId",
        select: "imageUrl name",
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    const validOrders = orders.map((order) => ({
      ...order,
      productId: order.productId || {
        imageUrl: null,
        name: "Product no longer available",
      },
    }));

    return NextResponse.json(validOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}