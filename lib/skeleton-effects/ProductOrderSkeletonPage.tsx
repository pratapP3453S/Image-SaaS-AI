export default function ProductOrderSkeletonPage() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6 animate-pulse transition-transform hover:scale-x-[1.02] hover:scale-y-[1.02] hover:shadow-xl duration-700">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Placeholder */}
        <div className="w-[200px] h-[150px] bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-lg skeleton shadow-sm" />

        {/* Text and Button Placeholder */}
        <div className="flex-grow space-y-4">
          <div className="h-6 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded w-40" />
          <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded w-3/5" />
          <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded w-2/5" />
          <div className="h-4 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded w-1/3" />

          {/* Simulate Button Placeholder */}
          <div className="mt-4 h-10 w-40 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 skeleton rounded-md" />
        </div>
      </div>
    </div>
  );
}