'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { optimizedImageUrl } from '../lib/imageOptimizer';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeImage, setActiveImage] = useState<string>(images[0] || '');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lightboxScrollRef = useRef<HTMLDivElement>(null);

  // Swipe logic refs
  const touchStartX = useRef<number | null>(null);
  const isSwiping = useRef(false);

  // Drag logic states
  const [isMainDragging, setIsMainDragging] = useState(false);
  const [mainStartX, setMainStartX] = useState(0);
  const [mainScrollLeft, setMainScrollLeft] = useState(0);
  const [mainHasDragged, setMainHasDragged] = useState(false);

  const [isLbxDragging, setIsLbxDragging] = useState(false);
  const [lbxStartX, setLbxStartX] = useState(0);
  const [lbxScrollLeft, setLbxScrollLeft] = useState(0);
  const [lbxHasDragged, setLbxHasDragged] = useState(false);

  // --- Swiping for Main Image ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    if (Math.abs(touchStartX.current - e.touches[0].clientX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const swipeThreshold = 40;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) handleNextImage();
      else handlePrevImage();
    }
    touchStartX.current = null;
    setTimeout(() => { isSwiping.current = false; }, 100);
  };

  const handlePrevImage = () => {
    const idx = images.indexOf(activeImage);
    const prevIdx = (idx - 1 + images.length) % images.length;
    setActiveImage(images[prevIdx]);
  };

  const handleNextImage = () => {
    const idx = images.indexOf(activeImage);
    const nextIdx = (idx + 1) % images.length;
    setActiveImage(images[nextIdx]);
  };

  // --- Scroll/Thumbnail Sync ---
  useEffect(() => {
    const idx = images.indexOf(activeImage);
    if (idx === -1) return;

    const mainThumb = document.getElementById(`thumb-${idx}`);
    if (mainThumb) {
      mainThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    if (isLightboxOpen) {
      const lightboxThumb = document.getElementById(`lightbox-thumb-${idx}`);
      if (lightboxThumb) {
        lightboxThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeImage, isLightboxOpen, images]);

  // Decoupled Image Loader
  useEffect(() => {
    if (!activeImage) return;
    
    // Defer resetting loaded state to avoid synchronous setState warning during render cycle
    const t = setTimeout(() => setImageLoaded(false), 0);
    
    const img = new Image();
    img.src = optimizedImageUrl(activeImage, 'main');
    const handleLoad = () => setImageLoaded(true);
    if (img.complete) handleLoad();
    else img.onload = handleLoad;
    
    return () => clearTimeout(t);
  }, [activeImage]);

  // Body Scroll Lock
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isLightboxOpen]);

  // --- Mouse Drag for Thumbnails ---
  const handleMainMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMainDragging(true);
    setMainHasDragged(false);
    setMainStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setMainScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMainMouseMove = (e: React.MouseEvent) => {
    if (!isMainDragging || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - mainStartX);
    if (Math.abs(walk) > 5) {
      setMainHasDragged(true);
      e.preventDefault();
      scrollContainerRef.current.scrollLeft = mainScrollLeft - (walk * 1.5);
    }
  };

  const handleLbxMouseDown = (e: React.MouseEvent) => {
    if (!lightboxScrollRef.current) return;
    setIsLbxDragging(true);
    setLbxHasDragged(false);
    setLbxStartX(e.pageX - lightboxScrollRef.current.offsetLeft);
    setLbxScrollLeft(lightboxScrollRef.current.scrollLeft);
  };

  const handleLbxMouseMove = (e: React.MouseEvent) => {
    if (!isLbxDragging || !lightboxScrollRef.current) return;
    const x = e.pageX - lightboxScrollRef.current.offsetLeft;
    const walk = (x - lbxStartX);
    if (Math.abs(walk) > 5) {
      setLbxHasDragged(true);
      e.preventDefault();
      lightboxScrollRef.current.scrollLeft = lbxScrollLeft - (walk * 1.5);
    }
  };

  return (
    <div className="w-full">
      {/* Main Image Container */}
      <div className="w-full max-w-[1200px] mx-auto mb-8">
        <div
          className="w-full relative group bg-transparent border border-white/5 rounded-sm overflow-hidden z-0 flex items-center justify-center min-h-[50vh] md:min-h-[70vh] cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 p-3 md:p-4 rounded-full text-white/70 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 p-3 md:p-4 rounded-full text-white/70 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <button
            onClick={() => setIsLightboxOpen(true)}
            className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 p-3 rounded-full text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
          >
            <Maximize2 size={20} />
          </button>

          <div
            className={`absolute inset-0 z-0 bg-cover bg-center blur-md transition-opacity duration-500 pointer-events-none ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ backgroundImage: `url(${optimizedImageUrl(images[0], 'tiny')})` }}
          />

          <img
            src={optimizedImageUrl(activeImage, 'main')}
            alt={productName}
            draggable={false}
            // CRITICAL: Hero image must be prioritized by the browser immediately.
            {...(activeImage === images[0] ? { fetchPriority: 'high', loading: 'eager' } : { loading: 'lazy' })}
            // Remove opacity-0 for the first image so it shows even before JS cycles.
            className={`max-w-full max-h-[85vh] h-auto w-auto object-contain select-none transition-opacity duration-500 relative z-10 ${activeImage === images[0] ? 'opacity-100' : (imageLoaded ? 'opacity-100' : 'opacity-0')}`}
            onClick={() => !isSwiping.current && setIsLightboxOpen(true)}
          />


        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="w-full max-w-[1400px] mx-auto mb-6 md:mb-12 px-4">
          <div className="relative flex items-center gap-2 md:gap-3">
            <div
              ref={scrollContainerRef}
              className={`flex-1 flex flex-row gap-2 md:gap-3 items-center justify-start overflow-x-auto no-scrollbar py-3 md:py-4 scroll-smooth px-4 ${isMainDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              onMouseDown={handleMainMouseDown}
              onMouseLeave={() => setIsMainDragging(false)}
              onMouseUp={() => setIsMainDragging(false)}
              onMouseMove={handleMainMouseMove}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  id={`thumb-${idx}`}
                  onClick={() => !mainHasDragged && setActiveImage(img)}
                  className={`relative h-14 md:h-20 aspect-[3/4] flex-shrink-0 overflow-hidden border rounded-sm transition duration-150 active:scale-95 ${activeImage === img ? 'border-[#d4af37] ring-2 ring-[#d4af37] shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100'}`}
                >
                  <img src={optimizedImageUrl(img, 'thumbnail')} alt="" className="w-full h-full object-contain pointer-events-none" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Portal */}
      {isLightboxOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black flex flex-col animate-in fade-in duration-200">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 z-[1000000] bg-black/40 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full border border-white/10"
          >
            <X size={24} />
          </button>

          <div className="flex-1 relative flex items-center justify-center overflow-hidden" 
               onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-4 z-[10000] bg-black/40 p-4 rounded-full text-white"
              ><ChevronLeft size={32} /></button>
            )}
            
            <img
              src={optimizedImageUrl(activeImage, 'full')}
              alt={productName}
              draggable={false}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {images.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-4 z-[10000] bg-black/40 p-4 rounded-full text-white"
              ><ChevronRight size={32} /></button>
            )}
          </div>

          {/* Lightbox Thumbnails */}
          <div className="bg-black/90 pb-6 pt-4">
             <div
              ref={lightboxScrollRef}
              className={`flex justify-start gap-2 overflow-x-auto no-scrollbar mx-auto py-2 px-4 max-w-4xl scroll-smooth ${isLbxDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              onMouseDown={handleLbxMouseDown}
              onMouseLeave={() => setIsLbxDragging(false)}
              onMouseUp={() => setIsLbxDragging(false)}
              onMouseMove={handleLbxMouseMove}
            >
              {images.map((img, idx) => (
                <button
                  key={idx}
                  id={`lightbox-thumb-${idx}`}
                  onClick={() => !lbxHasDragged && setActiveImage(img)}
                  className={`h-16 w-12 shrink-0 rounded border transition-all overflow-hidden ${activeImage === img ? 'border-[#d4af37] opacity-100' : 'border-white/10 opacity-40'}`}
                >
                  <img src={optimizedImageUrl(img, 'thumbnail')} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
