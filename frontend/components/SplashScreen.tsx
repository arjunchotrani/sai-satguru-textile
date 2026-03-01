import React from 'react';
import { Logo } from './Logo';

interface SplashScreenProps {
    isFading?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFading = false }) => {
    return (
        <div
            className={`fixed inset-0 z-[10000] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-[600ms] ease-out ${isFading ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
                }`}
            style={{ transitionProperty: 'opacity, transform' }}
        >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-gold/5 via-transparent to-transparent opacity-40"></div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-[2px] h-[2px] bg-brand-gold/30 rounded-full"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i * 17) % 60}%`,
                            animation: `splash-float ${2.5 + i * 0.3}s ease-in-out ${i * 0.3}s infinite`,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <Logo variant="splash" className="relative z-10" />

            {/* Premium Progress Bar */}
            <div className="absolute bottom-14 md:bottom-20 left-1/2 -translate-x-1/2 w-28 md:w-48 h-[2px] bg-white/[0.04] overflow-hidden rounded-full opacity-0 animate-[fadeIn_0.5s_ease-out_0.6s_forwards]">
                <div
                    className="h-full rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, rgba(255,215,0,0.15), rgba(255,215,0,0.5), rgba(255,215,0,0.15))',
                        animation: 'loading 2s ease-in-out forwards',
                    }}
                ></div>
            </div>

            {/* Tagline */}
            <p className="absolute bottom-7 md:bottom-10 text-white/20 text-[7px] md:text-[8px] uppercase tracking-[0.35em] opacity-0 animate-[fadeIn_0.5s_ease-out_1s_forwards]">
                Premium Textile Solutions
            </p>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes loading {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
                @keyframes splash-float {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 0; }
                    50% { transform: translateY(-20px) scale(1.5); opacity: 1; }
                }
            `}} />
        </div>
    );
};
