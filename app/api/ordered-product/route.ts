import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/mongoose";
import Product, { IProduct } from "@/lib/database/models/product.model";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find({}).lean();

    if (!products || products.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    await connectToDatabase();
    const body: IProduct = await request.json();

    if (
      !body.name ||
      !body.imageUrl ||
      !body.variants ||
      body.variants.length === 0
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate variants
    for (const variant of body.variants) {
      if (!variant.type || !variant.price || !variant.license) {
        return NextResponse.json(
          { error: "Invalid variant data" },
          { status: 400 }
        );
      }
    }

    const newProduct = await Product.create(body);
    return NextResponse.json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
