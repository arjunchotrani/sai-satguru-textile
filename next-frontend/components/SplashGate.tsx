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

  // 1. Client-side Persistence Check (Secondary Layer)
  // Runs once on mount to catch cases where the server-side cookie check was bypassed.
  useEffect(() => {
    if (alreadySeen) return;

    try {
      const hasSeenLocal = localStorage.getItem(SPLASH_COOKIE_NAME);
      if (hasSeenLocal) {
        setPhase('done');
      }
    } catch (e) {
      // Ignore storage errors (e.g. private mode)
    }
  }, [alreadySeen]);

  // 2. Splash Display Timer
  useEffect(() => {
    if (phase !== 'splash' || alreadySeen) return;

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
      
      // Dual-Layer Persistence Setting
      const expiry = 60 * 60 * 24 * 365; // 1 year
      document.cookie = `${SPLASH_COOKIE_NAME}=true; path=/; max-age=${expiry}; SameSite=Lax`;
      try {
        localStorage.setItem(SPLASH_COOKIE_NAME, 'true');
      } catch (e) {
        console.error("Failed to set localStorage", e);
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
