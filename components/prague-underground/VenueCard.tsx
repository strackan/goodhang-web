'use client';

import type { Venue, PragueClaim } from '@/lib/prague-underground/types';

interface VenueCardProps {
  venue: Venue;
  claim: PragueClaim | undefined;
  onClaim: (venue: Venue) => void;
}

export default function VenueCard({ venue, claim, onClaim }: VenueCardProps) {
  const badgeClass = venue.badge === 'blood'
    ? 'pu-badge-blood'
    : venue.badge === 'rare'
      ? 'pu-badge-rare'
      : '';

  return (
    <div className="pu-venue pu-fade-in" data-venue-id={venue.id} data-points={venue.points}>
      <div className="pu-venue-header">
        <h3 className="pu-venue-name">{venue.name}</h3>
        <span className={`pu-score-badge ${badgeClass}`}>{venue.points} PTS</span>
      </div>
      <p className="pu-venue-meta">
        {venue.address}
        {venue.year !== '\u2014' ? ` \u00B7 ${venue.year}` : ''}
      </p>
      <p className="pu-venue-description">{venue.description}</p>
      <div className="pu-venue-tags">
        {venue.tags.map(tag => (
          <span key={tag} className="pu-venue-tag">{tag}</span>
        ))}
      </div>
      <a href={venue.url} target="_blank" rel="noopener noreferrer" className="pu-venue-link">
        Read more &rarr;
      </a>

      {claim ? (
        <div className="pu-venue-claimed">
          <span className="pu-claimed-check">{'\u2726'}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={claim.photo_url}
            alt={`Claim photo for ${venue.name}`}
            className="pu-claimed-thumb"
          />
          <div className="pu-claimed-info">
            <span className="pu-claimed-label">Claimed &middot; +{claim.points_awarded} pts</span>
            {claim.notes ? <p className="pu-claimed-notes">{claim.notes}</p> : null}
          </div>
        </div>
      ) : (
        <button
          className="pu-claim-btn"
          onClick={() => onClaim(venue)}
        >
          Claim &middot; {venue.points} pts
        </button>
      )}
    </div>
  );
}
