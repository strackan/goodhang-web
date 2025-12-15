import { PlannedStop } from '@/types/roadtrip';

export const PLANNED_STOPS: PlannedStop[] = [
  { id: 'raleigh', name: 'Raleigh-Durham, NC', lat: 35.7796, lng: -78.6382, isHome: true },
  { id: 'louisville', name: 'Louisville, KY', lat: 38.2527, lng: -85.7585 },
  { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, isHighlight: true, note: 'NYE' },
  { id: 'indianapolis', name: 'Indianapolis, IN', lat: 39.7684, lng: -86.1581 },
  { id: 'grandrapids', name: 'Grand Rapids, MI', lat: 42.9634, lng: -85.6681 },
  { id: 'cleveland', name: 'Cleveland, OH', lat: 41.4993, lng: -81.6944 },
  { id: 'pittsburgh', name: 'Pittsburgh, PA', lat: 40.4406, lng: -79.9959 },
  { id: 'dc', name: 'Washington, DC', lat: 38.9072, lng: -77.0369 },
  { id: 'wilmington', name: 'Wilmington, NC', lat: 34.2257, lng: -77.9447 },
  { id: 'charlotte', name: 'Charlotte, NC', lat: 35.2271, lng: -80.8431 },
  { id: 'asheville', name: 'Asheville, NC', lat: 35.5951, lng: -82.5515 },
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
