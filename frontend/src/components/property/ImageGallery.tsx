'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { PropertyImage } from '@/types';

interface ImageGalleryProps {
  images: PropertyImage[];
  title: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const primaryImages = images.slice(0, 5);

  const prev = () => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <>
      {/* Grid layout */}
      <div className="relative rounded-2xl overflow-hidden cursor-pointer" onClick={() => setLightboxOpen(true)}>
        {primaryImages.length === 1 ? (
          <div className="aspect-[16/9] relative">
            <Image
              src={primaryImages[0].url}
              alt={title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-80 md:h-96">
            {/* Main image */}
            <div className="col-span-2 row-span-2 relative">
              <Image
                src={primaryImages[0]?.url || ''}
                alt={title}
                fill
                className="object-cover hover:brightness-90 transition-all"
                priority
                unoptimized
              />
            </div>
            {/* Side images */}
            {primaryImages.slice(1, 5).map((img, i) => (
              <div key={i} className="relative">
                <Image
                  src={img.url}
                  alt={`${title} ${i + 2}`}
                  fill
                  className="object-cover hover:brightness-90 transition-all"
                  unoptimized
                />
              </div>
            ))}
          </div>
        )}

        {/* Show all button */}
        {images.length > 5 && (
          <button className="absolute bottom-4 right-4 bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-2 hover:bg-gray-50 transition-colors">
            <Grid3X3 className="w-4 h-4" />
            Show all {images.length} photos
          </button>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={prev}
            className="absolute left-4 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="relative w-full max-w-4xl mx-16 aspect-video">
            <Image
              src={images[currentIndex]?.url || ''}
              alt={`${title} ${currentIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          <button
            onClick={next}
            className="absolute right-4 text-white bg-white/10 rounded-full p-3 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <span className="text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Thumbnails */}
          <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  i === currentIndex ? 'border-primary-400' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
