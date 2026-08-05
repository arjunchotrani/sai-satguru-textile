'use client';

import React, { useState, useEffect } from 'react';
import { SplashScreen } from './SplashScreen';

const SPLASH_COOKIE_NAME = 'sst_splash_v5';

interface SplashGateProps {
  children: React.ReactNode;
}

export const SplashGate: React.FC<SplashGateProps> = ({ children }) => {
  const [phase, setPhase] = useState<'splash' | 'fading' | 'done'>('splash');

  // Runs once on mount: check for reload, session flag, or inline-script class.
  // The inline <head> script sets 'splash-seen' on <html> before first paint for
  // returning visitors, so this useEffect catches it before any timer fires.
  useEffect(() => {
    const [nav] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const isReload = nav?.type === 'reload';
    const hasSeenInSession = sessionStorage.getItem(SPLASH_COOKIE_NAME);
    const alreadySeen = document.documentElement.classList.contains('splash-seen');
    if (isReload || hasSeenInSession || alreadySeen) {
      setPhase('done');
    }
  }, []);

  // Start the dismiss timer only while in 'splash'. If phase is anything else
  // (e.g. 'done' set by the effect above), this is a no-op.
  useEffect(() => {
    if (phase !== 'splash') return;
    const fadeTimer = setTimeout(() => {
      setPhase('fading');
      try { sessionStorage.setItem(SPLASH_COOKIE_NAME, 'true'); } catch (e) {}
    }, 1250);
    return () => clearTimeout(fadeTimer);
  }, [phase]);

  // Fade-out transition.
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
