import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/beacons/[id]/ping
 * Send a "Still There?" ping to the beacon owner
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: beaconId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check beacon exists and is active
    const { data: beacon, error: beaconError } = await supabase
      .from('beacons')
      .select('id, status, user_id')
      .eq('id', beaconId)
      .single();

    if (beaconError || !beacon) {
      return NextResponse.json(
        { error: 'Beacon not found' },
        { status: 404 }
      );
    }

    if (beacon.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot ping a closed beacon' },
        { status: 400 }
      );
    }

    // Don't allow pinging own beacon
    if (beacon.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot ping your own beacon' },
        { status: 400 }
      );
    }

    // Check if user already pinged recently (within last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentPing } = await supabase
      .from('beacon_pings')
      .select('id')
      .eq('beacon_id', beaconId)
      .eq('from_user_id', user.id)
      .gte('created_at', tenMinutesAgo)
      .single();

    if (recentPing) {
      return NextResponse.json(
        { error: 'You already pinged this beacon recently. Try again in a few minutes.' },
        { status: 429 }
      );
    }

    // Create ping
    const { data: ping, error: pingError } = await supabase
      .from('beacon_pings')
      .insert({
        beacon_id: beaconId,
        from_user_id: user.id,
      })
      .select()
      .single();

    if (pingError) {
      console.error('Error creating ping:', pingError);
      return NextResponse.json(
        { error: 'Failed to send ping' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ping,
      message: 'Ping sent! The beacon owner will see your "Still there?" request.',
    });
  } catch (error) {
    console.error('Error in POST /api/beacons/[id]/ping:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
