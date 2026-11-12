'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * RouteProgressBar provides an instant, sleek visual progress indicator
 * across the top of the browser window during Next.js route transitions.
 */
export default function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete and hide progress bar when route navigation finishes
  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept internal link clicks to give instant tactile progress feedback
  useEffect(() => {
    let p1: NodeJS.Timeout;
    let p2: NodeJS.Timeout;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Ignore non-navigation links (hash anchors, tel, mailto, new tab, modifiers)
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        targetAttr === '_blank' ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's the exact same page
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start the progress animation
      setIsVisible(true);
      setProgress(25);

      p1 = setTimeout(() => setProgress(65), 140);
      p2 = setTimeout(() => setProgress(88), 380);
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
      clearTimeout(p1);
      clearTimeout(p2);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="Page navigation progress"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: progress === 100 ? 0 : 1 }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-sky-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '160ms' : '320ms',
        }}
      />
    </div>
  );
}
