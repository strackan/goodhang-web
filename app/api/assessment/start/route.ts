// POST /api/assessment/start
// Creates new assessment session or resumes existing incomplete session

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AssessmentConfig } from '@/lib/assessment/types';
import coreQuestions from '@/lib/assessment/core-questions.json';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing incomplete session
    const { data: existingSession, error: fetchError } = await supabase
      .from('cs_assessment_sessions')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['not_started', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows returned (expected)
      console.error('Error fetching existing session:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check existing session' },
        { status: 500 }
      );
    }

    let session;

    if (existingSession) {
      // Resume existing session
      session = existingSession;
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('cs_assessment_sessions')
        .insert({
          user_id: user.id,
          status: 'not_started',
          answers: {},
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError || !newSession) {
        console.error('Error creating session:', createError);
        return NextResponse.json(
          { error: 'Failed to create assessment session' },
          { status: 500 }
        );
      }

      session = newSession;

      // Update status to in_progress
      await supabase
        .from('cs_assessment_sessions')
        .update({ status: 'in_progress' })
        .eq('id', session.id);
    }

    // Calculate progress
    const answersCount = Object.keys(session.answers || {}).length;
    const totalQuestions = (coreQuestions as AssessmentConfig).sections.reduce(
      (sum, section) => sum + section.questions.length,
      0
    );

    const response = {
      session_id: session.id,
      status: session.status,
      progress: {
        current_section: session.current_section || coreQuestions.sections[0].id,
        current_question: session.current_question || 0,
        total_questions: totalQuestions,
        percentage: Math.round((answersCount / totalQuestions) * 100),
      },
      config: coreQuestions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in /api/assessment/start:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
