"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { IKImage, IKContext } from "imagekitio-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, HeartFill, ArrowUp } from "react-bootstrap-icons";
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

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
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [likedImages, setLikedImages] = useState<string[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [currentSource, setCurrentSource] = useState<'kit1' | 'kit2'>('kit1');
  const router = useRouter();
  const swiperRef = useRef<any>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const limit = 30; // Reduced batch size for better perceived performance

  const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || 'https://ik.imagekit.io/bi1q5easm';
  const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || 'https://ik.imagekit.io/sz2nxx1mb';

  // Throttle function to limit how often a function can be called
  const throttle = (func: Function, limit: number) => {
    let lastFunc: ReturnType<typeof setTimeout>;
    let lastRan: number;
    return function(this: any, ...args: any[]) {
      if (!lastRan) {
        func.apply(this, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(() => {
          if ((Date.now() - lastRan) >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  };

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
        thumbnailUrl: `${item.url}?tr=w-300,h-300,fo-auto`,
        url: item.url,
        height: item.height || 800,
        width: item.width || 600,
        source: currentSource,
      }));
      
      setImages((prev) => {
        // Filter out duplicates (just in case)
        const newImages = formattedImages.filter(
          newImg => !prev.some(existingImg => existingImg.fileId === newImg.fileId)
        );
        return [...prev, ...newImages];
      });
      
      setSkip((prev) => prev + limit);
      setInitialLoad(false);
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
      try {
        const res = await fetch("/api/home-images/liked-images");
        if (res.ok) {
          const data = await res.json();
          setLikedImages(data.map((item: any) => item.imageUrl));
        }
      } catch (error) {
        console.error("Error fetching liked images:", error);
      }
    };
    fetchLiked();
  }, []);

  useEffect(() => {
    const handleScroll = throttle(() => {
      // Show back to top button when scrolled down 300px
      setShowBackToTop(window.scrollY > 300);
      
      // Infinite scroll logic
      if (
        sentinelRef.current &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        fetchImages();
      }
    }, 200);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    swiperRef.current?.slideTo(newIndex);
  };

  const toggleLike = async (image: ImageItem) => {
    try {
      const isLiked = likedImages.includes(image.url);
      const endpoint = isLiked ? "/api/home-images/unlike-image" : "/api/home-images/like-image";
      const method = isLiked ? "DELETE" : "POST";
      
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: image.url,
          fileId: image.fileId,
          source: image.source,
        }),
      });
      
      if (response.ok) {
        setLikedImages((prev) =>
          isLiked ? prev.filter((url) => url !== image.url) : [...prev, image.url]
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Skeleton loader components
  const GridSkeletonLoader = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`skeleton-${i}`}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl aspect-square w-full"
        />
      ))}
    </div>
  );

  const LightboxSkeletonLoader = () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl animate-pulse" />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl" ref={galleryRef}>
      <div className="flex items-center justify-between mb-10">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent"
        >
          Image Gallery
        </motion.h1>
      </div>

      {initialLoad ? (
        <GridSkeletonLoader />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {images.map((image) => (
            <motion.div
              key={`${image.source}-${image.fileId}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.03 }}
              className="relative cursor-pointer rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-transform will-change-transform"
              onClick={() => openLightbox(image)}
              layout
            >
              <IKContext urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
                <IKImage
                  path={image.filePath}
                  transformation={[{ height: "300", width: "300", fo: "auto" }]}
                  loading="lazy"
                  lqip={{ active: true, quality: 20 }}
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
                className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 backdrop-blur-sm shadow-sm"
              >
                {likedImages.includes(image.url) ? (
                  <HeartFill className="text-red-500 text-lg" />
                ) : (
                  <Heart className="text-gray-600 text-lg" />
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {loading && images.length > 0 && (
        <div className="mt-6">
          <GridSkeletonLoader />
          <div className="text-center mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-2 text-gray-500">Loading more images...</p>
          </div>
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      {!hasMore && images.length > 0 && (
        <div className="text-center mt-8 py-4 text-gray-500">
          You've reached the end of the gallery
        </div>
      )}

      {/* Fixed Liked Images Button */}
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => router.push("/home-images/liked")}
        className="fixed bottom-24 right-6 md:right-24 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 flex items-center justify-center"
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

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUp className="text-gray-800 text-2xl" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-50 transition-all"
            >
              &times;
            </button>

            {/* Desktop Navigation */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("prev");
              }}
              className="absolute left-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="relative p-4 w-full h-full max-w-7xl">
              {selectedImage ? (
                <Swiper
                  modules={[Navigation, Pagination, Keyboard, Mousewheel]}
                  initialSlide={images.findIndex(img => img.fileId === selectedImage.fileId)}
                  spaceBetween={50}
                  slidesPerView={1}
                  navigation={{
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                  }}
                  pagination={{ 
                    type: 'fraction',
                    el: '.swiper-pagination',
                  }}
                  keyboard={true}
                  mousewheel={true}
                  // preloadImages={false}
                  // lazy={true}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                  }}
                  onSlideChange={(swiper) => {
                    setSelectedImage(images[swiper.activeIndex]);
                  }}
                  className="h-full w-full"
                >
                  {images.map((image) => (
                    <SwiperSlide key={`slide-${image.fileId}`} className="flex items-center justify-center">
                      <div className="relative w-full h-full flex items-center justify-center p-4">
                        <IKContext urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}>
                          <IKImage
                            path={image.filePath}
                            transformation={[{ height: "1080", width: "1080", fo: "auto" }]}
                            loading="lazy"
                            lqip={{ active: true, quality: 20 }}
                            className="rounded-xl max-h-[85vh] max-w-full object-contain"
                            alt={`Full image ${image.fileId}`}
                            urlEndpoint={image.source === 'kit1' ? KIT1_ENDPOINT : KIT2_ENDPOINT}
                          />
                        </IKContext>
                      </div>
                    </SwiperSlide>
                  ))}
                  
                  {/* Mobile Pagination */}
                  <div className="swiper-pagination !text-white !bottom-4 md:!bottom-6"></div>
                </Swiper>
              ) : (
                <LightboxSkeletonLoader />
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedImage) toggleLike(selectedImage);
                }}
                className="absolute bottom-6 right-6 bg-white/80 rounded-full p-3 backdrop-blur-sm shadow-lg z-50"
              >
                {selectedImage && likedImages.includes(selectedImage.url) ? (
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
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateImage("next");
              }}
              className="absolute right-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all hidden md:block"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {selectedImage && (
              <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm opacity-80">
                {images.findIndex(img => img.fileId === selectedImage.fileId) + 1} / {images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeImageGallery;









// "use client";

// import { useState, useEffect, useRef, useCallback, useMemo } from "react";
// import { IKImage, IKContext } from "imagekitio-react";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { Heart, HeartFill, ArrowUp } from "react-bootstrap-icons";
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Navigation, Pagination, Keyboard, Mousewheel } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';

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
//   const [initialLoad, setInitialLoad] = useState(true);
//   const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [skip, setSkip] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [likedImages, setLikedImages] = useState<string[]>([]);
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   const sentinelRef = useRef<HTMLDivElement | null>(null);
//   const [currentSource, setCurrentSource] = useState<'kit1' | 'kit2'>('kit1');
//   const router = useRouter();
//   const swiperRef = useRef<any>(null);
//   const observerRef = useRef<IntersectionObserver | null>(null);

//   const limit = 30;
//   const KIT1_ENDPOINT = process.env.NEXT_PUBLIC_URL_ENDPOINT || 'https://ik.imagekit.io/bi1q5easm';
//   const KIT2_ENDPOINT = process.env.NEXT_PUBLIC_SECOND_URL_ENDPOINT || 'https://ik.imagekit.io/sz2nxx1mb';

//   const endpoints = useMemo(() => ({
//     kit1: KIT1_ENDPOINT,
//     kit2: KIT2_ENDPOINT
//   }), [KIT1_ENDPOINT, KIT2_ENDPOINT]);

//   // FIX 1: Added ref to track fetch state
//   const isFetching = useRef(false);

//   const fetchImages = useCallback(async () => {
//     // FIX 1: Prevent concurrent requests
//     if (!hasMore || isFetching.current) return;
    
//     try {
//       isFetching.current = true;
//       setLoading(true);
      
//       const response = await fetch(`/api/home-images?limit=${limit}&skip=${skip}&source=${currentSource}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
      
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
//         thumbnailUrl: `${item.url}?tr=w-300,h-300,fo-auto`,
//         url: item.url,
//         height: item.height || 800,
//         width: item.width || 600,
//         source: currentSource,
//       }));
      
//       setImages(prev => {
//         const newImages = formattedImages.filter(
//           newImg => !prev.some(existingImg => existingImg.fileId === newImg.fileId)
//         );
//         return [...prev, ...newImages];
//       });
      
//       setSkip(prev => prev + limit);
//       setInitialLoad(false);
//     } catch (error) {
//       console.error("Error fetching images:", error);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//       isFetching.current = false; // FIX 1: Reset fetch lock
//     }
//   }, [skip, hasMore, currentSource]); // FIX 1: Removed loading dependency

//   useEffect(() => {
//     fetchImages();
//   }, [fetchImages]);

//   useEffect(() => {
//     const fetchLiked = async () => {
//       try {
//         const res = await fetch("/api/home-images/liked-images");
//         if (res.ok) {
//           const data = await res.json();
//           setLikedImages(data.map((item: any) => item.imageUrl));
//         }
//       } catch (error) {
//         console.error("Error fetching liked images:", error);
//       }
//     };
//     fetchLiked();
//   }, []);

//   useEffect(() => {
//     if (!sentinelRef.current || !hasMore) return;

//     observerRef.current = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting && !loading) {
//           fetchImages();
//         }
//       },
//       { rootMargin: "500px" }
//     );

//     observerRef.current.observe(sentinelRef.current);

//     return () => {
//       if (observerRef.current) {
//         observerRef.current.disconnect();
//       }
//     };
//   }, [loading, hasMore, fetchImages]);

//   useEffect(() => {
//     const handleScroll = () => {
//       setShowBackToTop(window.scrollY > 300);
//     };

//     window.addEventListener("scroll", handleScroll, { passive: true });
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const openLightbox = (image: ImageItem) => {
//     setSelectedImage(image);
//     setIsOpen(true);
//     document.body.style.overflow = 'hidden';
//   };

//   const closeLightbox = () => {
//     setIsOpen(false);
//     setSelectedImage(null);
//     document.body.style.overflow = 'auto';
//   };

//   const navigateImage = useCallback((direction: "prev" | "next") => {
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
//     swiperRef.current?.slideTo(newIndex);
//   }, [images, selectedImage]);

//   const toggleLike = useCallback(async (image: ImageItem) => {
//     try {
//       const isLiked = likedImages.includes(image.url);
      
//       setLikedImages(prev => 
//         isLiked 
//           ? prev.filter(url => url !== image.url) 
//           : [...prev, image.url]
//       );
      
//       const endpoint = isLiked 
//         ? "/api/home-images/unlike-image" 
//         : "/api/home-images/like-image";
      
//       const response = await fetch(endpoint, {
//         method: isLiked ? "DELETE" : "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           imageUrl: image.url,
//           fileId: image.fileId,
//           source: image.source,
//         }),
//       });
      
//       if (!response.ok) {
//         setLikedImages(prev => 
//           isLiked 
//             ? [...prev, image.url] 
//             : prev.filter(url => url !== image.url)
//         );
//         throw new Error("Failed to update like");
//       }
//     } catch (error) {
//       console.error("Error toggling like:", error);
//     }
//   }, [likedImages]);

//   useEffect(() => {
//     if (!isOpen) return;
    
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeLightbox();
//       else if (e.key === 'ArrowLeft') navigateImage('prev');
//       else if (e.key === 'ArrowRight') navigateImage('next');
//     };
    
//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [isOpen, navigateImage]);

//   const scrollToTop = () => {
//     window.scrollTo({
//       top: 0,
//       behavior: 'smooth'
//     });
//   };

//   const GridSkeletonLoader = useCallback(() => (
//     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
//       {[...Array(6)].map((_, i) => (
//         <motion.div
//           key={`skeleton-${i}`}
//           initial={{ opacity: 0.5 }}
//           animate={{ opacity: 1 }}
//           transition={{ 
//             duration: 0.8,
//             repeat: Infinity,
//             repeatType: "reverse",
//             ease: "easeInOut"
//           }}
//           className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl aspect-square w-full"
//         />
//       ))}
//     </div>
//   ), []);

//   const LightboxSkeletonLoader = useCallback(() => (
//     <div className="w-full h-full flex items-center justify-center">
//       <div className="w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl animate-pulse" />
//     </div>
//   ), []);

//   const ImageCard = useCallback(({ image }: { image: ImageItem }) => {
//     const isLiked = likedImages.includes(image.url);
//     const urlEndpoint = endpoints[image.source];
    
//     return (
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//         whileHover={{ scale: 1.03 }}
//         className="relative cursor-pointer rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-transform will-change-transform"
//         onClick={() => openLightbox(image)}
//         layout
//       >
//         <IKContext urlEndpoint={urlEndpoint}>
//           <IKImage
//             path={image.filePath}
//             transformation={[{ height: "300", width: "300", fo: "auto" }]}
//             loading="lazy"
//             lqip={{ active: true, quality: 20 }}
//             className="object-cover w-full h-full aspect-square hover:brightness-90 transition-all"
//             alt={`Image ${image.fileId}`}
//           />
//         </IKContext>
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleLike(image);
//           }}
//           className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 backdrop-blur-sm shadow-sm"
//         >
//           {isLiked ? (
//             <HeartFill className="text-red-500 text-lg" />
//           ) : (
//             <Heart className="text-gray-600 text-lg" />
//           )}
//         </motion.button>
//       </motion.div>
//     );
//   }, [endpoints, likedImages, toggleLike]);

//   // Debugging: Log current state
//   useEffect(() => {
//     console.log('Current state:', {
//       images: images.length,
//       loading,
//       initialLoad,
//       hasMore,
//       currentSource,
//       skip
//     });
//   }, [images, loading, initialLoad, hasMore, currentSource, skip]);

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-7xl">
//       <div className="flex items-center justify-between mb-10">
//         <motion.h1 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
//         >
//           Image Gallery
//         </motion.h1>
//         <motion.button
//           whileHover={{ scale: 1.1 }}
//           whileTap={{ scale: 0.9 }}
//           onClick={() => router.push("/home-images/liked")}
//           className="relative p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all"
//         >
//           {likedImages.length > 0 && (
//             <motion.span 
//               className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
//               initial={{ scale: 0 }}
//               animate={{ scale: 1 }}
//             >
//               {likedImages.length}
//             </motion.span>
//           )}
//           <HeartFill className="text-red-500 text-2xl" />
//         </motion.button>
//       </div>

//       {initialLoad ? (
//         <GridSkeletonLoader />
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
//           {images.map((image) => (
//             // FIX 2: Added key with unique combination
//             <ImageCard key={`${image.source}-${image.fileId}`} image={image} />
//           ))}
//         </div>
//       )}

//       {loading && images.length > 0 && (
//         <div className="mt-6">
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
//             {[...Array(3)].map((_, i) => (
//               <div 
//                 key={`loader-${i}`} 
//                 className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl aspect-square w-full animate-pulse"
//               />
//             ))}
//           </div>
//           <div className="text-center mt-4">
//             <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
//             <p className="mt-2 text-gray-500">Loading more images...</p>
//           </div>
//         </div>
//       )}

//       <div ref={sentinelRef} className="h-2" />

//       {!hasMore && images.length > 0 && (
//         <div className="text-center mt-8 py-4 text-gray-500">
//           You've reached the end of the gallery
//         </div>
//       )}

//       <AnimatePresence>
//         {showBackToTop && (
//           <motion.button
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }}
//             onClick={scrollToTop}
//             className="fixed bottom-6 right-6 bg-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all z-40 flex items-center justify-center"
//             whileHover={{ scale: 1.1 }}
//             whileTap={{ scale: 0.9 }}
//           >
//             <ArrowUp className="text-gray-800 text-xl" />
//           </motion.button>
//         )}
//       </AnimatePresence>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
//             onClick={closeLightbox}
//           >
//             <button
//               onClick={closeLightbox}
//               className="absolute top-6 right-6 text-white text-4xl hover:text-gray-300 z-50 transition-all"
//             >
//               &times;
//             </button>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 navigateImage("prev");
//               }}
//               className="absolute left-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all hidden md:block"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//               </svg>
//             </button>

//             <div className="relative p-4 w-full h-full max-w-7xl">
//               {selectedImage ? (
//                 <Swiper
//                   modules={[Navigation, Pagination, Keyboard, Mousewheel]}
//                   initialSlide={images.findIndex(img => img.fileId === selectedImage.fileId)}
//                   spaceBetween={50}
//                   slidesPerView={1}
//                   navigation
//                   pagination={{ 
//                     type: 'fraction',
//                     el: '.swiper-pagination',
//                   }}
//                   keyboard={true}
//                   mousewheel={true}
//                   // FIX 3: Removed invalid preloadImages prop
//                   lazy={{ loadPrevNext: true }}
//                   onSwiper={(swiper) => {
//                     swiperRef.current = swiper;
//                   }}
//                   onSlideChange={(swiper) => {
//                     setSelectedImage(images[swiper.activeIndex]);
//                   }}
//                   className="h-full w-full"
//                 >
//                   {images.map((image) => (
//                     <SwiperSlide 
//                       key={`slide-${image.source}-${image.fileId}`} // FIX 2: Unique key
//                       className="flex items-center justify-center"
//                     >
//                       <div className="relative w-full h-full flex items-center justify-center p-4">
//                         <IKContext urlEndpoint={endpoints[image.source]}>
//                           {/* FIX 4: Added missing width/height attributes */}
//                           <IKImage
//                             path={image.filePath}
//                             transformation={[{ 
//                               height: "1080", 
//                               width: "1080", 
//                               fo: "auto" 
//                             }]}
//                             height={1080}
//                             width={1080}
//                             loading="lazy"
//                             className="rounded-xl max-h-[85vh] max-w-full object-contain"
//                             alt={`Full image ${image.fileId}`}
//                           />
//                         </IKContext>
//                       </div>
//                     </SwiperSlide>
//                   ))}
                  
//                   <div className="swiper-pagination !text-white !bottom-4 md:!bottom-6"></div>
//                 </Swiper>
//               ) : (
//                 <LightboxSkeletonLoader />
//               )}
              
//               <motion.button
//                 whileHover={{ scale: 1.1 }}
//                 whileTap={{ scale: 0.9 }}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (selectedImage) toggleLike(selectedImage);
//                 }}
//                 className="absolute bottom-6 right-6 bg-white/80 rounded-full p-3 backdrop-blur-sm shadow-lg z-50"
//               >
//                 {selectedImage && likedImages.includes(selectedImage.url) ? (
//                   <motion.div
//                     initial={{ scale: 0 }}
//                     animate={{ scale: 1 }}
//                     transition={{ type: "spring", stiffness: 500 }}
//                   >
//                     <HeartFill className="text-red-500 text-2xl" />
//                   </motion.div>
//                 ) : (
//                   <Heart className="text-gray-600 text-2xl" />
//                 )}
//               </motion.button>
//             </div>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 navigateImage("next");
//               }}
//               className="absolute right-6 text-white p-3 rounded-full bg-black/50 hover:bg-black/80 z-50 transition-all hidden md:block"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//               </svg>
//             </button>

//             {selectedImage && (
//               <div className="absolute bottom-6 left-0 right-0 text-center text-white text-sm opacity-80">
//                 {images.findIndex(img => img.fileId === selectedImage.fileId) + 1} / {images.length}
//               </div>
//             )}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default HomeImageGallery;