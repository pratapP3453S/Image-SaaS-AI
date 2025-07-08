// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { IKImage, IKContext } from "imagekitio-react";
// import { useRouter } from "next/navigation";

// interface ImageItem {
//   fileId: string;
//   filePath: string;
//   thumbnailUrl: string;
//   url: string;
//   height: number;
//   width: number;
//   source: 'kit1' | 'kit2';
// }

// const HomeImageGallery = () => {
//   const [images, setImages] = useState<ImageItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [skip, setSkip] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [likedImages, setLikedImages] = useState<string[]>([]);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const [currentSource, setCurrentSource] = useState<'kit1' | 'kit2'>('kit1');
//   const router = useRouter();

//   const limit = 100;

//   const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || 'https://ik.imagekit.io/bi1q5easm';
//   const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || 'https://ik.imagekit.io/sz2nxx1mb';

//   const fetchImages = useCallback(async () => {
//     if (!hasMore) return;
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/home-images?limit=${limit}&skip=${skip}&source=${currentSource}`);
//       if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//       const data = await response.json();
//       if (data.length === 0) {
//         if (currentSource === 'kit1') {
//           setCurrentSource('kit2');
//           setSkip(0);
//           return;
//         }
//         setHasMore(false);
//         return;
//       }
//       const formattedImages: ImageItem[] = data.map((item: any) => ({
//         fileId: item.fileId,
//         filePath: item.filePath,
//         thumbnailUrl: `${item.url}?tr=w-300,h-300`,
//         url: item.url,
//         height: item.height || 800,
//         width: item.width || 600,
//         source: currentSource,
//       }));
//       setImages((prev) => [...prev, ...formattedImages]);
//       setSkip((prev) => prev + limit);
//     } catch (error) {
//       console.error("Error fetching images:", error);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [skip, hasMore, currentSource]);

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   useEffect(() => {
//     const fetchLiked = async () => {
//       const res = await fetch("/api/home-images/liked-images");
//       if (res.ok) {
//         const data = await res.json();
//         setLikedImages(data.map((item: any) => item.imageUrl));
//       }
//     };
//     fetchLiked();
//   }, []);

//   useEffect(() => {
//     if (!sentinelRef.current || !hasMore) return;
//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !loading) {
//           fetchImages();
//         }
//       },
//       { threshold: 0.1 }
//     );
//     const currentSentinel = sentinelRef.current;
//     if (currentSentinel) observer.observe(currentSentinel);
//     return () => {
//       if (currentSentinel) observer.unobserve(currentSentinel);
//     };
//   }, [loading, hasMore, fetchImages]);

//   const openLightbox = (image: ImageItem) => {
//     setSelectedImage(image);
//     setIsOpen(true);
//   };

//   const closeLightbox = () => {
//     setIsOpen(false);
//     setSelectedImage(null);
//   };

//   const navigateImage = (direction: "prev" | "next") => {
//     if (!selectedImage) return;
//     const currentIndex = images.findIndex(img => img.fileId === selectedImage.fileId);
//     if (currentIndex === -1) return;
//     let newIndex;
//     if (direction === "prev") {
//       newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
//     } else {
//       newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
//     }
//     setSelectedImage(images[newIndex]);
//   };

//   const toggleLike = async (image: ImageItem) => {
//     const isLiked = likedImages.includes(image.url);
//     const endpoint = isLiked ? "/api/home-images/unlike-image" : "/api/home-images/like-image";
//     const method = isLiked ? "DELETE" : "POST";
//     await fetch(endpoint, {
//       method,
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         imageUrl: image.url,
//         fileId: image.fileId,
//         source: image.source,
//       }),
//     });
//     setLikedImages((prev) =>
//       isLiked ? prev.filter((url) => url !== image.url) : [...prev, image.url]
//     );
//   };

//   useEffect(() => {
//     if (!isOpen) return;
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeLightbox();
//       else if (e.key === 'ArrowLeft') navigateImage('prev');
//       else if (e.key === 'ArrowRight') navigateImage('next');
//     };
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [isOpen, selectedImage, images]);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex items-center justify-between mb-10">
//         <h1 className="text-4xl font-bold text-purple-600">Image Gallery</h1>
//         <button
//           onClick={() => router.push("/home-images/liked")}
//           className="text-3xl hover:text-purple-500"
//         >
//           ❤️
//         </button>
//       </div>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//         {images.map((image) => (
//           <div
//             key={`${image.source}-${image.fileId}`}
//             className="relative cursor-pointer rounded-lg shadow-md overflow-hidden hover:scale-105 transition-transform"
//             onClick={() => openLightbox(image)}
//           >
//             <IKContext urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
//               <IKImage
//                 path={image.filePath}
//                 transformation={[{ height: 300, width: 300 }]}
//                 loading="lazy"
//                 className="object-cover w-full h-full aspect-square"
//                 alt={`Image ${image.fileId}`}
//                 urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}
//               />
//             </IKContext>
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 toggleLike(image);
//               }}
//               className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white z-10"
//             >
//               {likedImages.includes(image.url) ? "❤️" : "🤍"}
//             </button>
//           </div>
//         ))}
//       </div>

//       <div ref={sentinelRef} className="h-10 mt-6" />
//       {loading && <div className="text-center mt-4 text-gray-500">Loading more images...</div>}

//       {isOpen && selectedImage && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
//           <button
//             onClick={closeLightbox}
//             className="absolute top-4 right-6 text-white text-3xl hover:text-gray-400 z-50"
//           >
//             &times;
//           </button>
//           <button
//             onClick={() => navigateImage("prev")}
//             className="absolute left-4 text-white text-4xl hover:text-purple-400 z-50"
//           >
//             &#10094;
//           </button>
//           <div className="relative p-4 max-w-4xl w-full">
//             <IKContext urlEndpoint={selectedImage.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
//               <IKImage
//                 path={selectedImage.filePath}
//                 transformation={[{ height: 1080, width: 1080 }]}
//                 loading="eager"
//                 className="rounded-lg max-h-[90vh] mx-auto object-contain shadow-xl"
//                 alt={`Full image ${selectedImage.fileId}`}
//                 urlEndpoint={selectedImage.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}
//               />
//             </IKContext>
//           </div>
//           <button
//             onClick={() => navigateImage("next")}
//             className="absolute right-4 text-white text-4xl hover:text-purple-400 z-50"
//           >
//             &#10095;
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HomeImageGallery;



"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IKImage, IKContext } from "imagekitio-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartFill } from "react-bootstrap-icons";

interface ImageItem {
  fileId: string;
  filePath: string;
  thumbnailUrl: string;
  url: string;
  height: number;
  width: number;
  source: 'kit1' | 'kit2';
}

const HomeImageGallery = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedImages, setLikedImages] = useState<string[]>([]);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [currentSource, setCurrentSource] = useState<'kit1' | 'kit2'>('kit1');
  const router = useRouter();

  const limit = 100;

  const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || 'https://ik.imagekit.io/bi1q5easm';
  const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || 'https://ik.imagekit.io/sz2nxx1mb';

  const fetchImages = useCallback(async () => {
    if (!hasMore) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/home-images?limit=${limit}&skip=${skip}&source=${currentSource}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.length === 0) {
        if (currentSource === 'kit1') {
          setCurrentSource('kit2');
          setSkip(0);
          return;
        }
        setHasMore(false);
        return;
      }
      const formattedImages: ImageItem[] = data.map((item: any) => ({
        fileId: item.fileId,
        filePath: item.filePath,
        thumbnailUrl: `${item.url}?tr=w-300,h-300`,
        url: item.url,
        height: item.height || 800,
        width: item.width || 600,
        source: currentSource,
      }));
      setImages((prev) => [...prev, ...formattedImages]);
      setSkip((prev) => prev + limit);
    } catch (error) {
      console.error("Error fetching images:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [skip, hasMore, currentSource]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  useEffect(() => {
    const fetchLiked = async () => {
      const res = await fetch("/api/home-images/liked-images");
      if (res.ok) {
        const data = await res.json();
        setLikedImages(data.map((item: any) => item.imageUrl));
      }
    };
    fetchLiked();
  }, []);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchImages();
        }
      },
      { threshold: 0.1 }
    );
    const currentSentinel = sentinelRef.current;
    if (currentSentinel) observer.observe(currentSentinel);
    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
    };
  }, [loading, hasMore, fetchImages]);

  const openLightbox = (image: ImageItem) => {
    setSelectedImage(image);
    setIsOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction: "prev" | "next") => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.fileId === selectedImage.fileId);
    if (currentIndex === -1) return;
    let newIndex;
    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    } else {
      newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    }
    setSelectedImage(images[newIndex]);
  };

  const toggleLike = async (image: ImageItem) => {
    const isLiked = likedImages.includes(image.url);
    const endpoint = isLiked ? "/api/home-images/unlike-image" : "/api/home-images/like-image";
    const method = isLiked ? "DELETE" : "POST";
    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageUrl: image.url,
        fileId: image.fileId,
        source: image.source,
      }),
    });
    setLikedImages((prev) =>
      isLiked ? prev.filter((url) => url !== image.url) : [...prev, image.url]
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') navigateImage('prev');
      else if (e.key === 'ArrowRight') navigateImage('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedImage, images]);

  // Skeleton loader component
  const SkeletonLoader = () => (
    <div className="space-y-4">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.5, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg aspect-square w-full"
        />
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
        >
          Image Gallery
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.push("/home-images/liked")}
          className="relative p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
        >
          {likedImages.length > 0 && (
            <motion.span 
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              {likedImages.length}
            </motion.span>
          )}
          <HeartFill className="text-red-500 text-2xl" />
        </motion.button>
      </div>

      {images.length === 0 && loading ? (
        <SkeletonLoader />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {images.map((image) => (
            <motion.div
              key={`${image.source}-${image.fileId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative cursor-pointer rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              onClick={() => openLightbox(image)}
              layout
            >
              <IKContext urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
                <IKImage
                  path={image.filePath}
                  transformation={[{ height: "300", width: "300" }]}
                  loading="lazy"
                  className="object-cover w-full h-full aspect-square hover:brightness-90 transition-all"
                  alt={`Image ${image.fileId}`}
                  urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}
                />
              </IKContext>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(image);
                }}
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2 backdrop-blur-sm shadow-sm"
              >
                {likedImages.includes(image.url) ? (
                  <HeartFill className="text-red-500" />
                ) : (
                  <Heart className="text-gray-600" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-10 mt-6" />
      {loading && images.length > 0 && (
        <div className="text-center mt-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-2 text-gray-500">Loading more images...</p>
        </div>
      )}

      <AnimatePresence>
        {isOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-50 transition-all"
            >
              &times;
            </button>

            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative p-4 max-w-6xl w-full mx-4">
              <motion.div
                key={selectedImage.fileId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <IKContext urlEndpoint={selectedImage.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
                  <IKImage
                    path={selectedImage.filePath}
                    transformation={[{ height: "1080", width: "1080" }]}
                    loading="lazy"
                    className="rounded-xl max-h-[90vh] mx-auto object-contain shadow-2xl"
                    alt={`Full image ${selectedImage.fileId}`}
                    urlEndpoint={selectedImage.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}
                  />
                </IKContext>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(selectedImage);
                  }}
                  className="absolute bottom-6 right-6 bg-white/80 rounded-full p-3 backdrop-blur-sm shadow-lg"
                >
                  {likedImages.includes(selectedImage.url) ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <HeartFill className="text-red-500 text-2xl" />
                    </motion.div>
                  ) : (
                    <Heart className="text-gray-600 text-2xl" />
                  )}
                </motion.button>
              </motion.div>
            </div>

            <button
              onClick={() => navigateImage("next")}
              className="absolute right-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm opacity-80">
              {images.findIndex(img => img.fileId === selectedImage.fileId) + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeImageGallery;