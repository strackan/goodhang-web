'use client';

import { Polyline } from 'react-leaflet';
import { ROUTE_PATH } from '@/lib/roadtrip/stops';

interface RouteVectorProps {
  animated?: boolean;
}

export default function RouteVector({ animated = false }: RouteVectorProps) {
  return (
    <>
      {/* Shadow/outline layer */}
      <Polyline
        positions={ROUTE_PATH}
        pathOptions={{
          color: '#8B7355',
          weight: 6,
          opacity: 0.4,
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
      {/* Main route line - dashed to look hand-drawn */}
      <Polyline
        positions={ROUTE_PATH}
        pathOptions={{
          color: '#B85C38',
          weight: 3,
          opacity: 0.9,
          dashArray: animated ? '10, 5' : '8, 4',
          lineCap: 'round',
          lineJoin: 'round',
        }}
      />
    </>
  );
}
