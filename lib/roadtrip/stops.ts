import { PlannedStop } from '@/types/roadtrip';

export const PLANNED_STOPS: PlannedStop[] = [
  { id: 'raleigh', name: 'Raleigh-Durham, NC', lat: 35.7796, lng: -78.6382, isHome: true },
  { id: 'dc', name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
  { id: 'nyc', name: 'New York City', lat: 40.7128, lng: -74.0060, isHighlight: true, note: 'NYE' },
  { id: 'pittsburgh', name: 'Pittsburgh, PA', lat: 40.4406, lng: -79.9959 },
  { id: 'cleveland', name: 'Cleveland, OH', lat: 41.4993, lng: -81.6944 },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, isHighlight: true },
  { id: 'nashville', name: 'Nashville, TN', lat: 36.1627, lng: -86.7816 },
  { id: 'dallas', name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 },
  { id: 'austin', name: 'Austin, TX', lat: 30.2672, lng: -97.7431, isHighlight: true },
  { id: 'houston', name: 'Houston, TX', lat: 29.7604, lng: -95.3698 },
  { id: 'nola', name: 'New Orleans, LA', lat: 29.9511, lng: -90.0715 },
  { id: 'atlanta', name: 'Atlanta, GA', lat: 33.7490, lng: -84.3880 },
  { id: 'raleigh-return', name: 'Raleigh-Durham, NC', lat: 35.7796, lng: -78.6382, isHome: true },
];

export const ROUTE_PATH: [number, number][] = PLANNED_STOPS.map(stop => [stop.lat, stop.lng]);

// Map center (roughly center of the US for this route)
export const MAP_CENTER: [number, number] = [37.5, -85.5];
export const MAP_ZOOM = 5;
