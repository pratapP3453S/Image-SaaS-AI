import { Loader2 } from "lucide-react";
import { IProduct } from "../lib/database/models/product.model";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "@/lib/skeleton-effects/ProductCardSkeleton";

interface ImageGalleryProps {
  products: IProduct[] | null; // Allow null for loading state
  isLoading: boolean;
}

export default function ImageGallery({ products, isLoading }: ImageGalleryProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 3xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading State
          // <div className="col-span-full min-h-[70vh] flex justify-center items-center">
          //   <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          // </div>
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex justify-center items-center">
              <ProductCardSkeleton />
            </div>
          ))
        ) : products && products.length > 0 ? (
          // Product Cards
          products.map((product) => (
            <div key={product._id?.toString()} className="flex justify-center items-center">
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          // No Products Found
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600 text-lg">No products found </p>
          </div>
        )}
      </div>
    </div>
  );
}
