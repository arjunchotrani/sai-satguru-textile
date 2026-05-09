export default function Loading() {
  return (
    <div className="bg-black w-full min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-[#d4af37] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] font-bold animate-pulse">
          Loading
        </span>
      </div>
    </div>
  );
}
