"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { IKImage, IKContext } from "imagekitio-react";
import { HeartFill } from "react-bootstrap-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LikedImage {
  _id: string;
  imageUrl: string;
  fileId: string;
  source: "kit1" | "kit2";
  createdAt: string;
}

const SkeletonLoader = ({ count = 10 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="relative aspect-square">
        <div className="w-full h-full bg-gray-200 animate-pulse rounded" />
      </div>
    ))}
  </div>
);

const LikedImages = () => {
  const [images, setImages] = useState<LikedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<LikedImage | null>(null);
  const [isUnliking, setIsUnliking] = useState<Record<string, boolean>>({});

  const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || "https://ik.imagekit.io/bi1q5easm";
  const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || "https://ik.imagekit.io/sz2nxx1mb";

  // Memoize endpoints to prevent unnecessary recalculations
  const endpoints = useMemo(() => ({
    kit1: KIT1_ENDPOINT,
    kit2: KIT2_ENDPOINT
  }), [KIT1_ENDPOINT, KIT2_ENDPOINT]);

  const fetchLiked = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/home-images/liked-images", {
        next: { revalidate: 60 } // Cache for 60 seconds
      });
      
      if (!res.ok) {
        throw new Error(res.status === 404 ? "No liked images found" : `Failed to fetch: ${res.status}`);
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      setImages(data);
    } catch (err) {
      console.error("Error fetching liked images:", err);
      setError(err instanceof Error ? err.message : "Failed to load liked images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiked();
  }, [fetchLiked]);

  const getImagePath = useCallback((url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/");
      const kitIndex = pathParts.findIndex(
        (part) => part === "bi1q5easm" || part === "sz2nxx1mb"
      );
      if (kitIndex !== -1 && kitIndex + 1 < pathParts.length) {
        return pathParts.slice(kitIndex + 1).join("/");
      }
      return urlObj.pathname.replace(/^\/?tr:[^/]+\//, "").substring(1);
    } catch {
      const kitMatch = url.match(/ik\.imagekit\.io\/(bi1q5easm|sz2nxx1mb)\/(.+)/);
      if (kitMatch && kitMatch[2]) return kitMatch[2].replace(/^tr:[^/]+\//, "");
      return url.split("/").pop() || url;
    }
  }, []);

  const openLightbox = (image: LikedImage) => {
    setSelectedImage(image);
    // Disable body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    // Re-enable body scroll
    document.body.style.overflow = '';
  };

  const navigateImage = useCallback((direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img._id === selectedImage._id);
    if (currentIndex === -1) return;

    let newIndex = direction === "prev"
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;

    setSelectedImage(images[newIndex]);
  }, [selectedImage, images]);

  const toggleLike = async (image: LikedImage) => {
    try {
      setIsUnliking(prev => ({ ...prev, [image._id]: true }));
      
      const response = await fetch("/api/home-images/unlike-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: image.imageUrl }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update like status");
      }

      setImages((prev) => prev.filter((img) => img._id !== image._id));
      
      // If the unliked image is currently open in the lightbox, close it
      if (selectedImage?._id === image._id) {
        closeLightbox();
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setIsUnliking(prev => ({ ...prev, [image._id]: false }));
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, navigateImage]);

  if (error) {
    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Error Loading Images</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchLiked}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              Retry
            </button>
            <Link
              href="/home-images"
              className="px-4 py-2 border border-purple-600 text-purple-600 rounded hover:bg-purple-50 transition"
            >
              Back to Gallery
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-600">Your Liked Images</h1>
        <Link
          href="/home-images"
          className="text-purple-600 border border-purple-600 px-4 py-2 rounded hover:bg-purple-50 transition-colors"
        >
          Back to Gallery
        </Link>
      </div>

      {loading ? (
        <SkeletonLoader />
      ) : images.length === 0 ? (
        <div className="text-center py-20">
          <div className="max-w-md mx-auto">
            <HeartFill className="mx-auto text-gray-300 text-5xl mb-4" />
            <h2 className="text-xl font-medium text-gray-600 mb-2">No Liked Images Yet</h2>
            <p className="text-gray-500 mb-6">Images you like will appear here</p>
            <Link
              href="/home-images"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-block transition-colors"
            >
              Browse Images
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <motion.div
              key={img._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative group cursor-pointer rounded-lg overflow-hidden shadow hover:shadow-md transition-all"
            >
              <div onClick={() => openLightbox(img)} className="aspect-square">
                <IKContext urlEndpoint={endpoints[img.source]}>
                  <IKImage
                    path={getImagePath(img.imageUrl)}
                    transformation={[{ width: "300", height: "300", quality: "80" }]}
                    loading="lazy"
                    lqip={{ active: true, quality: 20 }}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                </IKContext>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(img);
                }}
                disabled={isUnliking[img._id]}
                className={`absolute top-2 right-2 p-2 rounded-full transition-all ${
                  isUnliking[img._id] 
                    ? 'bg-white/90' 
                    : 'bg-white/80 hover:bg-white/90'
                }`}
                aria-label="Unlike image"
              >
                <HeartFill className={`text-red-500 ${isUnliking[img._id] ? 'opacity-70' : ''}`} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white text-4xl z-50 hover:text-gray-300 transition-colors"
              aria-label="Close lightbox"
            >
              &times;
            </button>

            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-6 text-white text-3xl hover:text-gray-300 transition-colors p-4"
              aria-label="Previous image"
            >
              &#10094;
            </button>

            <div className="max-w-4xl w-full p-4">
              <IKContext
                urlEndpoint={endpoints[selectedImage.source]}
              >
                <IKImage
                  path={getImagePath(selectedImage.imageUrl)}
                  transformation={[{ quality: "90" }]}
                  loading="lazy"
                  className="object-contain w-full max-h-[90vh]"
                />
              </IKContext>
            </div>

            <button
              onClick={() => navigateImage("next")}
              className="absolute right-6 text-white text-3xl hover:text-gray-300 transition-colors p-4"
              aria-label="Next image"
            >
              &#10095;
            </button>

            <div className="absolute bottom-6 left-0 right-0 text-center text-white">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(selectedImage);
                }}
                disabled={isUnliking[selectedImage._id]}
                className={`flex items-center justify-center mx-auto px-4 py-2 rounded-full ${
                  isUnliking[selectedImage._id]
                    ? 'bg-white/20'
                    : 'bg-white/10 hover:bg-white/20'
                } transition-colors`}
              >
                <HeartFill className="text-red-500 mr-2" />
                {isUnliking[selectedImage._id] ? 'Removing...' : 'Remove from Liked'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LikedImages;