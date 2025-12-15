'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { PlannedStop } from '@/types/roadtrip';

interface StopMarkerProps {
  stop: PlannedStop;
  onClick: (stop: PlannedStop) => void;
  interestCount?: number | undefined;
}

// Create custom pushpin icons
const createPushpinIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-pushpin',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 12}px;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: ${size}px;
          height: ${size}px;
          background: radial-gradient(circle at 30% 30%, ${color} 0%, ${adjustColor(color, -30)} 70%);
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2);
        "></div>
        <div style="
          position: absolute;
          top: ${size - 4}px;
          left: 50%;
          transform: translateX(-50%);
          width: 3px;
          height: 12px;
          background: linear-gradient(to bottom, #888 0%, #666 100%);
          border-radius: 0 0 2px 2px;
        "></div>
      </div>
    `,
    iconSize: [size, size + 12],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -size - 8],
  });
};

// Helper to darken/lighten colors
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Different pin colors for different stop types
const getPinColor = (stop: PlannedStop): string => {
  if (stop.isHome) return '#2D5A4A'; // Forest green for home
  if (stop.isHighlight) return '#C41E3A'; // Red for highlights
  return '#D4A84B'; // Mustard for regular stops
};

const getPinSize = (stop: PlannedStop): number => {
  if (stop.isHighlight) return 28;
  if (stop.isHome) return 26;
  return 22;
};

export default function StopMarker({ stop, onClick, interestCount }: StopMarkerProps) {
  const color = getPinColor(stop);
  const size = getPinSize(stop);
  const icon = createPushpinIcon(color, size);

  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={icon}
      eventHandlers={{
        click: () => onClick(stop),
      }}
    >
      <Popup>
        <div className="text-center min-w-[120px]">
          <h3 className="rt-heading-elegant font-bold text-[var(--rt-navy)] text-lg mb-1">
            {stop.name}
          </h3>
          {stop.note && (
            <span className="rt-stamp text-xs mb-2 inline-block">{stop.note}</span>
          )}
          {interestCount && interestCount > 0 && (
            <p className="text-sm text-[var(--rt-cork-dark)] mt-1">
              {interestCount} {interestCount === 1 ? 'person' : 'people'} interested
            </p>
          )}
          <button
            onClick={() => onClick(stop)}
            className="mt-2 text-sm text-[var(--rt-forest)] hover:text-[var(--rt-rust)] underline rt-typewriter"
          >
            Let&apos;s connect here
          </button>
        </div>
      </Popup>
    </Marker>
  );
}
