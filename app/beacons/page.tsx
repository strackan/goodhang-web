import { BeaconList, BeaconFAB } from '@/components/beacon';
import { MobileNav } from '@/components/MobileNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const navLinks = [
  { href: '/members', label: 'Dashboard' },
  { href: '/members/directory', label: 'Directory' },
  { href: '/events', label: 'Events' },
  { href: '/beacons', label: 'Beacons' },
];

export const metadata = {
  title: 'Happy Hour Beacon | Good Hang',
  description: 'See who\'s out and about. Broadcast your location to connect with other members.',
};

export default async function BeaconsPage() {
  // Check authentication
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Check if user has an active beacon
  const { data: activeBeacon } = await supabase
    .from('beacons')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <MobileNav links={navLinks} />

      {/* Main content */}
      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-neon-cyan mb-2">
            Happy Hour Beacon
          </h1>
          <p className="text-foreground-dim font-mono">
            See who&apos;s out. Broadcast where you are. Connect spontaneously.
          </p>
        </div>

        {/* Beacon List */}
        <BeaconListWrapper />
      </main>

      {/* Floating Action Button */}
      <BeaconFABWrapper hasActiveBeacon={!!activeBeacon} />
    </div>
  );
}

// Client wrapper for BeaconList (needs client-side hooks)
function BeaconListWrapper() {
  return <BeaconList />;
}

// Client wrapper for BeaconFAB
function BeaconFABWrapper({ hasActiveBeacon }: { hasActiveBeacon: boolean }) {
  return <BeaconFAB hasActiveBeacon={hasActiveBeacon} />;
}
