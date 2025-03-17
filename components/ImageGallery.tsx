import { Loader2 } from "lucide-react";
import { IProduct } from "../lib/database/models/product.model";
import ProductCard from "./ProductCard";

interface ImageGalleryProps {
  products: IProduct[] | null; // Allow null for loading state
  isLoading: boolean;
}

export default function ImageGallery({ products, isLoading }: ImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading ? (
      <div className="min-h-[70vh] flex justify-center items-center ">
      <Loader2 className="w-12 h-12 animate-spin text-primary flex justify-center items-center" />
    </div>
      ) : products && products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product._id?.toString()} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-12">
          <p className="text-base-content/70">No products found</p>
        </div>
      )}
    </div>
  );
}
