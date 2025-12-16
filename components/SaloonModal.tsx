'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './saloon-modal.css';

interface SaloonModalProps {
  show: boolean;
}

export function SaloonModal({ show }: SaloonModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (show && !hasAnimated) {
      // Small delay before showing to ensure page is loaded
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasAnimated(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [show, hasAnimated]);

  if (!show || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-8 pointer-events-none">
      {/* The swinging sign */}
      <Link
        href="/roadtrip"
        className="saloon-sign pointer-events-auto cursor-pointer group"
      >
        {/* Chain/rope from top */}
        <div className="flex justify-center">
          <div className="w-1 h-8 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full shadow-md" />
        </div>

        {/* The sign board */}
        <div className="relative">
          {/* Wood grain background */}
          <div
            className="saloon-board relative bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 px-8 py-6 rounded-lg shadow-2xl border-4 border-amber-950 transform transition-transform duration-300 group-hover:scale-105"
          >
            {/* Wood grain texture overlay */}
            <div className="saloon-wood-grain absolute inset-0 opacity-20 rounded-lg" />

            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/50 rounded-tl" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/50 rounded-tr" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/50 rounded-bl" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/50 rounded-br" />

            {/* Text content */}
            <div className="relative text-center">
              <p className="text-amber-200 text-xs uppercase tracking-widest mb-1 font-mono">
                Now Departing
              </p>
              <h2 className="saloon-title text-2xl md:text-3xl font-bold text-amber-100 mb-2">
                The Renubu
              </h2>
              <h3 className="saloon-title text-3xl md:text-4xl font-bold text-amber-50">
                Road Show
              </h3>
              <div className="mt-3 pt-3 border-t border-amber-600/50">
                <p className="text-amber-300 text-sm font-mono">
                  Dec 29 - Jan 30
                </p>
                <p className="text-amber-200/80 text-xs mt-2 group-hover:text-amber-100 transition-colors">
                  Click to see the route
                </p>
              </div>
            </div>
          </div>

          {/* Bottom decorative hooks */}
          <div className="flex justify-between px-4 -mt-1">
            <div className="w-2 h-3 bg-amber-950 rounded-b" />
            <div className="w-2 h-3 bg-amber-950 rounded-b" />
          </div>
        </div>
      </Link>
    </div>
  );
}
