"use client";

import { IKImage } from "imagekitio-next";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  Check,
  Image as ImageIcon,
  ArrowLeft,
  Download,
} from "lucide-react";
import { useNotification } from "../../../../../components/Notification";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import {
  IMAGE_VARIANTS,
  ImageVariantType,
} from "@/lib/database/models/product.model";
import { IOrder } from "@/lib/database/models/order.model";
import Link from "next/link";
import GoBackPage from "@/components/shared/GoBackPage";

export default function OrderDetailsPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<IOrder | null>(null);
  const { showNotification } = useNotification();
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = params?.id;
      console.log("Fetching order with ID:", orderId);

      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getOrderedProductDetail(
          orderId.toString()
        );
        console.log("Order data:", data);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params?.id]);

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

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { mode: "cors" }); // Fetch the image
      const blob = await response.blob(); // Convert to Blob
      const blobUrl = URL.createObjectURL(blob); // Create temporary URL

      const link = document.createElement("a"); // Create a download link
      link.href = blobUrl;
      link.download = filename; // Set filename
      document.body.appendChild(link);
      link.click(); // Trigger download
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Clean up
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (loading)
    return (
      <>
        <GoBackPage linkto="/image-e-com/orders" backto="Back to Orders" />
        <div className="min-h-[70vh] flex justify-center items-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </>
    );

  if (error || !order)
    return (
      <>
        <GoBackPage linkto="/image-e-com/orders" backto="Back to Orders" />
        <div className="alert alert-error max-w-md mx-auto my-8">
          <AlertCircle className="w-6 h-6" />
          <span>{error || "Order not found"}</span>
        </div>
      </>
    );

  const product = order.productId as any; // Assuming product is populated in the order
  const variantDimensions =
    IMAGE_VARIANTS[
      order.variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
    ].dimensions;

  return (
    <>
      {/* Back Button */}
      <GoBackPage linkto="/image-e-com/orders" backto="Back to Orders" />

      {/* Order Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div
              className="relative rounded-lg overflow-hidden bg-gray-100"
              style={{
                aspectRatio: `${variantDimensions.width} / ${variantDimensions.height}`,
              }}
            >
              <IKImage
                urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
                path={product.imageUrl}
                alt={product.name}
                transformation={getTransformation(order.variant.type)}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Image Dimensions Info */}
            <div className="text-sm text-center text-gray-600">
              Preview: {variantDimensions.width} x {variantDimensions.height}px
            </div>
          </div>

          {/* Order Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg">{product.description}</p>
            </div>

            {/* Variant Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Order Details
              </h2>
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5 text-gray-700" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {
                        IMAGE_VARIANTS[
                          order.variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                        ].label
                      }
                    </h3>
                    <p className="text-sm text-gray-600">
                      {variantDimensions.width} x {variantDimensions.height}px •{" "}
                      <span className="capitalize">
                        {order.variant.license}
                      </span>{" "}
                      license
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-800">
                    Price: <span className="text-yellow-700">₹</span>
                    {order.amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "failed"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Download Button */}
            {order.status === "completed" && (
              <button
                onClick={() =>
                  handleDownload(
                    `${process.env.NEXT_PUBLIC_URL_ENDPOINT}/tr:q-100,w-${variantDimensions.width},h-${variantDimensions.height},cm-extract,fo-center/${product.imageUrl}`,
                    `image-${order._id?.toString().slice(-6)}.jpg`
                  )
                }
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download High Quality
              </button>
            )}

            {/* License Information */}
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">
                License Information
              </h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">
                    Personal: Use in personal projects
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-600">
                    Commercial: Use in commercial projects
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
