'use client';

import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import { authenticatedFetcher } from '@/lib/api/swr-config';
import type {
  Beacon,
  BeaconWithDetails,
  BeaconDurationHint,
  BeaconResponseType,
} from '@/lib/types/database';

// Types
export interface BeaconsApiResponse {
  success: boolean;
  beacons: BeaconWithDetails[];
}

export interface CreateBeaconRequest {
  lat: number;
  lng: number;
  venue_name?: string | undefined;
  venue_address?: string | undefined;
  vibe_text?: string | undefined;
  duration_hint?: BeaconDurationHint | undefined;
  tagged_member_ids?: string[] | undefined;
}

export interface CreateBeaconResponse {
  success: boolean;
  beacon: Beacon;
}

export interface GeocodeResponse {
  success: boolean;
  venue_name: string | null;
  address: string;
  display_name: string;
}

export type BeaconFilter = 'active' | 'mine' | 'recent';

interface UseBeaconsOptions {
  filter?: BeaconFilter;
  lat?: number | null | undefined;
  lng?: number | null | undefined;
  radiusMiles?: number;
  refreshInterval?: number;
}

/**
 * SWR config for beacons - auto-refresh every 30 seconds
 */
const beaconSwrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  refreshInterval: 30000, // Auto-refresh every 30 seconds
};

/**
 * Hook for managing beacons with SWR
 */
export function useBeacons(options: UseBeaconsOptions = {}) {
  const {
    filter = 'active',
    lat,
    lng,
    radiusMiles = 25,
    refreshInterval = 30000,
  } = options;

  // Build URL with query params
  const url = useMemo(() => {
    const params = new URLSearchParams();
    params.set('status', filter);
    if (lat !== null && lat !== undefined) params.set('lat', lat.toString());
    if (lng !== null && lng !== undefined) params.set('lng', lng.toString());
    params.set('radius_miles', radiusMiles.toString());
    return `/api/beacons?${params.toString()}`;
  }, [filter, lat, lng, radiusMiles]);

  const { data, error, mutate, isLoading } = useSWR<BeaconsApiResponse>(
    url,
    authenticatedFetcher,
    {
      ...beaconSwrConfig,
      refreshInterval,
    }
  );

  const beacons = data?.beacons || [];

  // Create a new beacon
  const createBeacon = useCallback(
    async (beaconData: CreateBeaconRequest): Promise<Beacon | null> => {
      try {
        const response = await fetch('/api/beacons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(beaconData),
        });

        const result: CreateBeaconResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error('Failed to create beacon');
        }

        // Revalidate the list
        mutate();

        return result.beacon;
      } catch (err) {
        console.error('Error creating beacon:', err);
        return null;
      }
    },
    [mutate]
  );

  // Close a beacon
  const closeBeacon = useCallback(
    async (beaconId: string): Promise<boolean> => {
      try {
        const response = await fetch(`/api/beacons/${beaconId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'closed' }),
        });

        if (!response.ok) {
          throw new Error('Failed to close beacon');
        }

        // Revalidate the list
        mutate();

        return true;
      } catch (err) {
        console.error('Error closing beacon:', err);
        return false;
      }
    },
    [mutate]
  );

  // Respond to a beacon
  const respondToBeacon = useCallback(
    async (beaconId: string, responseType: BeaconResponseType): Promise<boolean> => {
      try {
        const response = await fetch(`/api/beacons/${beaconId}/respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ response_type: responseType }),
        });

        if (!response.ok) {
          throw new Error('Failed to respond to beacon');
        }

        // Revalidate the list
        mutate();

        return true;
      } catch (err) {
        console.error('Error responding to beacon:', err);
        return false;
      }
    },
    [mutate]
  );

  // Ping a beacon (Still There?)
  const pingBeacon = useCallback(
    async (beaconId: string): Promise<{ success: boolean; message?: string }> => {
      try {
        const response = await fetch(`/api/beacons/${beaconId}/ping`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok) {
          return { success: false, message: result.error };
        }

        return { success: true, message: result.message };
      } catch (err) {
        console.error('Error pinging beacon:', err);
        return { success: false, message: 'Failed to send ping' };
      }
    },
    []
  );

  // Refresh the beacons list
  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  return {
    beacons,
    isLoading,
    error,
    createBeacon,
    closeBeacon,
    respondToBeacon,
    pingBeacon,
    refresh,
  };
}

/**
 * Hook for reverse geocoding
 */
export function useReverseGeocode() {
  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<GeocodeResponse | null> => {
      try {
        const response = await fetch(
          `/api/geocode/reverse?lat=${lat}&lng=${lng}`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Geocoding failed');
        }

        return await response.json();
      } catch (err) {
        console.error('Error reverse geocoding:', err);
        return null;
      }
    },
    []
  );

  return { reverseGeocode };
}

interface SingleBeaconResponse {
  success: boolean;
  beacon: BeaconWithDetails;
}

/**
 * Hook for fetching a single beacon with details
 */
export function useBeacon(beaconId: string | null) {
  const { data, error, mutate, isLoading } = useSWR<SingleBeaconResponse>(
    beaconId ? `/api/beacons/${beaconId}` : null,
    authenticatedFetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 10000, // More frequent refresh for single beacon
    }
  );

  return {
    beacon: data?.beacon ?? null,
    isLoading,
    error,
    refresh: mutate,
  };
}
