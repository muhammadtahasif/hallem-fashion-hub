
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

const ProductImageGallery = ({ images, productName }: ProductImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Filter out duplicate images and ensure we have at least one image
  const uniqueImages = images.filter((image, index, self) => 
    image && self.indexOf(image) === index
  );
  
  // If no images or only one image, don't show thumbnails
  const showThumbnails = uniqueImages.length > 1;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % uniqueImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + uniqueImages.length) % uniqueImages.length);
  };

  if (!uniqueImages.length) {
    return (
      <Card className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <Card className="relative overflow-hidden group">
        <div 
          className="aspect-square cursor-pointer"
          onClick={() => setIsZoomOpen(true)}
        >
          <img
            src={uniqueImages[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Navigation Arrows for multiple images */}
          {showThumbnails && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Thumbnails - Only show if there are multiple unique images */}
      {showThumbnails && (
        <div className="grid grid-cols-4 gap-2">
          {uniqueImages.map((image, index) => (
            <Card
              key={index}
              className={`aspect-square cursor-pointer overflow-hidden transition-all duration-200 ${
                index === selectedImage 
                  ? "ring-2 ring-rose-500 ring-offset-2" 
                  : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-1"
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </Card>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-4xl w-full h-full max-h-[90vh] p-0">
          <div className="relative h-full">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white"
              onClick={() => setIsZoomOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="h-full flex items-center justify-center bg-black">
              <img
                src={uniqueImages[selectedImage]}
                alt={`${productName} - Zoomed view`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            {/* Navigation in zoom modal for multiple images */}
            {showThumbnails && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;
