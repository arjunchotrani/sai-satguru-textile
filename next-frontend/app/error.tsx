'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="bg-black w-full min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center border border-white/10 rounded-2xl p-10 bg-white/[0.02] shadow-2xl backdrop-blur-sm animate-reveal mt-20">
        <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Something went wrong!</h2>
        <p className="text-white/60 text-sm mb-8">
          We encountered an unexpected error while loading this page. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors rounded-sm"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
