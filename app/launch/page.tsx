'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { GlitchIntroV2 } from '@/components/GlitchIntroV2';

export default function LaunchPartyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [plusOnes, setPlusOnes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rsvpCount, setRsvpCount] = useState<number>(0);
  const [showIntro, setShowIntro] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hardcoded launch event ID - created via migration 002_launch_event.sql
  const LAUNCH_EVENT_ID = '00000000-0000-0000-0000-000000000001';

  useEffect(() => {
    setIsMounted(true);

    // Check if user has seen the glitch intro before
    const hasSeenGlitch = typeof window !== 'undefined' &&
      (localStorage.getItem('goodhang_seen_glitch') || sessionStorage.getItem('goodhang_session'));

    if (!hasSeenGlitch) {
      setShowIntro(true);
    }

    fetchRSVPCount();
  }, []);

  const fetchRSVPCount = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('rsvps')
        .select('plus_ones')
        .eq('event_id', LAUNCH_EVENT_ID);

      if (!error && data) {
        const total = data.reduce((acc, rsvp) => acc + 1 + (rsvp.plus_ones || 0), 0);
        setRsvpCount(total);
      }
    } catch (err) {
      console.error('Failed to fetch RSVP count:', err);
      // Silently fail - the count is not critical for the form to work
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rsvpError } = await supabase
        .from('rsvps')
        .insert({
          event_id: LAUNCH_EVENT_ID,
          guest_name: name,
          guest_email: email,
          plus_ones: plusOnes,
        });

      if (rsvpError) {
        setError(rsvpError.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
        fetchRSVPCount();

        // Reset form
        setName('');
        setEmail('');
        setPlusOnes(0);
      }
    } catch (err: any) {
      console.error('Failed to submit RSVP:', err);
      setError(err.message || 'Failed to submit RSVP. Please try again.');
      setLoading(false);
    }
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Show loading state until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  // Show glitch intro if first visit
  if (showIntro) {
    return <GlitchIntroV2 onComplete={handleIntroComplete} />;
  }

  return (
    <div className="min-h-screen scroll-smooth">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-neon-purple/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-mono text-2xl font-bold">
            <span className="neon-purple">GOOD_HANG</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-foreground hover:text-neon-cyan transition-colors font-mono">
              Home
            </Link>
            <Link href="/apply" className="text-neon-purple hover:text-neon-magenta transition-colors font-mono">
              Apply
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          {/* Event Title */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold font-mono leading-tight mb-6">
              <span className="neon-cyan block">GOOD HANG</span>
              <span className="neon-magenta block text-3xl md:text-4xl mt-2">LAUNCH PARTY</span>
            </h1>
            <p className="text-xl text-foreground-dim font-mono max-w-2xl mx-auto">
              Join us for the inaugural Good Hang event —
              <span className="text-neon-purple"> a Renubu Launch Party</span>
            </p>
          </div>

          {/* RSVP Button */}
          <div className="text-center mb-8">
            <a
              href="#rsvp-form"
              className="inline-block px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,221,0.5)]"
            >
              RSVP Now
            </a>
          </div>

          {/* Event Details */}
          <div className="border-2 border-neon-cyan/30 bg-background-lighter p-8 md:p-12 mb-8">
            <div className="space-y-6 font-mono">
              <div>
                <span className="text-neon-cyan uppercase text-sm tracking-wider">When</span>
                <p className="text-foreground text-lg mt-1">
                  Thursday, November 13, 2025
                </p>
                <p className="text-foreground-dim mt-1">
                  6:00 PM - 8:00 PM EST
                </p>
              </div>

              <div>
                <span className="text-neon-cyan uppercase text-sm tracking-wider">Where</span>
                <p className="text-foreground text-lg mt-1">
                  Raleigh-Durham, NC
                </p>
                <p className="text-foreground-dim text-sm mt-1">
                  (Exact venue TBD - will be sent to RSVPs)
                </p>
              </div>

              <div>
                <span className="text-neon-cyan uppercase text-sm tracking-wider">What to Expect</span>
                <ul className="text-foreground-dim mt-2 space-y-2">
                  <li>→ Meet the founding members of Good Hang</li>
                  <li>→ Celebrate the launch of Renubu</li>
                  <li>→ Drinks, conversations, and connections</li>
                  <li>→ The faint whisper of danger</li>
                  <li>→ Learn about upcoming events and opportunities</li>
                </ul>
              </div>
            </div>
          </div>

          {/* RSVP Count - Only show when >= 10 */}
          {rsvpCount >= 10 && (
            <div className="text-center mb-8">
              <p className="text-foreground-dim font-mono">
                <span className="text-neon-purple text-3xl font-bold">{rsvpCount}</span>
                <span className="text-foreground-dim ml-2">people are coming</span>
              </p>
            </div>
          )}

          {/* RSVP Form */}
          {!success ? (
            <div id="rsvp-form" className="border-2 border-neon-purple/30 bg-background-lighter p-8 md:p-12 scroll-mt-24">
              <h2 className="text-3xl font-bold font-mono neon-purple mb-4">
                RSVP NOW
              </h2>
              <p className="text-foreground-dim mb-8 font-mono">
                Reserve your spot. We'll send event updates and reminders.
              </p>

              {error && (
                <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-mono text-foreground mb-2">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border-2 border-neon-cyan/30 text-foreground font-mono focus:border-neon-cyan focus:outline-none transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-mono text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-background border-2 border-neon-cyan/30 text-foreground font-mono focus:border-neon-cyan focus:outline-none transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="plusOnes" className="block text-sm font-mono text-foreground mb-2">
                    Plus Ones
                  </label>
                  <select
                    id="plusOnes"
                    value={plusOnes}
                    onChange={(e) => setPlusOnes(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-background border-2 border-neon-cyan/30 text-foreground font-mono focus:border-neon-cyan focus:outline-none transition-colors"
                  >
                    <option value="0">Just me</option>
                    <option value="1">+1</option>
                    <option value="2">+2</option>
                    <option value="3">+3</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,221,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Count Me In'}
                </button>
              </form>
            </div>
          ) : (
            <div className="border-2 border-neon-cyan/30 bg-background-lighter p-8 md:p-12 text-center">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold font-mono neon-cyan mb-4">
                YOU'RE ON THE LIST!
              </h2>
              <p className="text-foreground-dim font-mono mb-8">
                We'll send you event details and reminders at <span className="text-neon-purple">{email}</span>
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,221,0.5)]"
              >
                Return to Homepage
              </Link>
            </div>
          )}

          {/* Footer Note */}
          <div className="mt-12 text-center">
            <p className="text-foreground-dim font-mono text-sm">
              Questions? Email us at{' '}
              <a href="mailto:hello@goodhang.club" className="text-neon-cyan hover:text-neon-magenta transition-colors">
                hello@goodhang.club
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
