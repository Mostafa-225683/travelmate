import { useState } from "react";
import { X } from "lucide-react";

interface PhotoGalleryProps {
  images: string[];
  onClose: () => void;
}

export default function PhotoGallery({ images, onClose }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-6xl px-4">
        <img
          src={images[currentIndex]}
          alt={`Photo ${currentIndex + 1}`}
          className="w-full h-[80vh] object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-8 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              className="absolute right-8 top-1/2 -translate-y-1/2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Next
            </button>
          </>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              index === currentIndex ? "border-white" : "border-transparent"
            }`}
          >
            <img
              src={image}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
