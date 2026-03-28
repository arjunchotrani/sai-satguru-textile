import React, { useState, useEffect, useCallback } from 'react';
import { SplashScreen } from './SplashScreen';

const SPLASH_STORAGE_KEY = 'sst_logo_shown';

interface SplashGateProps {
    children: React.ReactNode;
}

/**
 * SplashGate — Premium session-persistent branding gate.
 * 
 * - Shows splash only ONCE per browser session (first visit).
 * - Prevents content flash by delaying children until splash completes.
 * - Smooth fade-out transition before unmounting.
 * - Removes the static HTML splash on mount.
 */
export const SplashGate: React.FC<SplashGateProps> = ({ children }) => {
    const alreadySeen = typeof window !== 'undefined' && !!sessionStorage.getItem(SPLASH_STORAGE_KEY);

    const [phase, setPhase] = useState<'splash' | 'fading' | 'done'>(alreadySeen ? 'done' : 'splash');

    // Remove the static HTML splash immediately when React mounts
    useEffect(() => {
        const staticSplash = document.getElementById('static-splash');
        if (staticSplash) {
            // Fade it out first, then remove
            staticSplash.classList.add('fade-out');
            const removeTimer = setTimeout(() => {
                staticSplash.remove();
            }, 600);
            return () => clearTimeout(removeTimer);
        }
    }, []);

    // Splash timer: show for 2s, then start fade-out
    useEffect(() => {
        if (phase !== 'splash') return;

        const timer = setTimeout(() => {
            setPhase('fading');
            sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
        }, 1200);

        return () => clearTimeout(timer);
    }, [phase]);

    // Fade-out phase: wait for CSS animation to finish, then unmount
    useEffect(() => {
        if (phase !== 'fading') return;

        const timer = setTimeout(() => {
            setPhase('done');
        }, 600); // matches CSS fade-out duration

        return () => clearTimeout(timer);
    }, [phase]);

    // Always render children so data fetching starts immediately.
    // The splash overlays everything with z-[10000], so children are hidden visually.
    return (
        <>
            {phase !== 'done' && <SplashScreen isFading={phase === 'fading'} />}
            {children}
        </>
    );
};
