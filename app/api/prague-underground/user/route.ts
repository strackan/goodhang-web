import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Prague Underground User API ===');

    const body = await request.json();
    const { slug } = body;

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { error: 'A valid passkey is required' },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    if (normalizedSlug !== 'serendipity') {
      return NextResponse.json(
        { error: 'That passkey does not open this door. Perhaps try another word.' },
        { status: 403 }
      );
    }
    const supabase = await createClient();

    // Try to find existing user
    const { data: existingUser, error: selectError } = await supabase
      .from('prague_underground_users')
      .select('*')
      .eq('slug', normalizedSlug)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is expected for new users
      console.error('Supabase select error:', selectError);
      return NextResponse.json(
        { error: selectError.message },
        { status: 500 }
      );
    }

    let user = existingUser;

    // Create new user if not found
    if (!user) {
      console.log('Creating new user with slug:', normalizedSlug);
      const { data: newUser, error: insertError } = await supabase
        .from('prague_underground_users')
        .insert({ slug: normalizedSlug })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }

      user = newUser;
    }

    // Fetch claims for this user
    const { data: claims, error: claimsError } = await supabase
      .from('prague_underground_claims')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (claimsError) {
      console.error('Claims fetch error:', claimsError);
      return NextResponse.json(
        { error: claimsError.message },
        { status: 500 }
      );
    }

    console.log(`User loaded: ${user.slug}, ${claims?.length ?? 0} claims, ${user.total_points} pts`);
    return NextResponse.json({ user, claims: claims ?? [] });

  } catch (error: unknown) {
    console.error('=== Prague Underground User Error ===');
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
