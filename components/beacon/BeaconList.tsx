'use client';

import { useState, useCallback, useMemo } from 'react';
import { BeaconCard } from './BeaconCard';
import { useBeacons, type BeaconFilter } from '@/lib/hooks/useBeacons';
import { useGeolocation } from '@/lib/hooks/useGeolocation';
import { useUser } from '@/lib/hooks/useUser';
import type { BeaconWithDetails } from '@/lib/types/database';

interface BeaconListProps {
  initialFilter?: BeaconFilter;
}

/**
 * Beacon list with tabs for Active, Mine, Recent
 */
export function BeaconList({ initialFilter = 'active' }: BeaconListProps) {
  const [filter, setFilter] = useState<BeaconFilter>(initialFilter);
  const { coords, requestLocation } = useGeolocation();
  const { user } = useUser();

  const {
    beacons,
    isLoading,
    error,
    respondToBeacon,
    pingBeacon,
    closeBeacon,
    refresh,
  } = useBeacons({
    filter,
    lat: coords?.latitude,
    lng: coords?.longitude,
    radiusMiles: 50, // Default to 50 miles
    refreshInterval: filter === 'active' ? 30000 : 60000, // Faster refresh for active
  });

  // Handle response
  const handleRespond = useCallback(
    async (beaconId: string, type: 'on_my_way' | 'next_time') => {
      const success = await respondToBeacon(beaconId, type);
      if (success) {
        // Could show a toast here
      }
    },
    [respondToBeacon]
  );

  // Handle ping
  const handlePing = useCallback(
    async (beaconId: string) => {
      const result = await pingBeacon(beaconId);
      if (result.success) {
        // Could show a toast here
      }
    },
    [pingBeacon]
  );

  // Handle close
  const handleClose = useCallback(
    async (beaconId: string) => {
      const success = await closeBeacon(beaconId);
      if (success) {
        refresh();
      }
    },
    [closeBeacon, refresh]
  );

  // Group beacons by section
  const groupedBeacons = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const active: BeaconWithDetails[] = [];
    const recent: BeaconWithDetails[] = [];
    const archived: BeaconWithDetails[] = [];

    beacons.forEach((beacon) => {
      const createdAt = new Date(beacon.created_at);

      if (beacon.status === 'active') {
        active.push(beacon);
      } else if (createdAt >= today) {
        recent.push(beacon);
      } else {
        archived.push(beacon);
      }
    });

    return { active, recent, archived };
  }, [beacons]);

  // Check if user owns a beacon
  const userOwnsBeacon = useCallback(
    (beacon: BeaconWithDetails) => user?.id === beacon.user_id,
    [user?.id]
  );

  // Request location on mount
  const handleEnableLocation = () => {
    requestLocation();
  };

  const tabs: { key: BeaconFilter; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'mine', label: 'My Beacons' },
    { key: 'recent', label: 'Recent' },
  ];

  return (
    <div className="space-y-6">
      {/* Location prompt */}
      {!coords && filter === 'active' && (
        <div className="bg-neon-purple/10 border-2 border-neon-purple/30 rounded-lg p-4 text-center">
          <p className="text-foreground font-mono mb-3">
            Enable location to see beacons sorted by distance
          </p>
          <button
            onClick={handleEnableLocation}
            className="px-4 py-2 bg-neon-purple text-background font-mono rounded hover:shadow-[0_0_15px_rgba(119,0,204,0.4)] transition-all"
          >
            Enable Location
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b-2 border-neon-cyan/20">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-3 font-mono text-sm transition-all ${
              filter === tab.key
                ? 'text-neon-cyan border-b-2 border-neon-cyan -mb-[2px]'
                : 'text-foreground-dim hover:text-foreground'
            }`}
          >
            {tab.label}
            {tab.key === 'active' && groupedBeacons.active.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-neon-cyan/20 text-neon-cyan rounded text-xs">
                {groupedBeacons.active.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-2 border-foreground-dim/20 bg-background-lighter p-4 animate-pulse"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-foreground-dim/20" />
                <div className="flex-1">
                  <div className="h-4 bg-foreground-dim/20 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-foreground-dim/20 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-foreground-dim/20 rounded w-2/3 mb-2" />
              <div className="h-3 bg-foreground-dim/20 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <div className="text-neon-magenta font-mono mb-4">
            Failed to load beacons
          </div>
          <button
            onClick={refresh}
            className="px-4 py-2 border-2 border-neon-cyan text-neon-cyan font-mono rounded hover:bg-neon-cyan hover:text-background transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Beacon list */}
      {!isLoading && !error && (
        <>
          {/* Active section */}
          {filter === 'active' && (
            <>
              {groupedBeacons.active.length > 0 ? (
                <div className="space-y-4">
                  {groupedBeacons.active.map((beacon) => (
                    <BeaconCard
                      key={beacon.id}
                      beacon={beacon}
                      isOwner={userOwnsBeacon(beacon)}
                      onRespond={handleRespond}
                      onPing={handlePing}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📍</div>
                  <h3 className="text-xl font-mono font-bold text-foreground mb-2">
                    No Active Beacons
                  </h3>
                  <p className="text-foreground-dim font-mono text-sm">
                    Be the first to broadcast your location!
                  </p>
                </div>
              )}
            </>
          )}

          {/* Mine section */}
          {filter === 'mine' && (
            <>
              {beacons.length > 0 ? (
                <div className="space-y-4">
                  {beacons.map((beacon) => (
                    <BeaconCard
                      key={beacon.id}
                      beacon={beacon}
                      isOwner={true}
                      onClose={handleClose}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔔</div>
                  <h3 className="text-xl font-mono font-bold text-foreground mb-2">
                    No Beacons Yet
                  </h3>
                  <p className="text-foreground-dim font-mono text-sm">
                    Tap the beacon button to broadcast your location
                  </p>
                </div>
              )}
            </>
          )}

          {/* Recent section */}
          {filter === 'recent' && (
            <>
              {beacons.length > 0 ? (
                <div className="space-y-4">
                  {beacons.map((beacon) => (
                    <BeaconCard
                      key={beacon.id}
                      beacon={beacon}
                      isOwner={userOwnsBeacon(beacon)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📜</div>
                  <h3 className="text-xl font-mono font-bold text-foreground mb-2">
                    No Recent Beacons
                  </h3>
                  <p className="text-foreground-dim font-mono text-sm">
                    Check back later to see today&apos;s activity
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Pull to refresh hint */}
      <div className="text-center text-foreground-dim font-mono text-xs pt-4">
        Auto-refreshes every {filter === 'active' ? '30' : '60'} seconds
      </div>
    </div>
  );
}
