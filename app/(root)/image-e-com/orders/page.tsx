// "use client";

// import { useEffect, useState } from "react";
// import { IOrder } from "../../../../lib/database/models/order.model";
// import { Loader2, Download } from "lucide-react";
// import { IKImage } from "imagekitio-next";
// import { IMAGE_VARIANTS } from "../../../../lib/database/models/product.model";
// import { apiClient } from "@/lib/api-client";

// export default function OrdersPage() {
//   const [orders, setOrders] = useState<IOrder[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const data = await apiClient.getUserOrders();
//         setOrders(data);
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   if (loading) {
//     return (
//       <div className="min-h-[70vh] flex justify-center items-center">
//         <Loader2 className="w-12 h-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">My Orders</h1>
//       <div className="space-y-6">
//         {orders.map((order) => {
//           const variantDimensions =
//             IMAGE_VARIANTS[
//               order.variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
//             ].dimensions;

//           const product = order.productId as any;

//           return (
//             <div
//               key={order._id?.toString()}
//               className="card bg-base-100 shadow-xl"
//             >
//               <div className="card-body">
//                 <div className="flex flex-col md:flex-row gap-6">
//                   {/* Preview Image - Low Quality */}
//                   <div
//                     className="relative rounded-lg overflow-hidden bg-base-200"
//                     style={{
//                       width: "200px",
//                       aspectRatio: `${variantDimensions.width} / ${variantDimensions.height}`,
//                     }}
//                   >
//                     <IKImage
//                       urlEndpoint={process.env.NEXT_PUBLIC_URL_ENDPOINT}
//                       path={product.imageUrl}
//                       alt={`Order ${order._id?.toString().slice(-6)}`}
//                       transformation={[
//                         {
//                           quality: "60",
//                           width: variantDimensions.width.toString(),
//                           height: variantDimensions.height.toString(),
//                           cropMode: "extract",
//                           focus: "center",
//                         },
//                       ]}
//                       className="w-full h-full object-cover"
//                       loading="lazy"
//                     />
//                   </div>

//                   {/* Order Details */}
//                   <div className="flex-grow">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h2 className="text-xl font-bold mb-2">
//                           Order #{order._id?.toString().slice(-6)}
//                         </h2>
//                         <div className="space-y-1 text-base-content/70">
//                           <p>
//                             Resolution: {variantDimensions.width} x{" "}
//                             {variantDimensions.height}px
//                           </p>
//                           <p>
//                             License Type:{" "}
//                             <span className="capitalize">
//                               {order.variant.license}
//                             </span>
//                           </p>
//                           <p>
//                             Status:{" "}
//                             <span
//                               className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                                 order.status === "completed"
//                                   ? "bg-success/20 text-success"
//                                   : order.status === "failed"
//                                   ? "bg-error/20 text-error"
//                                   : "bg-warning/20 text-warning"
//                               }`}
//                             >
//                               {order.status}
//                             </span>
//                           </p>
//                         </div>
//                       </div>

//                       <div className="text-right">
//                         <p className="text-2xl font-bold mb-4">
//                         ₹{order.amount.toFixed(2)}
//                         </p>
//                         {order.status === "completed" && (
//                           <a
//                             href={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/tr:q-100,w-${variantDimensions.width},h-${variantDimensions.height},cm-extract,fo-center/${product.imageUrl}`}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="btn btn-primary gap-2"
//                             download={`image-${order._id
//                               ?.toString()
//                               .slice(-6)}.jpg`}
//                           >
//                             <Download className="w-4 h-4" />
//                             Download High Quality
//                           </a>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {orders.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-base-content/70 text-lg">No orders found</div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { IOrder } from "../../../../lib/database/models/order.model";
import { Loader2, Download, ArrowLeft } from "lucide-react";
import { IKImage } from "imagekitio-next";
import { IMAGE_VARIANTS } from "../../../../lib/database/models/product.model";
import { apiClient } from "@/lib/api-client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); // Get the Clerk user
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!user) return; // Ensure user is logged in
        const data = await apiClient.getUserOrders(user.id); // Pass clerkUserId
        console.log("This is may be clerkId", user.id, "This is data", data);
        setOrders(data);
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

  if (loading) {
    return (
      <div className="min-h-[70vh] flex justify-center items-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/profile")}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span className="text-sm font-medium">Back to Profile</span>
      </button>

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>

      {/* Orders List */}
      <div className="space-y-6">
        {orders.map((order) => {
          const variantDimensions =
            IMAGE_VARIANTS[
              order.variant.type.toUpperCase() as keyof typeof IMAGE_VARIANTS
            ].dimensions;

          const product = order.productId as any;

          return (
            <div
              key={order._id?.toString()}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              {/* <Link href={`/image-e-com/ordered-product/${product._id}`}> */}
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
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
                      <div
                        onClick={() =>
                          router.push(
                            `/image-e-com/ordered-product/${product._id}`
                          )
                        }
                      >
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          Order #{order._id?.toString().slice(-6)}
                        </h2>
                        <div className="space-y-2 text-gray-600">
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
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800 mb-4">
                          ₹{order.amount.toFixed(2)}
                        </p>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* No Orders Found */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No orders found</div>
          </div>
        )}
      </div>
    </div>
  );
}
