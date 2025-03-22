

export default function ProductOrderSkeletonPage() {
  return (
<div className="card bg-base-100 shadow-lg w-full max-w-[640px] mx-auto rounded-lg h-full bg-slate-200 dark:bg-gray-600 animate-pulse">
  <div className="flex flex-col md:flex-row">
    {/* Image Skeleton (Top on Mobile, Left on Desktop) */}
    <figure className="relative p-4 w-full md:w-1/2 h-10">
      <div
        className="rounded-xl overflow-hidden relative w-full h-52"
        style={{
          aspectRatio: 1, // Match the aspect ratio of the ProductCard image
        }}
      >
        <div className="bg-gray-300 dark:bg-gray-700 w-full h-full animate-pulse"></div>
      </div>
    </figure>

    {/* Body Skeleton (Bottom on Mobile, Right on Desktop) */}
    <div className="card-body p-6 w-full md:w-1/2">
      {/* Title Skeleton */}
      <div className="space-y-2">
        <div className="bg-gray-300 dark:bg-gray-700 h-6 w-3/4 rounded animate-pulse"></div>
        <div className="bg-gray-300 dark:bg-gray-700 h-4 w-1/2 rounded animate-pulse"></div>
      </div>

      {/* Description Skeleton */}
      <div className="space-y-2 mt-2">
        <div className="bg-gray-300 dark:bg-gray-700 h-4 w-full rounded animate-pulse"></div>
        <div className="bg-gray-300 dark:bg-gray-700 h-4 w-5/6 rounded animate-pulse"></div>
      </div>

      {/* Price & Button Skeleton */}
      <div className="card-actions justify-between items-center mt-4">
        <div className="flex flex-col space-y-2">
          <div className="bg-gray-300 dark:bg-gray-700 h-6 w-20 rounded animate-pulse"></div>
          <div className="bg-gray-300 dark:bg-gray-700 h-4 w-32 rounded animate-pulse"></div>
        </div>
        <div className="bg-gray-300 dark:bg-gray-700 h-8 w-24 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
</div>
  );
}
