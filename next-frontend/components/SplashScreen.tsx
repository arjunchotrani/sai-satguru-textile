'use client';

import React from 'react';

interface SplashScreenProps {
  isFading?: boolean;
}

// Standalone Ganesha mark — gold gradient, exactly as in production
const GaneshaSymbol = () => (
  <svg
    viewBox="0 0 100 100"
    className="w-[80px] h-[80px] md:w-[120px] md:h-[120px] overflow-visible"
    fill="none"
    stroke="url(#splash-gold)"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <defs>
      <filter id="splash-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="splash-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFFFFF" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#d4af37" />
      </linearGradient>
    </defs>

    {/* Bindu (top oval) */}
    <ellipse
      cx="50" cy="12" rx="3.5" ry="6"
      stroke="url(#splash-gold)"
      fill="url(#splash-gold)"
      filter="url(#splash-glow)"
      className="animate-[fadeIn_0.8s_ease-out_0.1s_forwards] opacity-0"
    />

    {/* Three forehead marks (tripundra) */}
    <path d="M 35 24 Q 50 20 65 24" stroke="url(#splash-gold)" strokeWidth="1.5"
      strokeDasharray="40" strokeDashoffset="40"
      className="animate-[draw_1s_ease-in-out_0.2s_forwards]"
    />
    <path d="M 32 30 Q 50 26 68 30" stroke="url(#splash-gold)" strokeWidth="1.5"
      strokeDasharray="40" strokeDashoffset="40"
      className="animate-[draw_1s_ease-in-out_0.4s_forwards]"
    />
    <path d="M 35 36 Q 50 32 65 36" stroke="url(#splash-gold)" strokeWidth="1.5"
      strokeDasharray="40" strokeDashoffset="40"
      className="animate-[draw_1s_ease-in-out_0.6s_forwards]"
    />

    {/* Center bindi */}
    <circle cx="50" cy="48" r="4"
      fill="url(#splash-gold)" stroke="none"
      className="animate-[fadeIn_0.5s_ease-out_0.8s_forwards] opacity-0"
    />

    {/* Left ear */}
    <path d="M 42 45 C 30 40, 10 35, 15 60 C 18 68, 28 60, 38 65"
      strokeWidth="2" strokeDasharray="100" strokeDashoffset="100"
      className="animate-[draw_1.5s_ease-in-out_1s_forwards]"
      filter="url(#splash-glow)"
    />

    {/* Main trunk / right flank */}
    <path d="M 58 45 C 75 35, 95 45, 85 65 C 75 85, 55 70, 50 85 C 45 98, 30 90, 35 80"
      strokeWidth="2.5" strokeDasharray="200" strokeDashoffset="200"
      className="animate-[draw_2s_ease-in-out_1.2s_forwards]"
      filter="url(#splash-glow)"
    />
  </svg>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFading = false }) => {
  return (
    <div
      data-splash-screen
      className={`fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center transition-all duration-[600ms] ease-out ${
        isFading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{ transitionProperty: 'opacity, transform', zIndex: 99999, pointerEvents: isFading ? 'none' : 'auto' }}
    >
      {/* Ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.06)_0%,_transparent_60%)] pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-[2px] h-[2px] bg-[#d4af37]/30 rounded-full"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i * 17) % 60}%`,
              animation: `splash-float ${2.5 + i * 0.3}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main content stack */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* "Welcome to" — Great Vibes script */}
        <div className="overflow-hidden mb-3 md:mb-5">
          <span
            className="block font-script text-2xl md:text-4xl lg:text-5xl text-[#d4af37]/90 drop-shadow-md opacity-0"
            style={{ animation: 'splash-slide-up 0.8s ease-out 0.2s forwards' }}
          >
            Welcome to
          </span>
        </div>

        {/* Ganesha Mark with glow rings */}
        <div className="relative flex items-center justify-center mb-5 md:mb-8">
          {/* Outer glow ring */}
          <div
            className="absolute rounded-full border border-[#d4af37]/[0.05]"
            style={{ width: '160px', height: '160px', animation: 'splash-glow-ring 2s ease-in-out 0.8s infinite' }}
          />
          {/* Inner glow ring */}
          <div
            className="absolute rounded-full border border-[#d4af37]/[0.1]"
            style={{ width: '120px', height: '120px', animation: 'splash-glow-ring 2s ease-in-out 0.5s infinite' }}
          />
          <div className="opacity-0" style={{ animation: 'fadeIn 0.8s ease-out 0.1s forwards' }}>
            <GaneshaSymbol />
          </div>
        </div>

        {/* Brand name block */}
        <div
          className="flex flex-col items-center opacity-0"
          style={{ animation: 'splash-slide-up 0.8s ease-out 0.4s forwards' }}
        >
          {/* "SAI SATGURU" — Cinzel, massive */}
          <h1 className="font-display font-semibold text-white uppercase leading-none tracking-[0.12em] text-[2.2rem] md:text-6xl lg:text-7xl drop-shadow-sm">
            Sai Satguru
          </h1>
          {/* "TEXTILE" — small gold, wide tracking */}
          <span className="font-display font-light text-[#d4af37]/70 uppercase tracking-[0.55em] text-[0.55rem] md:text-[0.7rem] lg:text-[0.8rem] mt-2 md:mt-3 ml-[0.55em]">
            Textile
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 w-28 md:w-48 h-[2px] bg-white/[0.04] overflow-hidden rounded-full opacity-0"
        style={{ animation: 'fadeIn 0.5s ease-out 0.6s forwards' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, rgba(212,175,55,0.15), rgba(212,175,55,0.6), rgba(212,175,55,0.15))',
            animation: 'loading 2s ease-in-out forwards',
          }}
        />
      </div>

      {/* Tagline */}
      <p
        className="absolute bottom-7 md:bottom-10 text-white/20 text-[7px] md:text-[8px] uppercase tracking-[0.35em] opacity-0"
        style={{ animation: 'fadeIn 0.5s ease-out 1s forwards' }}
      >
        Premium Textile Solutions
      </p>

      {/* Keyframes — inline for reliability (dangerouslySetInnerHTML matches legacy SPA) */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loading {
            0%   { width: 0%; }
            100% { width: 100%; }
          }
          @keyframes splash-float {
            0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
            50%       { transform: translateY(-20px) scale(1.5); opacity: 1; }
          }
          @keyframes splash-slide-up {
            0%   { opacity: 0; transform: translateY(15px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes splash-glow-ring {
            0%, 100% { opacity: 0; transform: scale(1); }
            50%       { opacity: 1; transform: scale(1.1); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        `
      }} />
    </div>
  );
};
