'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PragueUser, PragueClaim, Venue } from '@/lib/prague-underground/types';
import { getVenuesByPart } from '@/lib/prague-underground/venues';
import { TIERS, BONUS_MULTIPLIERS, SECRET_ACHIEVEMENTS } from '@/lib/prague-underground/tiers';
import PasskeyGate from '@/components/prague-underground/PasskeyGate';
import VenueCard from '@/components/prague-underground/VenueCard';
import ClaimModal from '@/components/prague-underground/ClaimModal';
import Scoreboard from '@/components/prague-underground/Scoreboard';

const SESSION_KEY = 'pu-slug';

export default function PragueUndergroundPage() {
  const [user, setUser] = useState<PragueUser | null>(null);
  const [claims, setClaims] = useState<PragueClaim[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [claimingVenue, setClaimingVenue] = useState<Venue | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedRef = useRef<WeakSet<Element>>(new WeakSet());

  // Check sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      authenticate(stored);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create a single persistent IntersectionObserver
  useEffect(() => {
    if (!authenticated) return;

    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('pu-visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1 }
    );
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [authenticated]);

  // Scan for new .pu-fade-in elements whenever content changes
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = observerRef.current;

    const scan = () => {
      const els = document.querySelectorAll('#prague-underground .pu-fade-in');
      els.forEach(el => {
        if (!observedRef.current.has(el)) {
          observedRef.current.add(el);
          observer.observe(el);
        }
      });
    };

    // Scan immediately and again after a tick for late renders
    scan();
    const timer = setTimeout(scan, 150);
    return () => clearTimeout(timer);
  }, [authenticated, claims]);

  const authenticate = useCallback(async (slug: string) => {
    setLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/prague-underground/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error ?? 'Failed to authenticate');
        setLoading(false);
        return;
      }

      setUser(data.user);
      setClaims(data.claims);
      setAuthenticated(true);
      sessionStorage.setItem(SESSION_KEY, slug);
    } catch {
      setAuthError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClaimed = useCallback(async () => {
    // Refetch user + claims after a new claim
    const slug = sessionStorage.getItem(SESSION_KEY);
    if (!slug) return;

    try {
      const res = await fetch('/api/prague-underground/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setClaims(data.claims);
      }
    } catch {
      // Silently fail — data will refresh on next page load
    }

    setClaimingVenue(null);
  }, []);

  const getClaimForVenue = useCallback((venueId: string): PragueClaim | undefined => {
    return claims.find(c => c.venue_id === venueId);
  }, [claims]);

  // --- Render ---

  if (loading && !authenticated) {
    return (
      <div id="prague-underground">
        <div className="pu-gate">
          <div className="pu-gate-content">
            <h1>BENEATH <em>Prague</em></h1>
            <p className="pu-gate-subtitle">Loading&hellip;</p>
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div id="prague-underground">
        <PasskeyGate
          onAuthenticated={authenticate}
          loading={loading}
          error={authError}
        />
      </div>
    );
  }

  const part1 = getVenuesByPart(1);
  const part2 = getVenuesByPart(2);
  const part3 = getVenuesByPart(3);
  const part4 = getVenuesByPart(4);
  const part5 = getVenuesByPart(5);
  const part6 = getVenuesByPart(6);
  const part7 = getVenuesByPart(7);
  const part8 = getVenuesByPart(8);

  return (
    <div id="prague-underground">
      <main className="pu-content">
      {/* === HERO === */}
      <header className="pu-hero">
        <div className="pu-fade-in">
          <h1>BENEATH <em>Prague</em></h1>
        </div>
        <div className="pu-fade-in">
          <p className="pu-hero-subtitle">
            A guide to the buried city &mdash; its labyrinths, its cellars, its caverns, and its secrets
          </p>
        </div>
        <div className="pu-fade-in">
          <p className="pu-ornament">&lowast; &lowast; &lowast;</p>
        </div>
      </header>

      {/* === CONTEXT PARAGRAPH === */}
      <p className="pu-context pu-fade-in">
        In the thirteenth century, the Vltava kept flooding Prague. So the city did what seemed
        reasonable at the time: they raised the entire street level by four metres, burying the
        ground floors of every building alive. Living rooms became cellars. Taverns became crypts.
        An entire layer of the city was sealed beneath the new one, and seven hundred years later,
        you can still drink in it.
      </p>

      {/* === DIVIDER: Descend === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Descend</span>
      </div>

      {/* === PART I: THE LABYRINTHS === */}
      <PartHeader
        numeral="Part I"
        title="THE LABYRINTHS"
        subtitle="Bars where the architecture defies explanation and you will lose people in your group"
      />
      {part1.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === LORE INTERLUDE 1 === */}
      <div className="pu-lore pu-fade-in">
        <p>
          The House of the Two Golden Bears supposedly possesses a labyrinth of chambers and cellars,
          some of which connect to surrounding buildings. Legend holds that secret tunnels once used
          by Prague&rsquo;s criminal fraternity lead from its basement to the Church of Our Lady
          Before T&yacute;n and the Old Town Hall.
        </p>
      </div>

      {/* === PART II: THE VAULTS === */}
      <PartHeader
        numeral="Part II"
        title="THE VAULTS"
        subtitle="Cellars with singular purpose &mdash; older than the buildings above them"
      />
      {part2.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === DIVIDER: Deeper === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Deeper</span>
      </div>

      {/* === PART III: THE HIDDEN === */}
      <PartHeader
        numeral="Part III"
        title="THE HIDDEN"
        subtitle="You have to know how to get in"
      />
      {part3.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === LORE INTERLUDE 2 === */}
      <div className="pu-lore pu-fade-in">
        <p>
          During the Nazi occupation, playing and listening to jazz in clandestine underground clubs
          was one of the ways locals resisted the occupiers, who had restricted the genre. The tradition
          of the underground as a space of defiance never left Prague.
        </p>
      </div>

      {/* === PART IV: THE CAVERNS === */}
      <PartHeader
        numeral="Part IV"
        title="THE CAVERNS"
        subtitle="Beyond the city &mdash; into the earth itself"
      />
      {part4.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === DIVIDER: Surface === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Surface</span>
      </div>

      {/* === PART V: THE UNDERWORLD === */}
      <PartHeader
        numeral="Part V"
        title="THE UNDERWORLD"
        subtitle="The counter-culture that lives beneath the surface in every sense"
      />
      {part5.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === LORE INTERLUDE 3 === */}
      <div className="pu-lore pu-fade-in">
        <p>
          The Old Town Hall&rsquo;s underground &mdash; a labyrinth of Romanesque and Gothic halls,
          corridors, and tunnels older than the building above it &mdash; is the largest system of its
          kind in Prague. It contains the original twelfth-century street. Beneath the cobblestones
          you walk on, there is another city entirely.
        </p>
      </div>

      {/* === PART VI: THE WILD === */}
      <PartHeader
        numeral="Part VI"
        title="THE WILD"
        subtitle="Adventures above ground that carry the spirit of the underground"
      />
      {part6.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === DIVIDER: Silence === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Silence</span>
      </div>

      {/* === PART VII: THE BONES === */}
      <PartHeader
        numeral="Part VII"
        title="THE BONES"
        subtitle="Where the dead were arranged into art and then forgotten"
      />
      {part7.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === LORE INTERLUDE 4 === */}
      <div className="pu-lore pu-fade-in">
        <p>
          In 1870, Franti&scaron;ek Rint signed his work at Sedlec in his medium of choice: human bone.
          His name is still on the wall. He also bleached every skeleton in the ossuary to give the
          room a uniform aesthetic. He was a woodcarver by trade. The bones were just another material.
        </p>
      </div>

      {/* === DIVIDER: Erasure === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Erasure</span>
      </div>

      {/* === PART VIII: THE ERASED === */}
      <PartHeader
        numeral="Part VIII"
        title="THE ERASED"
        subtitle="Places that were meant to disappear &mdash; and the ones that refused"
      />
      {part8.map(v => (
        <VenueCard key={v.id} venue={v} claim={getClaimForVenue(v.id)} onClaim={setClaimingVenue} />
      ))}

      {/* === LORE INTERLUDE 5 === */}
      <div className="pu-lore pu-fade-in">
        <p>
          An artist named David &Ccaron;ern&yacute; once painted a Soviet tank memorial bright pink.
          He was briefly arrested. Later, he installed ten giant bronze babies with barcodes for faces
          crawling up the &Zcaron;i&zcaron;kov Television Tower. He also hung a statue of Sigmund Freud
          by one hand from a rooftop &mdash; passersby think it is a man about to jump. And he built two
          bronze men urinating into a pool shaped like the Czech Republic, their streams spelling out text
          messages submitted by the public. The Czech Republic is not a serious country. It is something better.
        </p>
      </div>

      {/* === DIVIDER: Reckon === */}
      <div className="pu-divider pu-fade-in">
        <span className="pu-divider-word">Reckon</span>
      </div>

      {/* === THE RECKONING === */}
      <section className="pu-reckoning">
        <div className="pu-part-header pu-fade-in">
          <p className="pu-part-numeral">The Reckoning</p>
          <h2 className="pu-part-title">SCORING</h2>
        </div>

        <div className="pu-rubric pu-fade-in">
          <p className="pu-rubric-title">Point Values</p>
          <p className="pu-rubric-item"><strong>5 pts</strong> &mdash; You went underground and had a beer</p>
          <p className="pu-rubric-item"><strong>10 pts</strong> &mdash; You got properly lost or found something hidden</p>
          <p className="pu-rubric-item"><strong>15 pts</strong> &mdash; You reached something outside normal tourist gravity</p>
          <p className="pu-rubric-item"><strong>20 pts</strong> &mdash; Real effort required &mdash; day trips, emotional weight</p>
          <p className="pu-rubric-item"><strong>25 pts</strong> &mdash; Rare. Almost nobody goes here.</p>
          <p className="pu-rubric-item"><strong>30 pts</strong> &mdash; You surfed a river in a landlocked country or found a sealed ossuary</p>
          <p className="pu-rubric-item"><strong>40 pts</strong> &mdash; You drove into the mountains and found a village that no longer exists</p>
        </div>

        <div className="pu-rubric pu-fade-in">
          <p className="pu-rubric-title">Bonus Multipliers</p>
          {BONUS_MULTIPLIERS.map(b => (
            <p key={b.description} className="pu-rubric-item">
              <strong>&times;{b.multiplier}</strong> &mdash; {b.description}
            </p>
          ))}
        </div>

        <div className="pu-rubric pu-fade-in">
          <p className="pu-rubric-title">Secret Achievements</p>
          {SECRET_ACHIEVEMENTS.map(a => (
            <p key={a.name} className="pu-rubric-item">
              <strong>{a.name}</strong> (+{a.points} pts) &mdash; {a.description}
            </p>
          ))}
        </div>

        <div className="pu-fade-in">
          <p className="pu-rubric-title" style={{ textAlign: 'center', marginTop: '3rem' }}>Tiers</p>
          {TIERS.map(t => (
            <div key={t.name} className="pu-tier">
              <p className="pu-tier-name">{t.name}</p>
              <p className="pu-tier-range">
                {t.max === Infinity ? `${t.min}+ PTS` : `${t.min}\u2013${t.max} PTS`}
              </p>
              <p className="pu-tier-reward">{t.reward}</p>
            </div>
          ))}
        </div>

        <p className="pu-fade-in" style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5, fontStyle: 'italic' }}>
          Maximum possible score: 715 pts
        </p>

        <p className="pu-fade-in" style={{ textAlign: 'center', marginTop: '1rem', opacity: 0.4, fontSize: '0.9rem', fontStyle: 'italic' }}>
          Points are tallied at the end of the trip over a final drink in a cellar that is older than both
          of you combined. Disputes are settled by the bartender. The bartender&rsquo;s word is final.
          If no bartender is available, the nearest skull will suffice.
        </p>
      </section>

      {/* === FOOTER === */}
      <footer className="pu-footer pu-fade-in">
        <p>There is another city beneath the one you see. You only have to descend.</p>
      </footer>
      </main>

      {/* === SCOREBOARD === */}
      <Scoreboard
        totalPoints={user?.total_points ?? 0}
        claimedCount={claims.length}
      />

      {/* === CLAIM MODAL === */}
      {claimingVenue && user ? (
        <ClaimModal
          venue={claimingVenue}
          userId={user.id}
          onClose={() => setClaimingVenue(null)}
          onClaimed={handleClaimed}
        />
      ) : null}
    </div>
  );
}

// --- Helper Component ---

function PartHeader({ numeral, title, subtitle }: { numeral: string; title: string; subtitle: string }) {
  return (
    <div className="pu-part-header pu-fade-in">
      <p className="pu-part-numeral">{numeral}</p>
      <h2 className="pu-part-title">{title}</h2>
      <p className="pu-part-subtitle">{subtitle}</p>
    </div>
  );
}
