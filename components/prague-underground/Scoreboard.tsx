'use client';

import { getTierForPoints, getNextTier } from '@/lib/prague-underground/tiers';
import { VENUES } from '@/lib/prague-underground/venues';

interface ScoreboardProps {
  totalPoints: number;
  claimedCount: number;
}

export default function Scoreboard({ totalPoints, claimedCount }: ScoreboardProps) {
  const tier = getTierForPoints(totalPoints);
  const nextTier = getNextTier(totalPoints);

  const progressPercent = nextTier
    ? Math.min(100, ((totalPoints - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div className="pu-scoreboard">
      <p className="pu-scoreboard-tier">{tier.name}</p>
      <p className="pu-scoreboard-points">
        {totalPoints}
        <span className="pu-scoreboard-pts-label">PTS</span>
      </p>

      {nextTier ? (
        <div className="pu-scoreboard-progress">
          <div className="pu-scoreboard-bar-bg">
            <div
              className="pu-scoreboard-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="pu-scoreboard-next">
            {nextTier.min - totalPoints} pts to {nextTier.name}
          </p>
        </div>
      ) : null}

      <p className="pu-scoreboard-claimed">
        {claimedCount} / {VENUES.length} venues
      </p>
    </div>
  );
}
