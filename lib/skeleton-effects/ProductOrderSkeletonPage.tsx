import React from "react";

function ProductOrderSkeletonPage() {
  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-[200px] h-[150px] bg-gray-200 rounded-lg"></div>
      <div className="flex-grow space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
  );
}

export default ProductOrderSkeletonPage;
