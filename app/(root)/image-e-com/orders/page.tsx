"use client";

import { useEffect, useState } from "react";
import { IOrder } from "../../../../lib/database/models/order.model";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { IKImage } from "imagekitio-next";
import { IMAGE_VARIANTS } from "../../../../lib/database/models/product.model";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ProductOrderSkeletonPage from "@/lib/skeleton-effects/ProductOrderSkeletonPage";
import Link from "next/link";
import GoBackPage from "@/components/shared/GoBackPage";

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNoOrders, setShowNoOrders] = useState(false); // State to control "No orders found" message
  const { user } = useUser(); // Get the Clerk user
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user) return; // Ensure user is logged in
        const data = await apiClient.getUserOrders(user.id); // Pass clerkUserId
        setOrders(data);

        // If no orders, set a timeout to show "No orders found" after 3 seconds
        if (data.length === 0) {
          setTimeout(() => {
            setShowNoOrders(true);
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error("Failed to download image");
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
      toast.success("Download started!");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <GoBackPage linkto="/profile" backto="Back to Profile" />

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 dark:text-slate-200">
        My Orders
      </h1>

      {loading ? (
        // Show skeleton effect while loading
        <div className="space-y-6">
          {[...Array(3)].map((_, index) => (
            // <div key={index} className="bg-gray-300 rounded-lg p-6 animate-pulse">
            <ProductOrderSkeletonPage key={index} />
            // </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Show "No orders found" after 3 seconds if orders.length === 0 */}
          {orders.length === 0 && showNoOrders ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No orders found</div>
            </div>
          ) : orders.length === 0 ? (
            // Show skeleton effect for 3 seconds before showing "No orders found"
            <div className="space-y-6">
              {[...Array(3)].map((_, index) => (
                // <div key={index} className="bg-gray-300 rounded-lg p-6 animate-pulse">
                <ProductOrderSkeletonPage key={index} />
                // </div>
              ))}
            </div>
          ) : (
            // Render orders if available
            orders.map((order) => {
              const variantDimensions =
                IMAGE_VARIANTS[
                  order.variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
                ].dimensions;

              const product = order.productId as any;

              return (
                <div
                  key={order._id?.toString()}
                  className="dark:shadow-slate-500 dark:bg-gradient-to-br dark:from-slate-500 dark:to-slate-700 bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-x-[1.02] hover:scale-y-[1.02] hover:shadow-lg duration-700"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                      {/* Preview Image - Low Quality */}
                      <div
                        className="relative rounded-lg overflow-hidden bg-gray-100"
                        style={{
                          width: "200px",
                          aspectRatio: `${variantDimensions.width} / ${variantDimensions.height}`,
                        }}
                      >
                        <IKImage
                          urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
                          path={product.imageUrl}
                          alt={`Order ${order._id?.toString().slice(-6)}`}
                          transformation={[
                            {
                              quality: "60",
                              width: variantDimensions.width.toString(),
                              height: variantDimensions.height.toString(),
                              cropMode: "extract",
                              focus: "center",
                            },
                          ]}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* Order Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                          <Link
                            href={
                              // TODO: resolve the below issue
                              // `/image-e-com/ordered-product/${product._id}`
                              // until the issue resolve for the above route take to the below route...
                              `/image-e-com/products/${product._id}`
                            }
                            className="cursor-pointer"
                          >
                            <h2 className="text-xl font-bold text-gray-800 mb-2 dark:text-slate-200">
                              Order #{order._id?.toString().slice(-6)}
                            </h2>
                            <div className="space-y-2 text-gray-600 dark:text-slate-200">
                              <p>
                                Resolution: {variantDimensions.width} x{" "}
                                {variantDimensions.height}px
                              </p>
                              <p>
                                License Type:{" "}
                                <span className="capitalize font-medium">
                                  {order.variant.license}
                                </span>
                              </p>
                              <p>
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
                          </Link>

                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-800 mb-4 dark:text-slate-200">
                              <span className="text-yellow-500">₹</span>
                              {order.amount.toFixed(2)}
                            </p>
                            {order.status === "completed" && (
                              <button
                                aria-label="Download high-quality image"
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
