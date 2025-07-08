"use client";

import { useState, useEffect } from "react";
import { IKImage, IKContext } from "imagekitio-react";

interface ImageItem {
  fileId: string;
  filePath: string;
  thumbnailUrl: string;
  url: string;
  height: number;
  width: number;
}

const HomeImageGallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const limit = 100; // Max limit per request

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/home-images?limit=${limit}&skip=${skip}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const formattedImages: ImageItem[] = data.map((item: any) => ({
        fileId: item.fileId,
        filePath: item.filePath,
        thumbnailUrl: `${item.url}?tr=w-300,h-300`,
        url: item.url,
        height: item.height || 800,
        width: item.width || 600,
      }));

      setImages((prev) => [...prev, ...formattedImages]);
      setHasMore(data.length === limit);
      setSkip((prev) => prev + limit);
    } catch (error) {
      console.error("Error fetching images:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const openLightbox = (image: ImageItem) => {
    setSelectedImage(image);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.fileId === selectedImage.fileId);
    const newIndex = direction === "prev"
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-10 text-purple-600">Image Gallery</h1>

      <IKContext urlEndpoint="https://ik.imagekit.io/bi1q5easm">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((image) => (
            <div
              key={image.fileId}
              className="cursor-pointer rounded-lg shadow-md overflow-hidden hover:scale-105 transition-transform"
              onClick={() => openLightbox(image)}
            >
              <IKImage
                path={image.filePath}
                transformation={[{ height: 300, width: 300 }]}
                loading="lazy"
                className="object-cover w-full h-full aspect-square"
                alt={`Image ${image.fileId}`}
              />
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={fetchImages}
              disabled={loading}
              className="px-6 py-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-md disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </IKContext>

      {isOpen && selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-6 text-white text-3xl hover:text-gray-400"
          >
            &times;
          </button>

          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-4 text-white text-4xl hover:text-purple-400"
          >
            &#10094;
          </button>

          <div className="relative p-4 max-w-4xl w-full">
            <IKContext urlEndpoint="https://ik.imagekit.io/bi1q5easm">
              <IKImage
                path={selectedImage.filePath}
                transformation={[{ height: 1080, width: 1080 }]}
                loading="lazy"
                className="rounded-lg max-h-[90vh] mx-auto object-contain shadow-xl"
                alt={`Full image ${selectedImage.fileId}`}
              />
            </IKContext>
          </div>

          <button
            onClick={() => navigateImage("next")}
            className="absolute right-4 text-white text-4xl hover:text-purple-400"
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeImageGallery;