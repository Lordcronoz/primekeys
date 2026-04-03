'use client';
import React from 'react';

export function useScroll(threshold: number) {
  const [scrolled, setScrolled] = React.useState(false);
  const rafRef = React.useRef<number | null>(null);

  const onScroll = React.useCallback(() => {
    // Throttle via rAF — only one React state update per paint frame
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      setScrolled(window.scrollY > threshold);
      rafRef.current = null;
    });
  }, [threshold]);

  React.useEffect(() => {
    // passive:true tells the browser this handler won't call preventDefault
    // so it can start compositing the scroll immediately without waiting for JS
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onScroll]);

  React.useEffect(() => { onScroll(); }, [onScroll]);

  return scrolled;
}
