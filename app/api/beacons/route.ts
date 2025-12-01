import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { haversineDistance } from '@/lib/utils/distance';
import type { Beacon, Profile } from '@/lib/types/database';

interface BeaconWithProfile extends Beacon {
  profiles: Profile;
}

/**
 * GET /api/beacons
 * List beacons with optional filtering by status and distance
 *
 * Query params:
 * - lat, lng: User's location for distance calculation
 * - radius_miles: Filter by radius (default: 25)
 * - status: 'active' | 'mine' | 'recent' (default: 'active')
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radiusMiles = parseInt(searchParams.get('radius_miles') || '25', 10);
    const status = searchParams.get('status') || 'active';

    // Build query based on status filter
    let query = supabase
      .from('beacons')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          email,
          avatar_url,
          company
        )
      `)
      .order('created_at', { ascending: false });

    if (status === 'mine') {
      // User's own beacons (all statuses)
      query = query.eq('user_id', user.id);
    } else if (status === 'recent') {
      // Closed beacons from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query
        .eq('status', 'closed')
        .gte('created_at', today.toISOString());
    } else {
      // Active beacons (default)
      query = query.eq('status', 'active');
    }

    const { data: beacons, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching beacons:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch beacons' },
        { status: 500 }
      );
    }

    // Get response counts for each beacon
    const beaconIds = beacons?.map((b) => b.id) || [];
    const { data: responses } = await supabase
      .from('beacon_responses')
      .select('beacon_id, response_type')
      .in('beacon_id', beaconIds);

    // Calculate response counts per beacon
    const responseCounts: Record<string, { on_my_way: number; next_time: number }> = {};
    responses?.forEach((r) => {
      const beaconId = r.beacon_id;
      if (!beaconId) return;
      if (!responseCounts[beaconId]) {
        responseCounts[beaconId] = { on_my_way: 0, next_time: 0 };
      }
      if (r.response_type === 'on_my_way') {
        responseCounts[beaconId].on_my_way++;
      } else if (r.response_type === 'next_time') {
        responseCounts[beaconId].next_time++;
      }
    });

    // Transform and filter by distance if location provided
    const beaconsWithDetails = (beacons as BeaconWithProfile[] || [])
      .map((beacon) => {
        const distanceMiles =
          lat !== null && lng !== null
            ? haversineDistance(lat, lng, Number(beacon.lat), Number(beacon.lng))
            : undefined;

        return {
          ...beacon,
          creator: beacon.profiles,
          response_counts: responseCounts[beacon.id] || { on_my_way: 0, next_time: 0 },
          distance_miles: distanceMiles,
        };
      })
      .filter((beacon) => {
        // Filter by radius if location provided
        if (lat !== null && lng !== null && beacon.distance_miles !== undefined) {
          return beacon.distance_miles <= radiusMiles;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by distance if available, otherwise by created_at
        if (a.distance_miles !== undefined && b.distance_miles !== undefined) {
          return a.distance_miles - b.distance_miles;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

    return NextResponse.json({
      success: true,
      beacons: beaconsWithDetails,
    });
  } catch (error) {
    console.error('Error in GET /api/beacons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beacons
 * Create a new beacon (auto-closes any existing active beacon for user)
 *
 * Body:
 * - lat: number (required)
 * - lng: number (required)
 * - venue_name?: string
 * - venue_address?: string
 * - vibe_text?: string
 * - duration_hint?: 'quick_drink' | 'few_hours' | 'all_night'
 * - tagged_member_ids?: string[]
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const {
      lat,
      lng,
      venue_name,
      venue_address,
      vibe_text,
      duration_hint,
      tagged_member_ids,
    } = body;

    // Validate required fields
    if (lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'lat and lng are required' },
        { status: 400 }
      );
    }

    // Validate lat/lng ranges
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid lat/lng values' },
        { status: 400 }
      );
    }

    // Validate vibe_text length
    if (vibe_text && vibe_text.length > 140) {
      return NextResponse.json(
        { error: 'vibe_text must be 140 characters or less' },
        { status: 400 }
      );
    }

    // Validate duration_hint
    const validDurationHints = ['quick_drink', 'few_hours', 'all_night'];
    if (duration_hint && !validDurationHints.includes(duration_hint)) {
      return NextResponse.json(
        { error: 'Invalid duration_hint' },
        { status: 400 }
      );
    }

    // Close any existing active beacon for this user
    const { error: closeError } = await supabase
      .from('beacons')
      .update({ status: 'closed', closed_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (closeError) {
      console.error('Error closing existing beacon:', closeError);
      // Continue anyway - this isn't critical
    }

    // Create new beacon
    const { data: beacon, error: insertError } = await supabase
      .from('beacons')
      .insert({
        user_id: user.id,
        lat,
        lng,
        venue_name: venue_name || null,
        venue_address: venue_address || null,
        vibe_text: vibe_text || null,
        duration_hint: duration_hint || null,
        tagged_member_ids: tagged_member_ids || [],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating beacon:', insertError);
      return NextResponse.json(
        { error: 'Failed to create beacon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      beacon,
    });
  } catch (error) {
    console.error('Error in POST /api/beacons:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
