"use client";

import { IKImage } from "imagekitio-next";
import {
  IProduct,
  ImageVariant,
  IMAGE_VARIANTS,
  ImageVariantType,
} from "../../../../../lib/database/models/product.model";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Check,
  Image as ImageIcon,
  ArrowLeft,
} from "lucide-react";
import { useNotification } from "../../../../../components/Notification";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ImageVariant | null>(
    null
  );
  const { showNotification } = useNotification();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchProduct = async () => {
      const id = params?.id;

      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getProduct(id.toString());
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  const handlePurchase = async (variant: ImageVariant) => {
    if (!product?._id) {
      showNotification("Invalid product", "error");
      return;
    }

    if (!user) {
      showNotification("Please sign in to proceed with the purchase", "error");
      return;
    }

    try {
      const { orderId, amount } = await apiClient.createOrder({
        productId: product._id,
        variant,
        clerkId: user?.id, // Pass the Clerk user ID
      });

      // if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      //   showNotification("Razorpay key is missing", "error");
      //   return;
      // }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "ImageKit Shop",
        description: `${product.name} - ${variant.type} Version`,
        order_id: orderId,
        handler: function () {
          showNotification("Payment successful!", "success");
          router.replace("/image-e-com/orders");
        },
        // prefill: {
        //   email: session.user.email,
        // },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(error);
      showNotification(
        error instanceof Error ? error.message : "Payment failed",
        "error"
      );
    }
  };

  const getTransformation = (variantType: ImageVariantType) => {
    const variant = IMAGE_VARIANTS[variantType];
    return [
      {
        width: variant.dimensions.width.toString(),
        height: variant.dimensions.height.toString(),
        cropMode: "extract",
        focus: "center",
        quality: "60",
      },
    ];
  };

  if (loading)
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );

  if (error || !product)
    return (
      <div className="alert alert-error max-w-md mx-auto my-8">
        <AlertCircle className="w-6 h-6" />
        <span>{error || "Product not found"}</span>
      </div>
    );

  return (
<>
      {/* Back Button */}
      <div className="container mx-auto px-4">
        <button
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <Link href={`/image-e-com`}>
        <ArrowLeft className="w-5 h-5 mr-2 inline-block" />
        <span className="text-sm font-medium">Back to Shop</span>
        </Link>
      </button>
      </div>

      {/* Product Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div
              className="relative rounded-lg overflow-hidden bg-gray-100"
              style={{
                aspectRatio: selectedVariant
                  ? `${IMAGE_VARIANTS[selectedVariant.type].dimensions.width} / ${
                      IMAGE_VARIANTS[selectedVariant.type].dimensions.height
                    }`
                  : "1 / 1",
              }}
            >
              <IKImage
                urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
                path={product.imageUrl}
                alt={product.name}
                transformation={
                  selectedVariant
                    ? getTransformation(selectedVariant.type)
                    : getTransformation("SQUARE")
                }
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Image Dimensions Info */}
            {selectedVariant && (
              <div className="text-sm text-center text-gray-600">
                Preview: {IMAGE_VARIANTS[selectedVariant.type].dimensions.width} x{" "}
                {IMAGE_VARIANTS[selectedVariant.type].dimensions.height}px
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Variants Selection */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Available Versions</h2>
              {product.variants.map((variant: any) => (
                <div
                  key={variant.type}
                  className={`p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                    selectedVariant?.type === variant.type ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="w-5 h-5 text-gray-700" />
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {
                            IMAGE_VARIANTS[
                              variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                            ].label
                          }
                        </h3>
                        <p className="text-sm text-gray-600">
                          {
                            IMAGE_VARIANTS[
                              variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                            ].dimensions.width
                          }{" "}
                          x{" "}
                          {
                            IMAGE_VARIANTS[
                              variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                            ].dimensions.height
                          }
                          px • {variant.license} license
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-800">
                        ₹{variant.price.toFixed(2)}
                      </span>
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(variant);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* License Information */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">License Information</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Personal: Use in personal projects</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">Commercial: Use in commercial projects</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
