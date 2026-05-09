import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex gap-2 mb-8 items-center h-4 w-48 bg-white/5 rounded animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Gallery Skeleton: Match ProductGallery aspect ratio */}
          <div className="space-y-4">
            <div className="aspect-[4/5] w-full bg-white/[0.03] rounded-2xl animate-pulse" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-white/[0.03] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Info Skeleton: Center-aligned to match final page.tsx layout */}
          <div className="space-y-10 py-4 flex flex-col items-center text-center">
            <div className="space-y-4 w-full flex flex-col items-center">
              <div className="h-3 w-24 bg-white/[0.05] rounded animate-pulse" />
              <div className="h-12 w-4/5 bg-white/[0.08] rounded animate-pulse" />
              <div className="h-8 w-40 bg-[#d4af37]/10 rounded animate-pulse" />
            </div>

            <div className="h-40 w-full bg-white/[0.03] rounded-xl border border-white/5 animate-pulse" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-white/[0.03] rounded-2xl border border-white/5 animate-pulse" />
              ))}
            </div>

            <div className="space-y-3 pt-6 w-full max-w-md">
              <div className="h-14 w-full bg-[#d4af37]/20 rounded animate-pulse" />
              <div className="h-4 w-32 mx-auto bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
