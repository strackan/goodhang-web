import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/beacons/[id]
 * Get a single beacon with full details
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch beacon with creator profile
    const { data: beacon, error: beaconError } = await supabase
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
      .eq('id', id)
      .single();

    if (beaconError || !beacon) {
      return NextResponse.json(
        { error: 'Beacon not found' },
        { status: 404 }
      );
    }

    // Fetch responses with user profiles
    const { data: responses } = await supabase
      .from('beacon_responses')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('beacon_id', id)
      .order('created_at', { ascending: false });

    // Fetch pings (only if owner)
    let pings = null;
    if (beacon.user_id === user.id) {
      const { data: pingData } = await supabase
        .from('beacon_pings')
        .select(`
          *,
          from_user:from_user_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('beacon_id', id)
        .order('created_at', { ascending: false });
      pings = pingData;
    }

    // Calculate response counts
    const responseCounts = {
      on_my_way: responses?.filter((r) => r.response_type === 'on_my_way').length || 0,
      next_time: responses?.filter((r) => r.response_type === 'next_time').length || 0,
    };

    return NextResponse.json({
      success: true,
      beacon: {
        ...beacon,
        creator: beacon.profiles,
        responses,
        pings,
        response_counts: responseCounts,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/beacons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/beacons/[id]
 * Update a beacon (owner only)
 *
 * Body:
 * - vibe_text?: string
 * - tagged_member_ids?: string[]
 * - status?: 'closed' (to close the beacon)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const { data: existingBeacon, error: fetchError } = await supabase
      .from('beacons')
      .select('id, user_id, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingBeacon) {
      return NextResponse.json(
        { error: 'Beacon not found' },
        { status: 404 }
      );
    }

    if (existingBeacon.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this beacon' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { vibe_text, tagged_member_ids, status } = body;

    // Build update object
    const updateData: Record<string, unknown> = {};

    if (vibe_text !== undefined) {
      if (vibe_text && vibe_text.length > 140) {
        return NextResponse.json(
          { error: 'vibe_text must be 140 characters or less' },
          { status: 400 }
        );
      }
      updateData.vibe_text = vibe_text || null;
    }

    if (tagged_member_ids !== undefined) {
      updateData.tagged_member_ids = tagged_member_ids;
    }

    if (status === 'closed') {
      updateData.status = 'closed';
      updateData.closed_at = new Date().toISOString();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update beacon
    const { data: beacon, error: updateError } = await supabase
      .from('beacons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating beacon:', updateError);
      return NextResponse.json(
        { error: 'Failed to update beacon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      beacon,
    });
  } catch (error) {
    console.error('Error in PATCH /api/beacons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beacons/[id]
 * Delete a beacon (owner only)
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership and delete
    const { error: deleteError } = await supabase
      .from('beacons')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting beacon:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete beacon' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/beacons/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
