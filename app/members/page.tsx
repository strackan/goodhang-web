import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function MembersPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-sm border-b border-neon-purple/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="font-mono text-2xl font-bold glitch-hover">
            <span className="neon-purple">GOOD_HANG</span>
          </Link>
          <div className="flex gap-6 items-center">
            <Link href="/members" className="text-neon-cyan hover:text-neon-magenta transition-colors font-mono">
              Directory
            </Link>
            <Link href="/events" className="text-foreground hover:text-neon-cyan transition-colors font-mono">
              Events
            </Link>
            {profile?.user_role === 'admin' && (
              <Link href="/admin" className="text-neon-purple hover:text-neon-magenta transition-colors font-mono">
                Admin
              </Link>
            )}
            <form action="/logout" method="POST">
              <button className="text-foreground-dim hover:text-neon-cyan transition-colors font-mono text-sm">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold font-mono neon-cyan mb-4">
            Welcome, {profile?.name || user.email}
          </h1>

          {!profile && (
            <div className="border-2 border-neon-purple/30 bg-background-lighter p-8 mb-8">
              <h2 className="text-2xl font-bold font-mono neon-purple mb-4">
                Complete Your Profile
              </h2>
              <p className="text-foreground-dim mb-4 font-mono">
                You need to complete your profile before accessing member features.
              </p>
              <Link
                href="/onboarding"
                className="inline-block px-8 py-3 border-2 border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-background font-mono uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,204,221,0.5)]"
              >
                Complete Profile
              </Link>
            </div>
          )}

          {profile && (
            <>
              {/* Profile Info */}
              <div className="border-2 border-neon-cyan/30 bg-background-lighter p-6 mb-8">
                <div className="flex items-start gap-6">
                  <div className="flex-1">
                    <p className="text-foreground-dim font-mono mb-2">
                      <span className="text-neon-cyan">Email:</span> {profile.email}
                    </p>
                    <p className="text-foreground-dim font-mono mb-2">
                      <span className="text-neon-cyan">Membership:</span>{' '}
                      <span className={profile.membership_tier === 'core' ? 'text-neon-purple' : 'text-neon-magenta'}>
                        {profile.membership_tier.toUpperCase()}
                      </span>
                    </p>
                    {profile.bio && (
                      <p className="text-foreground-dim font-mono mt-4">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <Link
                    href="/members/profile/edit"
                    className="px-4 py-2 border border-neon-purple/50 text-neon-purple hover:bg-neon-purple hover:text-background font-mono text-sm transition-colors"
                  >
                    Edit Profile
                  </Link>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  href="/members/directory"
                  className="border-2 border-neon-cyan/30 hover:border-neon-cyan bg-background-lighter p-6 transition-all duration-300 hover:scale-105"
                >
                  <h3 className="text-xl font-bold font-mono neon-cyan mb-2">
                    Member Directory
                  </h3>
                  <p className="text-foreground-dim font-mono text-sm">
                    Browse and connect with other members
                  </p>
                </Link>

                <Link
                  href="/events"
                  className="border-2 border-neon-magenta/30 hover:border-neon-magenta bg-background-lighter p-6 transition-all duration-300 hover:scale-105"
                >
                  <h3 className="text-xl font-bold font-mono neon-magenta mb-2">
                    Upcoming Events
                  </h3>
                  <p className="text-foreground-dim font-mono text-sm">
                    See what's happening and RSVP
                  </p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
