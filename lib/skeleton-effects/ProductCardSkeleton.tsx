import React from "react";

export default function ProductCardSkeleton() {
  return (
    // <div className="card bg-base-100 shadow-lg w-full max-w-[320px] mx-auto rounded-lg">
    //   {/* Image Skeleton */}
    //   <figure className="relative px-4 pt-4">
    //     <div
    //       className="rounded-xl overflow-hidden relative w-full"
    //       style={{
    //         aspectRatio: 1, // Match the aspect ratio of the ProductCard image
    //       }}
    //     >
    //       <div className="bg-gray-300 w-full h-full animate-pulse"></div>
    //     </div>
    //   </figure>

    //   {/* Body Skeleton */}
    //   <div className="card-body p-6">
    //     {/* Title Skeleton */}
    //     <div className="space-y-2">
    //       <div className="bg-gray-300 h-6 w-3/4 rounded animate-pulse"></div>
    //       <div className="bg-gray-300 h-4 w-1/2 rounded animate-pulse"></div>
    //     </div>

    //     {/* Description Skeleton */}
    //     <div className="space-y-2 mt-2">
    //       <div className="bg-gray-300 h-4 w-full rounded animate-pulse"></div>
    //       <div className="bg-gray-300 h-4 w-5/6 rounded animate-pulse"></div>
    //     </div>

    //     {/* Price & Button Skeleton */}
    //     <div className="card-actions justify-between items-center mt-4">
    //       <div className="flex flex-col space-y-2">
    //         <div className="bg-gray-300 h-6 w-20 rounded animate-pulse"></div>
    //         <div className="bg-gray-300 h-4 w-32 rounded animate-pulse"></div>
    //       </div>
    //       <div className="bg-gray-300 h-8 w-24 rounded animate-pulse"></div>
    //     </div>
    //   </div>
    // </div>
    
<div role="status" className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center">
    <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
    </div>
    <div className="w-full">
        <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
        <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
    </div>
    <span className="sr-only">Loading...</span>
</div>


  );
}