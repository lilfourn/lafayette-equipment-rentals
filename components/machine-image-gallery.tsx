"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MachineImageGalleryProps {
  imageUrls: string[];
  machineName: string;
  primaryType: string;
}

export default function MachineImageGallery({
  imageUrls = [],
  machineName,
  primaryType,
}: MachineImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  // Filter out failed images and ensure we have at least one image
  const validImageUrls = (imageUrls || []).filter(
    (url) => !failedImages.has(url)
  );
  if (validImageUrls.length === 0) {
    validImageUrls.push(
      `/placeholder.svg?width=800&height=600&query=${encodeURIComponent(
        primaryType || "equipment"
      )}`
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % validImageUrls.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + validImageUrls.length) % validImageUrls.length
    );
  };

  const handleImageError = (src: string) => {
    console.error(`Failed to load image: ${src}`);
    setFailedImages((prev) => new Set(prev).add(src));
    // If current image fails, move to next available image
    if (src === validImageUrls[currentIndex] && validImageUrls.length > 1) {
      nextImage();
    }
  };

  return (
    <div className="mb-6">
      {/* Main Image Display */}
      <div className="relative w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-gray-50 border border-gray-200 group">
        <Image
          src={validImageUrls[currentIndex] || "/placeholder.svg"}
          alt={`${machineName} - Image ${currentIndex + 1}`}
          fill
          className="object-contain"
          priority={currentIndex === 0}
          onError={() => handleImageError(validImageUrls[currentIndex])}
        />

        {/* Navigation Arrows - Visible on mobile, appear on hover for desktop */}
        {validImageUrls.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 p-3 rounded-full shadow-md border border-gray-200 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-700 p-3 rounded-full shadow-md border border-gray-200 md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {validImageUrls.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-white/95 text-gray-700 px-3 py-1.5 rounded-lg text-sm border border-gray-200 shadow-sm">
            {currentIndex + 1} / {validImageUrls.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if more than 1 image */}
      {validImageUrls.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {validImageUrls.map((src, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border transition-all duration-200 ${
                index === currentIndex
                  ? "border-turquoise-500 ring-2 ring-turquoise-500/20"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={src}
                alt={`${machineName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                onError={() => handleImageError(src)}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots Navigation removed for mobile to prefer simple arrows */}
    </div>
  );
}
