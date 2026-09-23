'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface HeroCategoryCardProps {
  href: string;
  label: string;
  image: string | null;
  priority?: boolean;
  variant?: 'arch' | 'rect';
  sizes?: string;
}

export function HeroCategoryCard({
  href,
  label,
  image,
  priority = false,
  variant = 'rect',
  sizes = '(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw',
}: HeroCategoryCardProps) {
  const [errored, setErrored] = useState(false);
  const showImage = Boolean(image) && !errored;
  const roundedClass = variant === 'arch' ? 'rounded-t-[42%] rounded-b-[6px]' : 'rounded-[6px]';

  return (
    <Link
      href={href}
      aria-label={`Shop wholesale ${label} — Sai Satguru Textile, Surat`}
      className={`group relative block aspect-[3/4] overflow-hidden border border-[#d4af37]/25 hover:border-[#d4af37]/70 focus-visible:border-[#d4af37]/80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d4af37]/60 transition-colors duration-500 ${roundedClass}`}
    >
      {showImage ? (
        <Image
          src={image as string}
          alt={`${label} — wholesale ${label.toLowerCase()} from Sai Satguru Textile, Surat`}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-out motion-safe:group-hover:scale-110"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#161616] to-black">
          <span className="font-serif text-3xl md:text-4xl text-[#d4af37]/35" aria-hidden="true">
            {label.charAt(0)}
          </span>
        </div>
      )}

      {/* Permanent gradient — label must stay readable without hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1.5 p-2 md:p-3">
        <span className="text-[9.5px] md:text-[11px] font-bold uppercase tracking-[0.1em] text-white leading-tight">
          {label}
        </span>
        <ArrowUpRight
          size={14}
          className="shrink-0 text-[#d4af37] opacity-80 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}
