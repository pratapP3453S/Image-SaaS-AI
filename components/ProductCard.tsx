import { IKImage } from "imagekitio-next";
import Link from "next/link";
import { IProduct, IMAGE_VARIANTS } from "../lib/database/models/product.model";
import { Eye } from "lucide-react";

export default function ProductCard({ product }: { product: IProduct }) {
  const lowestPrice = product.variants.reduce(
    (min, variant) => (variant.price < min ? variant.price : min),
    product.variants[0]?.price || 0
  );

  return (
    <div className="card bg-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-200">
      {/* Image Section */}
      <figure className="relative px-4 pt-4">
        <Link
          href={`image-e-com/products/${product._id}`}
          className="relative group w-full"
        >
          <div
            className="rounded-lg overflow-hidden relative w-full bg-gray-100"
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
        </Link>
      </figure>

      {/* Product Details */}
      <div className="card-body p-4">
        <Link
          href={`image-e-com/products/${product._id}`}
          className="hover:text-primary transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
        </Link>

        <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>

        {/* Pricing & CTA */}
        <div className="card-actions justify-between items-center mt-3">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-gray-900">
              From ₹{lowestPrice.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500">
              {product.variants.length} sizes available
            </span>
          </div>

          <Link
            href={`image-e-com/products/${product._id}`}
            className="btn btn-outline btn-sm border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <Eye className="w-4 h-4 text-gray-700" />
            View Options
          </Link>
        </div>
      </div>
    </div>
  );
}
