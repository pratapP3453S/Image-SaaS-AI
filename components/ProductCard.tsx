"use client";

import { IKImage } from "imagekitio-next";
import Link from "next/link";
import { IProduct, IMAGE_VARIANTS } from "@/lib/database/models/product.model";
import { Eye } from "lucide-react";

export default function ProductCard({ product }: { product: IProduct }) {
  const lowestPrice = product.variants.reduce(
    (min, variant) => (variant.price < min ? variant.price : min),
    product.variants[0]?.price || 0
  );

  return (
    <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow w-full max-w-[320px] mx-auto rounded-lg hover:scale-105">
      <figure className="relative px-4 pt-4">
        <Link
          href={`/image-e-com/products/${product._id}`}
          className="relative group w-full"
        >
          <div
            className="rounded-xl overflow-hidden relative w-full"
            style={{
              aspectRatio:
                IMAGE_VARIANTS.SQUARE.dimensions.width /
                IMAGE_VARIANTS.SQUARE.dimensions.height,
            }}
          >
            <IKImage
              path={product.imageUrl}
              alt={product.name}
              loading="eager"
              transformation={[
                {
                  height: IMAGE_VARIANTS.SQUARE.dimensions.height.toString(),
                  width: IMAGE_VARIANTS.SQUARE.dimensions.width.toString(),
                  cropMode: "extract",
                  focus: "center",
                  quality: "80",
                },
              ]}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-xl" />
        </Link>
      </figure>

      <div className="card-body p-6">
        <Link
          href={`/image-e-com/products/${product._id}`}
          className="hover:opacity-80 transition-opacity"
        >
          <h2 className="card-title text-xl font-bold text-gray-800">{product.name}</h2>
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        <div className="card-actions justify-between items-center mt-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-800">
              From ₹{lowestPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {product.variants.length} sizes available
            </span>
          </div>

          <Link
            href={`/image-e-com/products/${product._id}`}
            className="btn btn-primary btn-sm gap-2"
          >
            <Eye className="w-4 h-4" />
            View Options
          </Link>
        </div>
      </div>
    </div>
  );
}