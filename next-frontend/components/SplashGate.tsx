'use client';

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';

const SPLASH_COOKIE_NAME = 'sst_splash_v5';

interface SplashGateProps {
  children: React.ReactNode;
}

export const SplashGate: React.FC<SplashGateProps> = ({ children }) => {
  // The inline blocking script in <head> sets 'splash-seen' on <html> before
  // first paint for returning visitors, so this initializer runs with the
  // correct DOM state in the browser — no flash-of-splash.
  const [phase, setPhase] = useState<'splash' | 'fading' | 'done'>(() => {
    if (typeof window === 'undefined') return 'splash';
    return document.documentElement.classList.contains('splash-seen') ? 'done' : 'splash';
  });

  // Detect reload and session-storage flag
  useEffect(() => {
    if (phase === 'done') return;
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isReload = nav?.type === 'reload';
    const hasSeenInSession = sessionStorage.getItem(SPLASH_COOKIE_NAME);
    if (isReload || hasSeenInSession) {
      setPhase('done');
      return;
    }

    const fadeTimer = setTimeout(() => {
      setPhase('fading');
      try { sessionStorage.setItem(SPLASH_COOKIE_NAME, 'true'); } catch (e) {}
    }, 1250);

    return () => clearTimeout(fadeTimer);
  }, [phase]);

  // Fade-out transition
  useEffect(() => {
    if (phase !== 'fading') return;
    const doneTimer = setTimeout(() => setPhase('done'), 600);
    return () => clearTimeout(doneTimer);
  }, [phase]);

  return (
    <>
      {children}
      {phase !== 'done' && <SplashScreen isFading={phase === 'fading'} />}
    </>
  );
};
