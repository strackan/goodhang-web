// GET /api/assessment/[sessionId]/results
// Get assessment results
// - Returns full analysis if completed
// - Returns 202 "Processing" if not yet scored

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient();
    const sessionId = params.sessionId;

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('cs_assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify user owns this session
    if (session.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - session ownership mismatch' },
        { status: 403 }
      );
    }

    // Check if results are ready
    if (session.status !== 'completed' || !session.analyzed_at) {
      return NextResponse.json(
        {
          status: 'processing',
          message: 'Assessment is still being analyzed',
        },
        { status: 202 }
      );
    }

    // Return full results
    return NextResponse.json({
      session_id: session.id,
      user_id: session.user_id,
      status: session.status,
      archetype: session.archetype,
      archetype_confidence: session.archetype_confidence,
      overall_score: session.overall_score,
      dimensions: session.dimensions,
      tier: session.tier,
      flags: session.flags,
      recommendation: session.recommendation,
      best_fit_roles: session.best_fit_roles,
      analyzed_at: session.analyzed_at,
      completed_at: session.completed_at,
    });
  } catch (error: any) {
    console.error('Error getting results:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
