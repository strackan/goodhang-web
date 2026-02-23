import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { VENUES } from '@/lib/prague-underground/venues';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Prague Underground Claim API ===');

    const formData = await request.formData();
    const userId = formData.get('userId') as string | null;
    const venueId = formData.get('venueId') as string | null;
    const photo = formData.get('photo') as File | null;
    const notes = formData.get('notes') as string | null;

    // Validate required fields
    if (!userId || !venueId || !photo) {
      return NextResponse.json(
        { error: 'userId, venueId, and photo are required' },
        { status: 400 }
      );
    }

    // Validate venue exists
    const venue = VENUES.find(v => v.id === venueId);
    if (!venue) {
      return NextResponse.json(
        { error: 'Invalid venue ID' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!photo.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Max 10MB
    if (photo.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image must be under 10MB' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Check for duplicate claim
    const { data: existingClaim } = await supabase
      .from('prague_underground_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('venue_id', venueId)
      .single();

    if (existingClaim) {
      return NextResponse.json(
        { error: 'You have already claimed this venue' },
        { status: 409 }
      );
    }

    // Upload image to Supabase Storage
    const ext = photo.name.split('.').pop() ?? 'jpg';
    const fileName = `${userId}/${venueId}-${Date.now()}.${ext}`;
    const buffer = Buffer.from(await photo.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from('prague-underground')
      .upload(fileName, buffer, {
        contentType: photo.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('prague-underground')
      .getPublicUrl(fileName);

    const photoUrl = urlData.publicUrl;

    // Insert claim row
    const { data: claim, error: insertError } = await supabase
      .from('prague_underground_claims')
      .insert({
        user_id: userId,
        venue_id: venueId,
        photo_url: photoUrl,
        notes: notes || null,
        points_awarded: venue.points,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Claim insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Fetch updated user (trigger should have updated total_points)
    const { data: updatedUser, error: userError } = await supabase
      .from('prague_underground_users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User refetch error:', userError);
    }

    console.log(`Claim created: ${venueId} for user ${userId}, +${venue.points} pts`);
    return NextResponse.json({
      claim,
      user: updatedUser ?? null,
    });

  } catch (error: unknown) {
    console.error('=== Prague Underground Claim Error ===');
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
