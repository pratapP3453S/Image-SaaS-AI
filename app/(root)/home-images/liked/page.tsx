"use client";

import { useEffect, useState, useCallback } from "react";
import { IKImage, IKContext } from "imagekitio-react";
import { HeartFill, ArrowLeft } from "react-bootstrap-icons";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LikedImage {
  _id: string;
  imageUrl: string;
  fileId: string;
  source: "kit1" | "kit2";
  createdAt: string;
}

const LikedImages = () => {
  const [images, setImages] = useState<LikedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<LikedImage | null>(null);

  const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || "https://ik.imagekit.io/bi1q5easm";
  const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || "https://ik.imagekit.io/sz2nxx1mb";

  const fetchLiked = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/home-images/liked-images");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format received");

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

  const getImagePath = (url: string) => {
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
  };

  const openLightbox = (image: LikedImage) => {
    setSelectedImage(image);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img._id === selectedImage._id);
    if (currentIndex === -1) return;

    let newIndex = direction === "prev"
      ? (currentIndex - 1 + images.length) % images.length
      : (currentIndex + 1) % images.length;

    setSelectedImage(images[newIndex]);
  };

  const toggleLike = async (image: LikedImage) => {
    try {
      const response = await fetch("/api/home-images/unlike-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: image.imageUrl }),
      });
      if (!response.ok) throw new Error("Failed to update like status");

      setImages((prev) => prev.filter((img) => img._id !== image._id));
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-600">Your Liked Images</h1>
        <Link
          href="/home-images"
          className="text-purple-600 border px-4 py-2 rounded hover:bg-purple-100"
        >
          Back to Gallery
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img) => (
          <div
            key={img._id}
            onClick={() => openLightbox(img)}
            className="relative cursor-pointer rounded overflow-hidden shadow hover:shadow-lg transition"
          >
            <IKContext urlEndpoint={img.source === "kit1" ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
              <IKImage
                path={getImagePath(img.imageUrl)}
                transformation={[{ width: "300", height: "300" }]}
                className="object-cover w-full h-full aspect-square"
              />
            </IKContext>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(img);
              }}
              className="absolute top-2 right-2 bg-white/80 p-2 rounded-full"
            >
              <HeartFill className="text-red-500" />
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-4xl z-50"
          >
            &times;
          </button>

          <button
            onClick={() => navigateImage("prev")}
            className="absolute left-6 text-white text-3xl"
          >
            &#10094;
          </button>

          <div className="max-w-4xl w-full p-4">
            <IKContext
              urlEndpoint={
                selectedImage.source === "kit1" ? KIT1_ENDPOINT : KIT2_ENDPOINT
              }
            >
              <IKImage
                path={getImagePath(selectedImage.imageUrl)}
                className="object-contain w-full max-h-[90vh]"
              />
            </IKContext>
          </div>

          <button
            onClick={() => navigateImage("next")}
            className="absolute right-6 text-white text-3xl"
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default LikedImages;