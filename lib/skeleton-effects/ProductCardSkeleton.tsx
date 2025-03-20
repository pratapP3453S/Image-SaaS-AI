import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div className="card bg-base-100 shadow-lg w-full max-w-[320px] mx-auto rounded-lg">
      {/* Image Skeleton */}
      <figure className="relative px-4 pt-4">
        <div
          className="rounded-xl overflow-hidden relative w-full"
          style={{
            aspectRatio: 1, // Match the aspect ratio of the ProductCard image
          }}
        >
          <div className="bg-gray-300 w-full h-full animate-pulse"></div>
        </div>
      </figure>

      {/* Body Skeleton */}
      <div className="card-body p-6">
        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="bg-gray-300 h-6 w-3/4 rounded animate-pulse"></div>
          <div className="bg-gray-300 h-4 w-1/2 rounded animate-pulse"></div>
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2 mt-2">
          <div className="bg-gray-300 h-4 w-full rounded animate-pulse"></div>
          <div className="bg-gray-300 h-4 w-5/6 rounded animate-pulse"></div>
        </div>

        {/* Price & Button Skeleton */}
        <div className="card-actions justify-between items-center mt-4">
          <div className="flex flex-col space-y-2">
            <div className="bg-gray-300 h-6 w-20 rounded animate-pulse"></div>
            <div className="bg-gray-300 h-4 w-32 rounded animate-pulse"></div>
          </div>
          <div className="bg-gray-300 h-8 w-24 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}