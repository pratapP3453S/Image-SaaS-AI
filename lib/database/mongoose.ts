import mongoose, { Mongoose } from 'mongoose';
import User from "@/lib/database/models/user.model";
import Product from "@/lib/database/models/product.model";
import Order from "@/lib/database/models/order.model";

const MONGODB_URL = process.env.MONGODB_URL!;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

let cached: MongooseConnection = (global as any).mongoose

if(!cached) {
  cached = (global as any).mongoose = { 
    conn: null, promise: null 
  }
}

export const connectToDatabase = async () => {
  if(cached.conn) return cached.conn;

  if(!MONGODB_URL) throw new Error('Missing MONGODB_URL');

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, { dbName: 'imaginify', bufferCommands: false }).then((mongoose) => {
      // Re-register models after connecting because of some issues 
      mongoose.model("User", User.schema);
      mongoose.model("Product", Product.schema);
      mongoose.model("Order", Order.schema);
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}