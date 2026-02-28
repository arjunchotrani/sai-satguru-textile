import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'default' | 'short' | 'splash';
}

export const Logo: React.FC<LogoProps> = ({ className = "", variant = "default" }) => {

  // Aesthetic Symbol: Specific Ganesha Line Art from Image
  const BrandSymbol = ({ size = "normal" }: { size?: "normal" | "large" }) => (
    <svg
      viewBox="0 0 100 100"
      className={`${size === 'large' ? 'w-32 h-32 md:w-48 md:h-48' : 'w-7 h-7 md:w-10 md:h-10'} overflow-visible`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-symbol" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>

      {/* 1. Top Bindu (Vertical Oval) */}
      <ellipse
        cx="50" cy="12" rx="3.5" ry="6"
        stroke="url(#gold-grad)"
        fill="url(#gold-grad)"
        className="animate-[fadeIn_1s_ease-out_forwards]"
        filter="url(#glow-symbol)"
      />

      {/* 2. Tripundra (Three Forehead Waves) */}
      <path
        d="M 35 24 Q 50 20 65 24"
        stroke="url(#gold-grad)"
        strokeWidth="1.5"
        strokeDasharray="40"
        className="animate-[draw_1s_ease-in-out_0.2s_forwards]"
      />
      <path
        d="M 32 30 Q 50 26 68 30"
        stroke="url(#gold-grad)"
        strokeWidth="1.5"
        strokeDasharray="40"
        className="animate-[draw_1s_ease-in-out_0.4s_forwards]"
      />
      <path
        d="M 35 36 Q 50 32 65 36"
        stroke="url(#gold-grad)"
        strokeWidth="1.5"
        strokeDasharray="40"
        className="animate-[draw_1s_ease-in-out_0.6s_forwards]"
      />

      {/* 3. Center Dot (Bindi) */}
      <circle
        cx="50" cy="48" r="4"
        stroke="url(#gold-grad)"
        fill="url(#gold-grad)"
        className="animate-[fadeIn_0.5s_ease-out_0.8s_forwards] opacity-0"
      />

      {/* 4. Left Flank (Ear) */}
      <path
        d="M 42 45 C 30 40, 10 35, 15 60 C 18 68, 28 60, 38 65"
        stroke="url(#gold-grad)"
        strokeWidth="2"
        strokeDasharray="100"
        className="animate-[draw_1.5s_ease-in-out_1s_forwards]"
        filter="url(#glow-symbol)"
      />

      {/* 5. Right Flank & Trunk (Main Flow) */}
      <path
        d="M 58 45 C 75 35, 95 45, 85 65 C 75 85, 55 70, 50 85 C 45 98, 30 90, 35 80"
        stroke="url(#gold-grad)"
        strokeWidth="2.5"
        strokeDasharray="200"
        className="animate-[draw_2s_ease-in-out_1.2s_forwards]"
        filter="url(#glow-symbol)"
      />

      {/* Optional: Small accent on trunk tip */}
      <path
        d="M 38 82 Q 42 88 46 84"
        stroke="url(#gold-grad)"
        strokeWidth="1"
        className="animate-[draw_0.5s_ease-in-out_2.5s_forwards]"
        opacity="0.8"
      />
    </svg>
  );

  if (variant === 'splash') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {/* "Welcome to" */}
        <div className="overflow-hidden mb-3 md:mb-6 text-center">
          <span className="block font-script text-xl md:text-4xl lg:text-5xl text-brand-gold/90 animate-[slideUp_0.8s_ease-out_0.2s_forwards] opacity-0 drop-shadow-md">
            Welcome to
          </span>
        </div>

        {/* Logo icon with glow rings */}
        <div className="relative mb-4 md:mb-8 flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full border border-brand-gold/[0.04] opacity-0"
            style={{
              width: '160px', height: '160px',
              animation: 'splash-glow-ring 2s ease-in-out 0.8s infinite',
            }}
          />
          {/* Inner glow ring */}
          <div
            className="absolute rounded-full border border-brand-gold/[0.08] opacity-0"
            style={{
              width: '120px', height: '120px',
              animation: 'splash-glow-ring 2s ease-in-out 0.5s infinite',
            }}
          />
          <div className="opacity-0 animate-[fadeIn_0.8s_ease-out_0.1s_forwards]">
            <BrandSymbol size="large" />
          </div>
        </div>

        {/* Brand Name */}
        <div className="relative text-center">
          {/* Shadow/Blur Effect */}
          <h1 className="absolute inset-0 font-display text-2xl md:text-5xl lg:text-7xl text-white blur-md opacity-50 animate-[fadeIn_1.5s_ease-out_0.4s_forwards] opacity-0 leading-tight">
            Sai Satguru<br />Textile
          </h1>

          <h1 className="relative font-display text-2xl md:text-5xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/80 tracking-widest uppercase font-semibold leading-tight animate-[fadeIn_1.5s_ease-out_0.4s_forwards] opacity-0 drop-shadow-sm px-4">
            Sai Satguru<br />
            <span className="text-[9px] md:text-xs lg:text-sm tracking-[0.4em] text-brand-gold/70 font-light mt-1 md:mt-2 block">Textile</span>
          </h1>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes splash-glow-ring {
            0%, 100% { opacity: 0; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
          }
        `}} />
      </div>
    );
  }

  // Navbar / Default Variant
  return (
    <div className={`flex items-center gap-2 md:gap-4 ${className} group`}>
      {/* Icon */}
      <div className="flex-shrink-0 text-white group-hover:text-brand-gold transition-colors duration-500">
        <BrandSymbol size="normal" />
      </div>

      {/* Text */}
      <div className="flex flex-col">
        <h1 className="font-display text-xs md:text-lg lg:text-xl text-white tracking-widest uppercase leading-none drop-shadow-sm group-hover:text-brand-gold transition-colors duration-300">
          Sai Satguru
        </h1>
        <span className="text-[7px] md:text-[9px] lg:text-[10px] text-brand-gold uppercase tracking-[0.4em] leading-tight ml-0.5 mt-0.5 md:mt-1 font-light">
          Textile
        </span>
      </div>
    </div>
  );
};