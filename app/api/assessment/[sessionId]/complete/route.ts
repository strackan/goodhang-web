// POST /api/assessment/[sessionId]/complete
// Complete the assessment and trigger AI scoring
// - Validates all questions answered
// - Calls Claude API for scoring
// - Updates session with results
// - Marks session as completed

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AssessmentScoringService } from '@/lib/services/AssessmentScoringService';
import type { InterviewMessage } from '@/lib/assessment/types';

export async function POST(
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

    // Get session to verify ownership and get transcript
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

    // Verify transcript exists
    if (!session.interview_transcript || session.interview_transcript.length === 0) {
      return NextResponse.json({ error: 'No interview transcript found' }, { status: 400 });
    }

    // Score assessment using Claude API
    const scoringResult = await AssessmentScoringService.scoreAssessment(
      sessionId,
      user.id,
      session.interview_transcript as InterviewMessage[]
    );

    if (!scoringResult.success || !scoringResult.analysis) {
      console.error('Scoring failed:', scoringResult.error);
      return NextResponse.json(
        {
          error: scoringResult.error || 'Failed to score assessment',
          details: 'Please check that ANTHROPIC_API_KEY is valid in environment variables'
        },
        { status: 500 }
      );
    }

    const { analysis } = scoringResult;

    // Update session with analysis results
    const { error: updateError } = await supabase
      .from('cs_assessment_sessions')
      .update({
        status: 'completed',
        archetype: analysis.archetype,
        archetype_confidence: analysis.archetype_confidence,
        overall_score: analysis.overall_score,
        dimensions: analysis.dimensions,
        tier: analysis.tier,
        flags: analysis.flags,
        recommendation: analysis.recommendation,
        best_fit_roles: analysis.best_fit_roles,
        analyzed_at: analysis.analyzed_at,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session with analysis:', updateError);
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Assessment completed and scored successfully',
      session_id: sessionId,
      tier: analysis.tier,
      overall_score: analysis.overall_score,
      archetype: analysis.archetype,
      archetype_confidence: analysis.archetype_confidence,
    });
  } catch (error: any) {
    console.error('Error completing assessment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
