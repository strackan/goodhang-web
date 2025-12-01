'use client';

import { useCallback, useState } from 'react';

export interface GeolocationCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface UseGeolocationReturn {
  coords: GeolocationCoords | null;
  error: string | null;
  loading: boolean;
  permissionDenied: boolean;
  requestLocation: () => Promise<GeolocationCoords | null>;
}

/**
 * Hook for browser geolocation with error handling
 */
export function useGeolocation(): UseGeolocationReturn {
  const [coords, setCoords] = useState<GeolocationCoords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<GeolocationCoords | null> => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords: GeolocationCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setCoords(newCoords);
          setLoading(false);
          setPermissionDenied(false);
          resolve(newCoords);
        },
        (error) => {
          setLoading(false);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setError('Location permission denied. Please enable location access in your browser settings.');
              setPermissionDenied(true);
              break;
            case error.POSITION_UNAVAILABLE:
              setError('Location information is unavailable. Please try again.');
              break;
            case error.TIMEOUT:
              setError('Location request timed out. Please try again.');
              break;
            default:
              setError('An unknown error occurred while getting your location.');
          }
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // Cache for 1 minute
        }
      );
    });
  }, []);

  return {
    coords,
    error,
    loading,
    permissionDenied,
    requestLocation,
  };
}
