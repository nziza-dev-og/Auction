import  { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuctionDetailGalleryProps {
  mainImage: string;
  title: string;
  additionalImages?: string[];
}

export default function AuctionDetailGallery({ 
  mainImage, 
  title, 
  additionalImages = [] 
}: AuctionDetailGalleryProps) {
  const [currentImage, setCurrentImage] = useState(mainImage);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const allImages = [mainImage, ...additionalImages];
  
  const currentIndex = allImages.indexOf(currentImage);
  
  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? allImages.length - 1 : currentIndex - 1;
    setCurrentImage(allImages[newIndex]);
  };
  
  const goToNext = () => {
    const newIndex = currentIndex === allImages.length - 1 ? 0 : currentIndex + 1;
    setCurrentImage(allImages[newIndex]);
  };
  
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };
  
  if (allImages.length <= 1) {
    return (
      <div className="relative h-80 w-full overflow-hidden rounded-lg">
        <img 
          src={mainImage} 
          alt={title} 
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={toggleFullScreen}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative rounded-lg overflow-hidden h-80">
        <img
          src={currentImage}
          alt={title}
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
          onClick={toggleFullScreen}
        />
        
        <button 
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <button 
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-75"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <div 
              key={index}
              className={`h-20 rounded-md overflow-hidden cursor-pointer ${
                currentImage === image ? 'ring-2 ring-primary-500' : 'opacity-80 hover:opacity-100'
              }`}
              onClick={() => setCurrentImage(image)}
            >
              <img 
                src={image} 
                alt={`${title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
      
      {isFullScreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-5xl">
            <button 
              onClick={toggleFullScreen}
              className="absolute top-4 right-4 bg-white rounded-full p-1 text-black hover:bg-opacity-75 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <button 
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 text-black hover:bg-opacity-75"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            
            <button 
              onClick={goToNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 text-black hover:bg-opacity-75"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            
            <img 
              src={currentImage} 
              alt={title}
              className="max-h-[80vh] max-w-full mx-auto object-contain"
            />
          </div>
          
          <div className="flex justify-center mt-4 space-x-2 overflow-auto max-w-full p-2">
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
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 