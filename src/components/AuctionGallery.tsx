import  { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';

interface AuctionGalleryProps {
  mainImage: string;
  title: string;
  additionalImages?: string[];
}

export default function AuctionGallery({ 
  mainImage, 
  title, 
  additionalImages = [] 
}: AuctionGalleryProps) {
  const [currentImage, setCurrentImage] = useState(mainImage);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Ensure we have valid images
  const validMainImage = mainImage || "https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800";
  const validAdditionalImages = additionalImages?.filter(img => img && img.trim() !== "") || [];
  
  const allImages = [validMainImage, ...validAdditionalImages.filter(img => img !== validMainImage)];
  
  const currentIndex = allImages.indexOf(currentImage);
  
  const goToPrevious = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIndex = currentIndex <= 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentImage(allImages[newIndex]);
  };
  
  const goToNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newIndex = currentIndex >= allImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentImage(allImages[newIndex]);
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  // Fallback image in case of errors
  const fallbackImage = "https://images.unsplash.com/photo-1500627964684-141351970a7f?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxsdXh1cnklMjBhdWN0aW9uJTIwaXRlbXN8ZW58MHx8fHwxNzQ0NzI0MDEzfDA&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800";
  
  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.src = fallbackImage;
  };
  
  // Key press handler for navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    else if (e.key === 'ArrowRight') goToNext();
    else if (e.key === 'Escape') setIsFullScreen(false);
  };
  
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden h-80 bg-gray-100">
        <img
          src={currentImage || fallbackImage}
          alt={title}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={toggleFullScreen}
          onError={handleImageError}
        />
        
        {allImages.length > 1 && (
          <>
            <button 
              onClick={(e) => goToPrevious(e)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button 
              onClick={(e) => goToNext(e)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
        
        <button
          onClick={toggleFullScreen}
          className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-75 transition-all"
          aria-label="View fullscreen"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>
      
      {allImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {allImages.map((image, index) => (
            <div 
              key={index}
              className={`h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                currentImage === image 
                  ? 'ring-2 ring-primary-500 ring-offset-2' 
                  : 'opacity-80 hover:opacity-100'
              }`}
              onClick={() => setCurrentImage(image)}
            >
              <img 
                src={image} 
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      )}
      
      {isFullScreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4"
          onClick={toggleFullScreen}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          <div className="relative w-full max-w-5xl">
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-black hover:bg-opacity-75 z-10 transition-all"
              aria-label="Close fullscreen view"
            >
              <X className="h-6 w-6" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 text-black hover:bg-opacity-75 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 text-black hover:bg-opacity-75 transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            <img 
              src={currentImage || fallbackImage} 
              alt={title}
              className="max-h-[80vh] max-w-full mx-auto object-contain"
              onError={handleImageError}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {allImages.length > 1 && (
            <div 
              className="flex justify-center mt-4 space-x-2 overflow-auto max-w-full p-2"
              onClick={(e) => e.stopPropagation()}
            >
              {allImages.map((image, index) => (
                <div 
                  key={index}
                  className={`h-16 w-16 rounded-md overflow-hidden cursor-pointer flex-shrink-0 ${
                    currentImage === image ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'
                  }`}
                  onClick={() => setCurrentImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`${title} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
 