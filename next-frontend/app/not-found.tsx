
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-black w-full min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center border border-white/10 rounded-2xl p-10 bg-white/[0.02] shadow-2xl backdrop-blur-sm animate-reveal mt-20">
        <span className="text-[120px] md:text-[180px] font-black leading-none text-[#d4af37] opacity-20 block mb-4 font-serif">
          404
        </span>
        <h2 className="font-serif text-3xl md:text-5xl text-white mb-4 -mt-16 relative z-10">
          Page Not Found
        </h2>
        <p className="text-white/60 text-sm md:text-base mb-10 max-w-md mx-auto relative z-10">
          The page or product you are looking for does not exist, has been removed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
          <Link
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors rounded-sm"
          >
            Return Home
          </Link>
          <Link
            href="/collections"
            className="w-full sm:w-auto px-8 py-3 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors rounded-sm"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
