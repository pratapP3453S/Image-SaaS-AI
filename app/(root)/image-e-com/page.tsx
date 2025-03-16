"use client";

import React, { useEffect, useState } from "react";
import ImageGallery from "../../../components/ImageGallery";
import { IProduct } from "../../../lib/database/models/product.model";
import { apiClient } from "@/lib/api-client";

export default function Home() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true)
        const data = await apiClient.getProducts();
        console.log(data)
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);
 
  return (
    // <main className="container mx-auto px-4 py-8">
    //   <h1 className="text-3xl font-bold mb-8">ImageKit Shop</h1>
      <ImageGallery products={products} isLoading={isLoading} />
    // </main> 
  );
}
