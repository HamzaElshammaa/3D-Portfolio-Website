'use client';

import { useEffect, useState } from 'react';

export function choosePickerVariant(input: {
  hasWebGL: boolean;
  prefersReducedMotion: boolean;
  hasSceneUrl: boolean;
}): 'spline' | '2d' {
  if (!input.hasSceneUrl) return '2d';
  if (!input.hasWebGL) return '2d';
  if (input.prefersReducedMotion) return '2d';
  return 'spline';
}

export function useWebGLSupported(): boolean {
  const [supported, setSupported] = useState(false);
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setSupported(Boolean(gl));
    } catch {
      setSupported(false);
    }
  }, []);
  return supported;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const listener = (e: MediaQueryListEvent) => setReduced(e.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return reduced;
}
