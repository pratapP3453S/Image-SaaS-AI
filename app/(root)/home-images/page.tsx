import { useState, useEffect } from 'react';
import { IKImage, IKContext } from 'imagekitio-react';
import type { IKImageProps } from 'imagekitio-react';

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

useEffect(() => {
  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();

      const formattedImages: ImageItem[] = data.map((item: any) => ({
        fileId: item.fileId,
        filePath: item.filePath,
        thumbnailUrl: `${item.url}?tr=w-300,h-300`,
        url: item.url,
        height: item.height || 800,
        width: item.width || 600,
      }));

      setImages(formattedImages);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
    }
  };

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

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;

    const currentIndex = images.findIndex(img => img.fileId === selectedImage.fileId);
    let newIndex;

    if (direction === 'prev') {
      newIndex = currentIndex - 1 < 0 ? images.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex + 1 >= images.length ? 0 : currentIndex + 1;
    }

    setSelectedImage(images[newIndex]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Photo Gallery</h1>
      
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square"></div>
            </div>
          ))}
        </div>
      ) : (
        <IKContext urlEndpoint="https://ik.imagekit.io/your_imagekit_id">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div 
                key={image.fileId} 
                className="cursor-pointer transition-transform duration-300 hover:scale-105"
                onClick={() => openLightbox(image)}
              >
                <IKImage
                  path={image.filePath}
                  transformation={[{
                    height: 300,
                    width: 300,
                  }]}
                  loading="lazy"
                  className="rounded-lg object-cover w-full h-full aspect-square"
                  alt={`Gallery image ${image.fileId}`}
                />
              </div>
            ))}
          </div>
        </IKContext>
      )}

      {/* Lightbox */}
      {isOpen && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <button 
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            &times;
          </button>
          
          <button 
            onClick={() => navigateImage('prev')}
            className="absolute left-4 text-white text-2xl hover:text-gray-300 md:left-8 lg:left-16"
          >
            &#10094;
          </button>
          
          <div className="relative max-w-full max-h-full">
            <IKContext urlEndpoint="https://ik.imagekit.io/your_imagekit_id">
              <IKImage
                path={selectedImage.filePath}
                transformation={[{
                  height: 1080,
                  width: 1080,
                }]}
                loading="lazy"
                className="max-h-[90vh] max-w-full object-contain"
                alt={`Selected image ${selectedImage.fileId}`}
              />
            </IKContext>
          </div>
          
          <button 
            onClick={() => navigateImage('next')}
            className="absolute right-4 text-white text-2xl hover:text-gray-300 md:right-8 lg:right-16"
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeImageGallery;