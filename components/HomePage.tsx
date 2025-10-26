'use client';

import { NeonButton } from '@/components/NeonButton';
import Link from 'next/link';

interface HomePageProps {
  onRewatchIntro?: () => void;
}

export function HomePage({ onRewatchIntro }: HomePageProps) {
  return (
    <>

      <div className="min-h-screen relative">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-neon-purple/20">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link href="/" className="font-mono text-2xl font-bold glitch-hover">
              <span className="neon-purple">GOOD_HANG</span>
            </Link>
            <div className="flex gap-6 items-center">
              <Link href="/about" className="text-foreground hover:text-neon-cyan transition-colors font-mono glitch-text">
                About
              </Link>
              <Link href="/events" className="text-foreground hover:text-neon-magenta transition-colors font-mono glitch-text">
                Events
              </Link>
              <Link href="/login" className="text-neon-purple hover:text-neon-magenta transition-colors font-mono glitch-text">
                Member Login
              </Link>
              {onRewatchIntro && (
                <button
                  onClick={onRewatchIntro}
                  className="text-foreground-dim hover:text-neon-cyan transition-colors font-mono text-sm opacity-50 hover:opacity-100 glitch-text"
                  title="Rewatch the glitch intro"
                >
                  ↻ Rewatch
                </button>
              )}
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="container mx-auto px-6 pt-32 pb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-bold font-mono leading-tight">
              <span className="neon-cyan block hero-glitch" data-text="FULLY ALIVE.">FULLY ALIVE.</span>
              <span className="neon-magenta block hero-glitch" data-text="WELL CONNECTED." style={{ animationDelay: '2s' }}>WELL CONNECTED.</span>
              <span className="neon-purple block hero-glitch" data-text="UNSTOPPABLE." style={{ animationDelay: '4s' }}>UNSTOPPABLE.</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-foreground-dim font-mono max-w-2xl mx-auto">
              An exclusive social club for tech professionals who want more than networking—
              <span className="text-neon-purple">they want adventure</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <NeonButton variant="purple" href="#join">
                Apply for Membership
              </NeonButton>
              <NeonButton variant="cyan" href="/events">
                View Events
              </NeonButton>
            </div>

            {/* Social Proof / Tagline */}
            <div className="pt-16">
              <p className="text-foreground-dim font-mono text-sm uppercase tracking-widest">
                Raleigh · Est. 2025 · Expanding Soon
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-32">
            <FeatureCard
              title="Real Fun"
              description="Memorable events that you'll actually want to attend. We keep it rowdy, social, and genuinely enjoyable."
              color="cyan"
            />
            <FeatureCard
              title="Spontaneous Hangs"
              description="Drop a beacon at your favorite spot. See who's around. Make it happen. No awkward planning required."
              color="magenta"
            />
            <FeatureCard
              title="Level Up Together"
              description="AI upskilling, mentorship, accountability groups. Push each other forward in this era of rapid change."
              color="purple"
            />
          </div>

          {/* Email Signup Section */}
          <div id="join" className="max-w-2xl mx-auto pt-32 pb-20">
            <div className="border-2 border-neon-purple/30 bg-background-lighter p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold font-mono neon-purple mb-4">
                JOIN THE CLUB
              </h2>
              <p className="text-foreground-dim mb-8 font-mono">
                Get on the list. We&apos;re building something different. No spam, just updates about events and membership.
              </p>
              <form className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 bg-background border-2 border-neon-cyan/30 text-foreground font-mono focus:border-neon-cyan focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-neon-purple/20 py-8">
          <div className="container mx-auto px-6 text-center text-foreground-dim font-mono text-sm">
            <p>© 2025 Good Hang. A <a href="https://renubu.com" target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:text-neon-magenta transition-colors">Renubu</a> initiative.</p>
          </div>
        </footer>
      </div>
    </>
  );
}

function FeatureCard({
  title,
  description,
  color
}: {
  title: string;
  description: string;
  color: 'cyan' | 'magenta' | 'purple';
}) {
  const colorClasses = {
    cyan: 'border-neon-cyan/30 hover:border-neon-cyan',
    magenta: 'border-neon-magenta/30 hover:border-neon-magenta',
    purple: 'border-neon-purple/30 hover:border-neon-purple'
  };

  const titleClasses = {
    cyan: 'neon-cyan',
    magenta: 'neon-magenta',
    purple: 'neon-purple'
  };

  return (
    <div className={`border-2 ${colorClasses[color]} bg-background-lighter p-6 transition-all duration-300 hover:scale-105`}>
      <h3 className={`text-xl font-bold font-mono mb-3 ${titleClasses[color]}`}>
        {title}
      </h3>
      <p className="text-foreground-dim font-mono text-sm">
        {description}
      </p>
    </div>
  );
}
