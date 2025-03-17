import Order from "@/lib/database/models/order.model";
import { connectToDatabase } from "@/lib/database/mongoose";
import { handleError } from "../utils";

export async function getUserOrdersCount(userId: string) {
  try {
    await connectToDatabase();
    
    const orderCount = await Order.countDocuments({ userId });
    return orderCount;
  } catch (error) {
    handleError(error)
  }
}
