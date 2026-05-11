'use client';

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';

const SPLASH_COOKIE_NAME = 'sst_splash_v5';

interface SplashGateProps {
  children: React.ReactNode;
  alreadySeen?: boolean;
}

/**
 * SplashGate — Bulletproof premium branding gate.
 * 
 * Uses dual-layer persistence (Cookies + LocalStorage) to ensure
 * the splash only shows ONCE per device, ever.
 */
export const SplashGate: React.FC<SplashGateProps> = ({ children, alreadySeen = false }) => {
  const [phase, setPhase] = useState<'splash' | 'fading' | 'done'>(alreadySeen ? 'done' : 'splash');

  // 1. Detect Refresh & Session State
  useEffect(() => {
    // 🚀 Detect if this is a hard refresh or page reload
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isReload = nav?.type === 'reload';
    
    // Check if they've already seen it in this specific tab session
    const hasSeenInSession = sessionStorage.getItem(SPLASH_COOKIE_NAME);

    if (isReload || hasSeenInSession || alreadySeen) {
      setPhase('done');
      return;
    }
  }, [alreadySeen]);

  // 2. Splash Display Timer
  useEffect(() => {
    if (phase !== 'splash' || alreadySeen) return;

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
      
      // ✅ Set Session Storage so it doesn't show again in this tab (until refresh)
      // Note: We don't set a long-term cookie anymore so it shows on fresh visits
      try {
        sessionStorage.setItem(SPLASH_COOKIE_NAME, 'true');
      } catch (e) {
        console.error("Failed to set sessionStorage", e);
      }
    }, 1250);

    return () => clearTimeout(fadeTimer);
  }, [phase, alreadySeen]);

  // 3. Fade-out Transition Timer
  useEffect(() => {
    if (phase !== 'fading') return;

    const doneTimer = setTimeout(() => {
      setPhase('done');
    }, 600);

    return () => clearTimeout(doneTimer);
  }, [phase]);

  return (
    <>
      {children}
      {phase !== 'done' && <SplashScreen isFading={phase === 'fading'} />}
    </>
  );
};
