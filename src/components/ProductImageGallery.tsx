
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  mainImage: string;
  additionalImages?: string[];
  productName: string;
}

const ProductImageGallery = ({ mainImage, additionalImages = [], productName }: ProductImageGalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageScale, setImageScale] = useState(1);

  const allImages = [mainImage, ...additionalImages].filter(Boolean);

  const handleImageClick = () => {
    setIsModalOpen(true);
    setImageScale(1);
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleZoomClick = () => {
    setImageScale(prev => prev >= 3 ? 1 : prev + 0.5);
  };

  const handleWheel = (event: React.WheelEvent) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    setImageScale(prev => Math.max(1, Math.min(3, prev + delta)));
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <img
          src={allImages[selectedImageIndex]}
          alt={productName}
          className="w-full h-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
          style={{ maxHeight: '500px' }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center rounded-lg">
          <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
        </div>
        <div className="absolute top-2 right-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick();
            }}
            className="bg-white/90 hover:bg-white border-0 shadow-md"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Navigation arrows for main image */}
        {allImages.length > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white border-0 shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`${productName} ${index + 1}`}
              className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 transition-all ${
                selectedImageIndex === index 
                  ? 'border-rose-500 opacity-100' 
                  : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>
      )}

      {/* Image Zoom Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setImageScale(1);
      }}>
        <DialogContent className="max-w-5xl w-full h-[90vh] p-2 bg-white border-none">
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-white rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 z-10 text-gray-600 hover:bg-gray-100 bg-white/80"
            >
              <X className="h-6 w-6" />
            </Button>
            
            <div className="text-xs text-gray-600 absolute top-2 left-2 z-10 bg-white/90 p-2 rounded shadow-sm">
              Click to zoom • Scroll to zoom in/out • Scale: {Math.round(imageScale * 100)}%
            </div>
            
            {/* Modal Navigation */}
            {allImages.length > 1 && (
              <>
                <Button
                  variant="outline"
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 hover:bg-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 px-3 py-1 rounded text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              </>
            )}
            
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
              <img
                src={allImages[selectedImageIndex]}
                alt={productName}
                className="max-w-none cursor-pointer transition-transform duration-200 select-none"
                style={{ 
                  transform: `scale(${imageScale})`,
                  transformOrigin: 'center',
                  maxHeight: imageScale === 1 ? '100%' : 'none',
                  maxWidth: imageScale === 1 ? '100%' : 'none'
                }}
                onClick={handleZoomClick}
                onWheel={handleWheel}
                draggable={false}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;
