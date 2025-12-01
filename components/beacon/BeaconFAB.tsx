'use client';

import { useState } from 'react';
import { BeaconCreateSheet } from './BeaconCreateSheet';

interface BeaconFABProps {
  unseenCount?: number;
  hasActiveBeacon?: boolean;
  onBeaconCreated?: () => void;
}

/**
 * Floating Action Button for creating beacons
 * Fixed position at bottom-right, above mobile nav
 */
export function BeaconFAB({
  unseenCount = 0,
  hasActiveBeacon = false,
  onBeaconCreated,
}: BeaconFABProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleClick = () => {
    setIsSheetOpen(true);
  };

  const handleClose = () => {
    setIsSheetOpen(false);
  };

  const handleSuccess = () => {
    setIsSheetOpen(false);
    onBeaconCreated?.();
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={handleClick}
        className={`
          fixed bottom-24 right-6 z-40
          w-14 h-14 rounded-full
          flex items-center justify-center
          font-mono font-bold text-sm
          transition-all duration-300
          ${
            hasActiveBeacon
              ? 'bg-neon-magenta border-2 border-neon-magenta text-background shadow-[0_0_20px_rgba(187,0,170,0.4)]'
              : 'bg-neon-cyan border-2 border-neon-cyan text-background shadow-[0_0_20px_rgba(0,204,221,0.4)] animate-pulse'
          }
          hover:scale-110 hover:shadow-[0_0_30px_rgba(0,204,221,0.6)]
          active:scale-95
        `}
        aria-label={hasActiveBeacon ? 'Update your beacon' : "I'm Here - broadcast your location"}
      >
        {/* Location pin icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      {/* Badge for unseen beacons */}
      {unseenCount > 0 && (
        <div
          className="
            fixed bottom-[104px] right-4 z-50
            min-w-5 h-5 px-1.5
            flex items-center justify-center
            bg-neon-magenta text-background
            rounded-full font-mono text-xs font-bold
            pointer-events-none
          "
        >
          {unseenCount > 99 ? '99+' : unseenCount}
        </div>
      )}

      {/* Create Beacon Sheet */}
      <BeaconCreateSheet
        isOpen={isSheetOpen}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </>
  );
}
