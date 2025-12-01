import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/beacons/[id]/respond
 * Respond to a beacon with "on_my_way" or "next_time"
 *
 * Body:
 * - response_type: 'on_my_way' | 'next_time'
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    // Parse request body
    const body = await request.json();
    const { response_type } = body;

    // Validate response_type
    if (!response_type || !['on_my_way', 'next_time'].includes(response_type)) {
      return NextResponse.json(
        { error: 'response_type must be "on_my_way" or "next_time"' },
        { status: 400 }
      );
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
        { error: 'Cannot respond to a closed beacon' },
        { status: 400 }
      );
    }

    // Don't allow responding to own beacon
    if (beacon.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot respond to your own beacon' },
        { status: 400 }
      );
    }

    // Insert or update response (upsert)
    const { data: response, error: responseError } = await supabase
      .from('beacon_responses')
      .upsert(
        {
          beacon_id: beaconId,
          user_id: user.id,
          response_type,
        },
        {
          onConflict: 'beacon_id,user_id,response_type',
        }
      )
      .select()
      .single();

    if (responseError) {
      console.error('Error creating response:', responseError);
      return NextResponse.json(
        { error: 'Failed to create response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error in POST /api/beacons/[id]/respond:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beacons/[id]/respond
 * Remove a response from a beacon
 *
 * Body:
 * - response_type: 'on_my_way' | 'next_time'
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Parse request body
    const body = await request.json();
    const { response_type } = body;

    // Validate response_type
    if (!response_type || !['on_my_way', 'next_time'].includes(response_type)) {
      return NextResponse.json(
        { error: 'response_type must be "on_my_way" or "next_time"' },
        { status: 400 }
      );
    }

    // Delete response
    const { error: deleteError } = await supabase
      .from('beacon_responses')
      .delete()
      .eq('beacon_id', beaconId)
      .eq('user_id', user.id)
      .eq('response_type', response_type);

    if (deleteError) {
      console.error('Error deleting response:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error in DELETE /api/beacons/[id]/respond:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
