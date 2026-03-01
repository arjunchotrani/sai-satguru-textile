import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { Phone, CheckCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { useCurrency } from '../components/CurrencyContext';
import { SEO } from '../components/SEO';
import { Helmet } from 'react-helmet-async';
import { useProductDetail, useCategories, useSubCategories } from '../hooks/useProducts';
import { CONTACT_INFO } from '../constants';
import { optimizedImageUrl } from '../utils/imageOptimizer';
import type { Product, Category, SubCategory } from '../types';

const GLOBAL_NOTES = [
  "GST and shipping charges are extra on the listed prices.",
  "Slight color variation may occur due to lighting and flash during the photoshoot.",
  "Suitable for wholesale supply, boutique sourcing, and party wear saree collections."
];

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { formatPrice } = useCurrency();

  // React Query Hooks (High Performance)
  const { data: product, isLoading: productLoading, error: productError } = useProductDetail(id);
  const { data: allCategories } = useCategories();
  const { data: subCategories } = useSubCategories(product?.categoryId);

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'shipping'>('overview');
  const [imageLoaded, setImageLoaded] = useState(false);

  // Swipe logic
  const touchStartX = useRef<number | null>(null);
  const isSwiping = useRef(false);

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
    const swipeThreshold = 40; // Pixels required to trigger swipe

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        handleNextImage(); // Swipe left -> Next Image
      } else {
        handlePrevImage(); // Swipe right -> Prior Image
      }
    }
    touchStartX.current = null;

    // Reset swiping state shortly after to allow onClick to check it
    setTimeout(() => { isSwiping.current = false; }, 100);
  };

  // Image key for CSS fade-in animation on switch
  const imageKey = activeImage || 'none';

  // Initialize activeImage
  useEffect(() => {
    if (product?.images && product.images.length > 0 && !activeImage) {
      setActiveImage(product.images[0]);
    }
  }, [product, activeImage]);

  // Decoupled Image Loader: Preload the image in JS and update state when ready
  useEffect(() => {
    if (!activeImage) return;

    let isMounted = true;
    setImageLoaded(false);

    const imgSrc = optimizedImageUrl(activeImage, 'main');
    const img = new Image();
    img.src = imgSrc;

    const handleLoad = () => {
      if (isMounted) setImageLoaded(true);
    };

    if (img.complete) {
      handleLoad();
    } else {
      img.onload = handleLoad;
      img.onerror = handleLoad;
    }

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [activeImage]);

  // 🚀 Intelligent Neighbor Preloading
  // Only prefetch neighboring high-res images AFTER the active image finishes loading
  useEffect(() => {
    if (product?.images && activeImage && imageLoaded) {
      // 1. Immediately preload ALL thumbnails (very light)
      product.images.forEach(url => {
        const thumb = new Image();
        thumb.src = optimizedImageUrl(url, 'thumbnail');
      });

      // 2. Preload the NEXT and PREVIOUS high-res images relative to activeImage
      const idx = product.images.indexOf(activeImage);
      const nextIdx = (idx + 1) % product.images.length;
      const prevIdx = (idx - 1 + product.images.length) % product.images.length;

      const neighbors = new Set([nextIdx, prevIdx]);
      neighbors.forEach(i => {
        if (i !== idx) {
          const imgMain = new Image();
          imgMain.src = optimizedImageUrl(product.images[i], 'main');

          const imgFull = new Image();
          imgFull.src = optimizedImageUrl(product.images[i], 'full');
        }
      });
    }
  }, [product?.images, activeImage, imageLoaded]);

  // Sync thumbnail scroll when product/activeImage changes
  useEffect(() => {
    if (product?.images && activeImage) {
      const idx = product.images.indexOf(activeImage);
      if (idx !== -1) {
        // Sync Main Thumbnail Carousel
        const mainThumb = document.getElementById(`thumb-${idx}`);
        if (mainThumb) {
          mainThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }

        // Sync Lightbox Thumbnail Carousel
        if (isLightboxOpen) {
          const lightboxThumb = document.getElementById(`lightbox-thumb-${idx}`);
          if (lightboxThumb) {
            lightboxThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
          }
        }
      }
    }
  }, [product, activeImage, isLightboxOpen]);

  // --- LIGHTBOX DRAG LOGIC ---
  const lightboxScrollRef = useRef<HTMLDivElement>(null);
  const [isLbxDragging, setIsLbxDragging] = useState(false);
  const [lbxStartX, setLbxStartX] = useState(0);
  const [lbxScrollLeft, setLbxScrollLeft] = useState(0);
  const [lbxHasDragged, setLbxHasDragged] = useState(false);

  const handleLbxMouseDown = (e: React.MouseEvent) => {
    if (!lightboxScrollRef.current) return;
    setIsLbxDragging(true);
    setLbxHasDragged(false);
    setLbxStartX(e.pageX - lightboxScrollRef.current.offsetLeft);
    setLbxScrollLeft(lightboxScrollRef.current.scrollLeft);
  };

  const handleLbxMouseLeaveOrUp = () => {
    setIsLbxDragging(false);
  };

  const handleLbxMouseMove = (e: React.MouseEvent) => {
    if (!isLbxDragging || !lightboxScrollRef.current) return;
    const x = e.pageX - lightboxScrollRef.current.offsetLeft;
    const walk = (x - lbxStartX);

    // Threshold check: prevent normal clicks from triggering a drag
    if (Math.abs(walk) > 5) {
      setLbxHasDragged(true);
      e.preventDefault();
      lightboxScrollRef.current.scrollLeft = lbxScrollLeft - (walk * 1.5);
    }
  };

  const handleLbxThumbClick = (img: string, e: React.MouseEvent) => {
    if (lbxHasDragged) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    setActiveImage(img);
  };
  // ---------------------------

  // --- MAIN CAROUSEL DRAG LOGIC ---
  const [isMainDragging, setIsMainDragging] = useState(false);
  const [mainStartX, setMainStartX] = useState(0);
  const [mainScrollLeft, setMainScrollLeft] = useState(0);
  const [mainHasDragged, setMainHasDragged] = useState(false);

  const handleMainMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsMainDragging(true);
    setMainHasDragged(false);
    setMainStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setMainScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMainMouseLeaveOrUp = () => {
    setIsMainDragging(false);
  };

  const handleMainMouseMove = (e: React.MouseEvent) => {
    if (!isMainDragging || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - mainStartX);

    // Threshold check: prevent normal clicks from triggering a drag
    if (Math.abs(walk) > 5) {
      setMainHasDragged(true);
      e.preventDefault();
      scrollContainerRef.current.scrollLeft = mainScrollLeft - (walk * 1.5);
    }
  };

  const handleMainThumbClick = (img: string, e: React.MouseEvent) => {
    if (mainHasDragged) {
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    setActiveImage(img);
  };
  // ---------------------------

  // Derive Category/SubCategory from cache
  const category = useMemo(() => {
    if (!product || !allCategories) return null;
    return allCategories.find((c: Category) => String(c.id) === String(product.categoryId)) || null;
  }, [product, allCategories]);

  const subCategory = useMemo(() => {
    if (!product || !subCategories) return null;
    return subCategories.find((s: SubCategory) => String(s.id) === String(product.subCategoryId)) || null;
  }, [product, subCategories]);

  const loading = productLoading;
  const error = productError ? (productError as Error).message : null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const newScrollLeft = direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handlePrevImage = () => {
    if (!product || !activeImage) return;
    const idx = product.images.indexOf(activeImage);
    const prevIdx = (idx - 1 + product.images.length) % product.images.length;
    setActiveImage(product.images[prevIdx]);
    const thumb = document.getElementById(`thumb-${prevIdx}`);
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleNextImage = () => {
    if (!product || !activeImage) return;
    const idx = product.images.indexOf(activeImage);
    const nextIdx = (idx + 1) % product.images.length;
    setActiveImage(product.images[nextIdx]);
    const thumb = document.getElementById(`thumb-${nextIdx}`);
    if (thumb) {
      thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  // Body Scroll Lock for Lightbox
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Prevent pull-to-refresh
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }, [isLightboxOpen]);



  // 1. Fetch Product Data & Metadata in Parallel (REMOVED - HANDLED BY REACT QUERY)

  // 🔹 Helper: Parse Description into structured data for premium display
  const parsedDetails = useMemo(() => {
    if (!product?.description) return null;

    // 1. Normalized Lines
    const lines = product.description.split('\n')
      .map(l => l.replace(/[\*_~]/g, '').trim()) // Strip markdown symbols
      .filter(Boolean);

    const details = {
      title: lines[0] || '', // Title is always first line
      brand: '',
      catalog: '',
      type: '',
      keywords: '',
      gst: '',
      shipping: '',
      notes: [] as string[],
      overviewItems: [] as { type: 'badge' | 'header' | 'text'; content: string }[]
    };

    let inNotes = false;

    // We no longer skip the first line so that "Product Name: ..." is rendered
    lines.forEach(line => {
      const upper = line.toUpperCase();

      // Section Headers (Keep for context gating)
      if (upper === 'NOTES:' || upper === 'NOTES' || upper.startsWith('NOTES ')) {
        inNotes = true;
        return;
      }

      // Check for structured key-value pairs
      const divider = line.includes(':') ? ':' : (line.includes(' – ') ? ' – ' : (line.includes(' - ') ? ' - ' : ''));
      const parts = divider ? line.split(divider) : [line];
      const key = parts[0].trim();
      const val = parts.slice(1).join(divider).trim(); // re-join in case value has colon
      const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');

      // 1. Metadata Detection & Extraction (Strict check to prevent swallowing valid text)
      // Only treat as metadata if it has a divider OR the line is extremely short (just a tag)
      const hasDivider = !!divider && key.length < 25;

      if (hasDivider || parts.length === 1) {
        if (keyUpper === 'BRAND') {
          details.brand = val || '';
          return;
        }
        if (keyUpper === 'CATALOG' || keyUpper === 'CATALOGUE') {
          details.catalog = val || '';
          return;
        }
        if (keyUpper === 'KEYWORDS') {
          details.keywords = val || '';
          return;
        }
        if (keyUpper === 'GST') {
          details.gst = val || line.replace(/GST/i, '').trim();
          return;
        }
        if (keyUpper === 'SHIPPING') {
          details.shipping = val || line.replace(/SHIPPING/i, '').trim();
          return;
        }
        if (keyUpper === 'TYPE') {
          details.type = val || '';
          return;
        }
      }

      // 5. Notes
      const isShortLine = line.length < 100;
      if (inNotes || ((keyUpper === 'NOTE' || keyUpper === 'IMPORTANT') && isShortLine)) {
        details.notes.push(line.replace(/^- /, ''));
        return;
      }

      // 6. Structured Overview
      // Detect Badges (Code, Price)
      if (upper.includes('CODE-') || upper.includes('PRICE-') || upper.startsWith('CODE:') || upper.startsWith('PRICE:')) {
        details.overviewItems.push({ type: 'badge', content: line });
      }
      // Detect Headers (Short lines without dividers, distinct from regular text)
      else if (isShortLine && !hasDivider && (upper === 'DETAILS' || upper === 'PRODUCT DESCRIPTION' || upper === 'KEY DETAILS' || upper === 'DESCRIPTION' || (parts.length === 1 && line.length < 25 && line.toUpperCase() === line))) {
        details.overviewItems.push({ type: 'header', content: line });
      }
      // Regular Text
      else {
        details.overviewItems.push({ type: 'text', content: line });
      }
    });

    // Add Global Notes if not already present
    GLOBAL_NOTES.forEach(gNote => {
      const exists = details.notes.some(n => n.toLowerCase().includes(gNote.toLowerCase().substring(0, 15)));
      if (!exists) details.notes.push(gNote);
    });

    return details;
  }, [product?.description]);

  // Updated WhatsApp Message Logic
  const currentUrl = window.location.href;
  const whatsappLink = React.useMemo(() => {
    if (!product) return '';
    const whatsappMessage = `Hello Sai Satguru Textiles,

I am interested in the following product:

Product Name: ${product.name}
Brand: ${product.brandName || 'N/A'}
Product Link: ${currentUrl}

Please share price, MOQ and availability.`;

    return `https://wa.me/${CONTACT_INFO.whatsapp1}?text=${encodeURIComponent(whatsappMessage)}`;
  }, [product, currentUrl]);

  // ⚡ SMART LOADING: Show a skeleton screen instead of a blocking full-screen spinner
  // If we have 'product' (from cache/initialData), let the UI render and fetch in background
  if (loading && !product) {
    return (
      <div className="bg-black w-full pt-[80px] pb-4 min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 animate-pulse">
          {/* Breadcrumb Skeleton */}
          <div className="h-4 w-48 bg-white/10 rounded-sm mb-8 mt-2"></div>

          {/* Main Image Skeleton */}
          <div className="w-full max-w-[1200px] mx-auto mb-8">
            <div className="w-full bg-white/5 rounded-sm min-h-[50vh] md:min-h-[70vh] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/10 border-t-brand-gold rounded-full animate-spin"></div>
            </div>
          </div>

          {/* Thumbnails Skeleton */}
          <div className="w-full max-w-[1400px] mx-auto mb-6 md:mb-12 px-4 flex gap-2 justify-center overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 md:h-20 aspect-[3/4] bg-white/5 rounded-sm shrink-0"></div>
            ))}
          </div>

          {/* Product Header Skeleton */}
          <div className="w-full max-w-[900px] mx-auto flex flex-col items-center gap-4 mb-12">
            <div className="h-3 w-32 bg-white/10 rounded-sm"></div>
            <div className="h-10 md:h-12 w-3/4 max-w-md bg-white/10 rounded-sm"></div>
            <div className="h-8 md:h-10 w-32 bg-white/10 rounded-sm mt-2"></div>
            <div className="h-14 w-full max-w-sm bg-white/5 rounded-sm mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-black w-full pt-[120px] pb-4 min-h-screen flex items-start justify-center">
        <div className="text-center p-8 bg-neutral-900 border border-white/10 rounded-lg max-w-md mx-4">
          <h2 className="text-2xl font-serif text-white mb-4">
            {error || "Product Not Found"}
          </h2>
          <p className="text-white/50 mb-6 text-sm">The product you are looking for is unavailable or does not exist.</p>
          <Link to="/" className="inline-block bg-brand-gold text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black w-full pt-[80px] pb-4">
      <SEO
        title={product.name}
        description={product.description}
        image={activeImage || product.images[0]}
        url={currentUrl}
        type="product"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": product.images,
            "description": product.description,
            "brand": {
              "@type": "Brand",
              "name": "Sai Satguru Textile"
            },
            "offers": {
              "@type": "Offer",
              "url": currentUrl,
              "priceCurrency": "INR", // Base price is always INR
              "price": product.basePriceINR,
              "availability": "https://schema.org/InStock"
            }
          })}
        </script>
      </Helmet>
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-white/50 uppercase tracking-wider mb-8 overflow-x-auto whitespace-nowrap pb-2 no-scrollbar scroll-smooth w-full">
          <Link to="/" className="hover:text-brand-gold shrink-0">Home</Link>

          {category && (category.label || category.name) && (
            <>
              <span className="shrink-0 text-white/20">/</span>
              <Link to={`/category/${category.slug}`} className="hover:text-brand-gold shrink-0">{category.label || category.name}</Link>
            </>
          )}

          {subCategory && (subCategory.label || subCategory.name) && category && (
            <>
              <span className="shrink-0 text-white/20">/</span>
              <Link to={`/category/${category.slug}/${subCategory.slug}`} className="hover:text-brand-gold shrink-0">{subCategory.label || subCategory.name}</Link>
            </>
          )}

          <span className="shrink-0 text-white/20">/</span>
          <span className="text-white font-bold shrink-0 pr-4">{product.name}</span>
        </div>

        {/* SECTION 1: IMAGE GALLERY (FULL WIDTH / MAX 1200px) */}
        <div className="w-full max-w-[1200px] mx-auto mb-8">
          <div className="flex flex-col gap-6">

            {/* Main Image Container - Centered & Tight */}
            <div
              className="w-full relative group bg-transparent border border-white/5 rounded-sm overflow-hidden z-0 flex items-center justify-center min-h-[50vh] md:min-h-[70vh] cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >

              {/* Navigation Arrows (Desktop overlay) */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 p-3 md:p-4 rounded-full text-white/70 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
                    title="Previous Image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/80 p-3 md:p-4 rounded-full text-white/70 hover:text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
                    title="Next Image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Maximize Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                className="absolute top-4 right-4 z-20 bg-black/40 hover:bg-black/80 p-3 rounded-full text-white transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 backdrop-blur-md"
                title="View Full Screen"
              >
                <Maximize2 size={20} />
              </button>

              {/* Instant Image Placeholder (Uses preloaded thumbnail) */}
              <div
                className={`absolute inset-0 z-0 bg-cover bg-center blur-md transition-opacity duration-300 pointer-events-none ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                style={{ backgroundImage: `url(${optimizedImageUrl(activeImage || (product?.images?.length ? product.images[0] : ''), 'thumbnail')})` }}
              />

              <img
                key={imageKey}
                src={optimizedImageUrl(activeImage || (product?.images?.length ? product.images[0] : ''), 'main')}
                alt={product.name}
                draggable={false}
                className={`max-w-full max-h-[85vh] h-auto w-auto object-contain select-none transition-opacity duration-300 relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                fetchPriority="high"
                decoding="async"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isSwiping.current) return;
                  setIsLightboxOpen(true);
                }}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: THUMBNAILS (Detached) */}
        {product.images && product.images.length > 1 && (
          <div className="w-full max-w-[1400px] mx-auto mb-6 md:mb-12 px-4">
            <div className="relative flex items-center gap-2 md:gap-3">
              {/* Left Scroll Button */}
              <button
                onClick={() => scrollThumbnails('left')}
                className="shrink-0 bg-white/[0.04] hover:bg-white/10 md:hover:bg-brand-gold md:hover:text-black p-1.5 md:p-2 rounded-full text-white/50 hover:text-white transition-colors border border-white/10"
              >
                <ChevronLeft size={14} className="md:hidden" />
                <ChevronLeft size={18} className="hidden md:block" />
              </button>

              {/* Thumbnail Scroll Container */}
              <div
                ref={scrollContainerRef}
                className={`flex-1 flex flex-row gap-2 md:gap-3 items-center justify-start overflow-x-auto no-scrollbar py-3 md:py-4 scroll-smooth px-4 ${isMainDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                style={{ touchAction: 'pan-x' }} // Allow horizontal swiping, prevent vertical bounce
                onMouseDown={handleMainMouseDown}
                onMouseLeave={handleMainMouseLeaveOrUp}
                onMouseUp={handleMainMouseLeaveOrUp}
                onMouseMove={handleMainMouseMove}
              >
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    id={`thumb-${idx}`}
                    type="button"
                    onClick={(e) => handleMainThumbClick(img, e)}
                    className={`relative h-14 md:h-20 aspect-[3/4] flex-shrink-0 overflow-hidden border rounded-sm transition duration-150 active:scale-95 ${activeImage === img ? 'border-brand-gold opacity-100 ring-2 ring-brand-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]' : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'}`}
                  >
                    <img
                      src={optimizedImageUrl(img, 'thumbnail')}
                      alt={`Thumb ${idx}`}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none" // Prevent dragging image
                      loading={idx < 4 ? "eager" : "lazy"} // Only eager load visible/initial thumbnails
                      decoding="async"
                    />
                  </button>
                ))}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={() => scrollThumbnails('right')}
                className="shrink-0 bg-white/[0.04] hover:bg-white/10 md:hover:bg-brand-gold md:hover:text-black p-1.5 md:p-2 rounded-full text-white/50 hover:text-white transition-colors border border-white/10"
              >
                <ChevronRight size={14} className="md:hidden" />
                <ChevronRight size={18} className="hidden md:block" />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 2: PRODUCT HEADER (Text Center, Max 900px) */}
        <div className="w-full max-w-[900px] mx-auto text-center mb-12">

          {/* Brand & Category */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-brand-gold text-[10px] uppercase tracking-widest font-bold">
              {category?.label}
            </span>
            {product.brandName && (
              <>
                <span className="text-white/20 text-[10px]">•</span>
                <Link
                  to={`/brand/${product.brandSlug || product.brandName.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-white/60 hover:text-brand-gold text-[10px] uppercase tracking-widest font-bold transition-colors"
                >
                  {product.brandName}
                </Link>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-5xl text-white mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-4 mb-8">
            <p className="text-3xl md:text-4xl font-bold text-brand-gold">
              {formatPrice(product.basePriceINR)}
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex justify-center mb-12">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full max-w-sm h-14 flex items-center justify-center gap-3 bg-brand-gold hover:bg-white text-black text-sm uppercase tracking-widest font-bold transition-all rounded-sm shadow-lg shadow-brand-gold/10"
            >
              <Phone size={18} />
              Ask On Whatsapp
            </a>
          </div>

          {/* SECTION 3: TRUST BOX (Optional but good) */}
          <div className="bg-neutral-900/50 border border-white/10 rounded-lg p-6 mb-12 text-left">
            <h3 className="text-white font-serif text-lg mb-6 text-center">Why Sai Satguru Textile?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 max-w-2xl mx-auto">

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Trusted by Wide Users</span>
                  <span className="text-[10px] text-white/50">Across global markets</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Global Logistics</span>
                  <span className="text-[10px] text-white/50">Efficient worldwide shipping</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Certified Quality</span>
                  <span className="text-[10px] text-white/50">Premium grade textiles</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-sm text-white font-medium">Heritage Craft</span>
                  <span className="text-[10px] text-white/50">Authentic traditional methods</span>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 4: PREMIUM PRODUCT DETAILS */}
          <div className="border-t border-white/10 pt-8 text-left">
            <h3 className="text-2xl md:text-3xl font-serif text-white mb-6 text-center tracking-tight">Product Details</h3>

            {parsedDetails ? (
              <div className="max-w-[1000px] mx-auto space-y-8">


                {/* 2. Metadata Grid: Brand | Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Brand', value: parsedDetails.brand || product.brandName || 'Generic' },
                    { label: 'Category', value: category?.label || category?.name || parsedDetails.type || 'General' }
                  ].map((item, i) => (
                    <div key={i} className="bg-white/[0.04] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center group hover:bg-white/[0.08] transition-all duration-500 shadow-xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-3 group-hover:text-brand-gold transition-colors">{item.label}</span>
                      <span className="text-sm font-bold text-white uppercase tracking-widest">{item.value}</span>
                    </div>
                  ))}
                </div>


                {/* 3. Professional E-commerce Tabs */}
                <div className="max-w-4xl mx-auto my-4 space-y-10">
                  {/* Tab Navigation */}
                  <div className="flex justify-start md:justify-center border-b border-white/10 gap-2 md:gap-8">
                    {[
                      { id: 'overview', label: 'Overview' },
                      { id: 'shipping', label: 'Shipping & Terms' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-4 px-2 md:px-6 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${activeTab === tab.id
                          ? 'text-brand-gold'
                          : 'text-white/30 hover:text-white/60'
                          }`}
                      >
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-brand-gold"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    {activeTab === 'overview' && (
                      <div className="max-w-4xl mx-auto py-0 animate-in fade-in zoom-in-95 duration-1000">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                          {/* Left Column: Structured Narrative */}
                          <div className="lg:col-span-8">
                            {parsedDetails.overviewItems.map((item, idx) => {
                              if (item.type === 'badge') {
                                return (
                                  <div key={idx} className="inline-block bg-white/[0.04] border border-white/10 px-5 py-2.5 rounded-full mr-3 mb-6 hover:bg-white/[0.08] transition-all group backdrop-blur-sm">
                                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-gold group-hover:text-white transition-colors">{item.content}</span>
                                  </div>
                                );
                              }
                              if (item.type === 'header') {
                                return (
                                  <div key={idx} className="pt-10 pb-6 relative group">
                                    <h4 className="flex items-center gap-4 text-xl md:text-2xl font-serif text-white tracking-tight uppercase">
                                      <span className="w-8 h-[1px] bg-brand-gold/40 group-hover:w-16 transition-all duration-500"></span>
                                      {item.content}
                                    </h4>
                                  </div>
                                );
                              }

                              // Format text type
                              const rawContent = item.content.trim();
                              const isBullet = rawContent.startsWith('-');
                              const textContent = isBullet ? rawContent.substring(1).trim() : rawContent;
                              const firstColonIdx = textContent.indexOf(':');

                              // If it's a key-value attribute (like "Top Fabric: Silk")
                              if (firstColonIdx > 0 && firstColonIdx < 35 && textContent.length < 150) {
                                const key = textContent.substring(0, firstColonIdx).trim();
                                const val = textContent.substring(firstColonIdx + 1).trim();

                                return (
                                  <div key={idx} className="group grid grid-cols-1 md:grid-cols-[130px_1fr] gap-1 md:gap-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded-sm mb-1 px-4 md:-mx-4">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-brand-gold/80 transition-colors pt-1">
                                      {key}
                                    </span>
                                    <span className="text-[15px] md:text-base text-white/90 font-light leading-relaxed">
                                      {val}
                                    </span>
                                  </div>
                                );
                              }

                              // Standard Text Paragraph / Bullet
                              return (
                                <p key={idx} className="text-[15px] md:text-lg text-neutral-300 font-light leading-[1.8] tracking-wide opacity-80 hover:opacity-100 transition-opacity flex items-start gap-4 mb-6">
                                  {isBullet && <span className="text-brand-gold text-lg mt-0.5 shrink-0 opacity-70">•</span>}
                                  <span>{textContent}</span>
                                </p>
                              );
                            })}

                            {/* Visual Accent */}
                            <div className="pt-12">
                              <div className="w-full h-[1px] bg-gradient-to-r from-brand-gold/40 via-transparent to-transparent"></div>
                            </div>
                          </div>

                          {/* Right Column: Key Accents & Trusted Info */}
                          <div className="lg:col-span-4 space-y-8">

                            {/* Quick Product Stats Glass Box */}
                            <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-brand-gold/20 transition-all duration-700">
                              <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-gold/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-8 flex items-center gap-3">
                                <span className="w-6 h-[1px] bg-brand-gold/30"></span>
                                Product Summary
                              </h4>

                              <ul className="space-y-6">
                                {[
                                  { label: "Material", text: "Premium Quality" },
                                  { label: "Origin", text: "Heritage Craft" },
                                  { label: "Shipping", text: "Global Reach" },
                                  { label: "Pricing", text: "Wholesale Ready" }
                                ].map((stat, i) => (
                                  <li key={i} className="flex flex-col gap-1">
                                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{stat.label}</span>
                                    <span className="text-xs text-white font-bold tracking-widest uppercase">{stat.text}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Verification Badge */}
                            <div className="bg-brand-gold/[0.03] border border-brand-gold/10 p-8 rounded-3xl flex flex-col items-center text-center gap-4">
                              <div className="w-12 h-12 bg-brand-gold/10 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-brand-gold" />
                              </div>
                              <p className="text-[10px] text-brand-gold font-black uppercase tracking-[0.3em] leading-relaxed">
                                Verified Quality<br />
                                <span className="text-white/40">3-Step Check Complete</span>
                              </p>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'shipping' && (
                      <div className="space-y-12 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { label: 'Pricing Status', value: 'Wholesale Standard' },
                            { label: 'Domestic/Global', value: parsedDetails.shipping || 'Shipping Extra' },
                            { label: 'Taxation Policy', value: parsedDetails.gst || 'GST 5% Extra' }
                          ].map((item, i) => (
                            <div key={i} className="bg-white/[0.03] border border-white/10 p-10 rounded-[2rem] text-center hover:bg-white/[0.06] transition-all group">
                              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 block mb-4 group-hover:text-brand-gold Transition-colors">{item.label}</span>
                              <span className="text-sm font-bold text-white uppercase tracking-widest">{item.value}</span>
                            </div>
                          ))}
                        </div>

                        {parsedDetails.notes.length > 0 && (
                          <div className="bg-white/[0.01] border border-white/5 p-12 rounded-[3rem] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] -mr-32 -mt-32"></div>
                            <h4 className="text-xs font-black uppercase tracking-[0.5em] text-white/30 mb-8 flex items-center gap-4">
                              <div className="w-8 h-[1px] bg-white/10"></div>
                              Terms & Guidelines
                            </h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                              {parsedDetails.notes.map((note, i) => (
                                <li key={i} className="text-[11px] text-white/50 flex items-start gap-5 leading-relaxed group">
                                  <span className="w-1.5 h-1.5 bg-brand-gold/30 rounded-full mt-1.5 shrink-0 group-hover:bg-brand-gold transition-colors"></span>
                                  {note}
                                </li>
                              ))}
                              {GLOBAL_NOTES.map((note, i) => {
                                // Prevent duplication if note is already in parsed notes
                                if (parsedDetails.notes.some(n => n.toLowerCase().includes(note.toLowerCase().substring(0, 20)))) return null;
                                return (
                                  <li key={`global-${i}`} className="text-[11px] text-brand-gold/40 flex items-start gap-5 leading-relaxed group italic">
                                    <span className="w-1.5 h-1.5 bg-brand-gold/20 rounded-full mt-1.5 shrink-0 group-hover:bg-brand-gold transition-colors"></span>
                                    {note}
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>



                {/* Fallback handled at the start of the structured section to prevent duplication */}
              </div>
            ) : (
              <div className="prose prose-invert prose-lg text-neutral-400 font-light leading-relaxed max-w-none mx-auto text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                <p className="whitespace-pre-line italic text-sm">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX: FULL IMMERSIVE VIEW */}
      {isLightboxOpen && createPortal(
        <div className="fixed inset-0 z-[999999] bg-black flex flex-col items-stretch overflow-hidden h-[100dvh] w-screen animate-in fade-in duration-200">
          {/* Close Button Only */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 md:top-6 md:right-6 z-[1000000] bg-black/40 hover:bg-black/80 backdrop-blur-md text-white/70 hover:text-white p-3 rounded-full transition-all border border-white/10 shadow-lg"
            title="Close"
          >
            <X size={24} strokeWidth={2} />
          </button>

          {/* Main Stage */}
          <div
            className="flex-1 relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {product.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                className="absolute left-2 md:left-8 z-[10000] bg-black/40 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all p-3 md:p-5 backdrop-blur-md shadow-lg border border-white/5"
              >
                <ChevronLeft size={32} strokeWidth={1.5} />
              </button>
            )}

            <div className="w-full h-[calc(100%-100px)] flex items-center justify-center mb-[100px] relative" onClick={() => setIsLightboxOpen(false)}>
              {/* Instant Image Placeholder (Uses preloaded thumbnail) */}
              <div
                className={`absolute inset-0 z-0 bg-contain bg-center bg-no-repeat blur-xl transition-opacity duration-300 pointer-events-none opacity-50`}
                style={{ backgroundImage: `url(${optimizedImageUrl(activeImage || (product.images?.[0] || ""), 'thumbnail')})` }}
              />

              <img
                key={`lightbox-${imageKey}`}
                src={optimizedImageUrl(activeImage || "", 'full')}
                alt={product.name}
                draggable={false}
                className="max-w-full max-h-full w-auto h-auto object-contain select-none shadow-none transition-transform duration-300 relative z-10"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>

            {product.images.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                className="absolute right-2 md:right-8 z-[10000] bg-black/40 hover:bg-black/80 rounded-full text-white/70 hover:text-white transition-all p-3 md:p-5 backdrop-blur-md shadow-lg border border-white/5"
              >
                <ChevronRight size={32} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-12 pb-6 px-4 z-[10000]">
            <div
              ref={lightboxScrollRef}
              className={`flex justify-start gap-2 overflow-x-auto no-scrollbar mx-auto py-2 px-4 max-w-4xl scroll-smooth ${isLbxDragging ? 'cursor-grabbing select-none' : 'cursor-grab'}`}
              style={{ touchAction: 'pan-x' }}
              onMouseDown={handleLbxMouseDown}
              onMouseLeave={handleLbxMouseLeaveOrUp}
              onMouseUp={handleLbxMouseLeaveOrUp}
              onMouseMove={handleLbxMouseMove}
            >
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  id={`lightbox-thumb-${idx}`}
                  onClick={(e) => handleLbxThumbClick(img, e)}
                  className={`relative h-14 w-10 md:h-16 md:w-12 shrink-0 rounded-[4px] border transition-all overflow-hidden ${activeImage === img
                    ? 'border-brand-gold ring-1 ring-brand-gold/50 opacity-100'
                    : 'border-white/10 opacity-40 hover:opacity-100'
                    }`}
                >
                  <img src={optimizedImageUrl(img, 'thumbnail')} alt="" className="w-full h-full object-cover pointer-events-none" draggable={false} />
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-3">
              {product.images.indexOf(activeImage!) + 1} / {product.images.length}
            </p>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};