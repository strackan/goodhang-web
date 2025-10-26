import { VHSEffects } from '@/components/VHSEffects';
import Link from 'next/link';

// This will eventually come from Supabase
const MOCK_EVENTS = [
  {
    id: 1,
    title: 'Launch Party: Raleigh Kickoff',
    date: '2025-11-15',
    time: '7:00 PM',
    location: 'The Architect (Downtown Raleigh)',
    description: 'The inaugural Good Hang event. Come meet the founding members, get your first token, and help us kick off something special.',
    isPublic: true,
    spotsAvailable: 28,
    totalSpots: 50
  },
  {
    id: 2,
    title: 'AI Upskilling Workshop: Agents & Automation',
    date: '2025-11-22',
    time: '6:00 PM',
    location: 'HQ Coffee (Raleigh)',
    description: 'Hands-on session building AI agents. Bring your laptop. We\'re leveling up together.',
    isPublic: false,
    spotsAvailable: 8,
    totalSpots: 15
  },
  {
    id: 3,
    title: 'Late Night Karaoke Chaos',
    date: '2025-12-06',
    time: '9:00 PM',
    location: 'Lucky B\'s (Glenwood South)',
    description: 'Because nothing says "professional networking" like belting out 80s power ballads at 11 PM.',
    isPublic: true,
    spotsAvailable: 15,
    totalSpots: 30
  }
];

export default function Events() {
  return (
    <>
      <VHSEffects />

      <div className="min-h-screen relative">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-neon-purple/20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="font-mono text-2xl font-bold chromatic-aberration">
              <span className="neon-purple">GOOD_HANG</span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/about" className="text-foreground hover:text-neon-cyan transition-colors font-mono">
                About
              </Link>
              <Link href="/events" className="text-neon-magenta transition-colors font-mono">
                Events
              </Link>
              <Link href="/login" className="text-neon-purple hover:text-neon-magenta transition-colors font-mono">
                Member Login
              </Link>
            </div>
          </div>
        </nav>

        {/* Content */}
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <h1 className="text-5xl md:text-6xl font-bold font-mono neon-cyan mb-4">
                UPCOMING EVENTS
              </h1>
              <p className="text-foreground-dim font-mono">
                Public events are open to prospective members. Members-only events require login.
              </p>
            </div>

            {/* Events List */}
            <div className="space-y-6">
              {MOCK_EVENTS.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* CTA for non-members */}
            <div className="mt-16 border-2 border-neon-purple/30 bg-background-lighter p-8">
              <h2 className="text-2xl font-bold font-mono neon-purple mb-3">
                Want Access to All Events?
              </h2>
              <p className="text-foreground-dim font-mono mb-6">
                Members get exclusive access to workshops, mentorship sessions, and smaller intimate gatherings.
                Plus, you get your first Favor Token.
              </p>
              <a
                href="/#join"
                className="inline-block px-8 py-3 border-2 border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-background transition-all duration-300 font-mono uppercase tracking-wider"
              >
                Apply for Membership
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-neon-purple/20 py-8 mt-20">
          <div className="container mx-auto px-6 text-center text-foreground-dim font-mono text-sm">
            <p>© 2025 Good Hang. A <a href="https://renubu.com" target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:text-neon-magenta transition-colors">Renubu</a> initiative.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  isPublic: boolean;
  spotsAvailable: number;
  totalSpots: number;
}

function EventCard({ event }: { event: Event }) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const availabilityPercent = (event.spotsAvailable / event.totalSpots) * 100;
  const availabilityColor = availabilityPercent > 50 ? 'neon-cyan' : availabilityPercent > 25 ? 'neon-magenta' : 'text-red-500';

  return (
    <div className="border-2 border-neon-purple/30 bg-background-lighter p-6 hover:border-neon-purple transition-all">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold font-mono neon-magenta">
              {event.title}
            </h3>
            {!event.isPublic && (
              <span className="px-2 py-1 text-xs font-mono border border-neon-purple text-neon-purple uppercase">
                Members Only
              </span>
            )}
          </div>

          <div className="space-y-1 text-foreground-dim font-mono text-sm">
            <p className="flex items-center gap-2">
              <span className="neon-cyan">📅</span>
              {formattedDate} · {event.time}
            </p>
            <p className="flex items-center gap-2">
              <span className="neon-magenta">📍</span>
              {event.location}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className={`font-mono text-sm ${availabilityColor}`}>
            {event.spotsAvailable} spots left
          </p>
          <p className="font-mono text-xs text-foreground-dim">
            of {event.totalSpots}
          </p>
        </div>
      </div>

      <p className="text-foreground-dim font-mono text-sm mb-4">
        {event.description}
      </p>

      <button
        className="px-6 py-2 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background transition-all duration-300 font-mono uppercase tracking-wider text-sm"
        disabled={!event.isPublic}
      >
        {event.isPublic ? 'RSVP' : 'Members Only'}
      </button>
    </div>
  );
}
