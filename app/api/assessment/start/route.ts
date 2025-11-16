// POST /api/assessment/start
// Start a new assessment or resume an existing one
// - Checks for in-progress session
// - Creates new session if none exists
// - Returns assessment questions

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { loadAssessmentConfig } from '@/lib/assessment/question-loader';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check for existing in-progress session
    const { data: existingSessions, error: queryError } = await supabase
      .from('cs_assessment_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);

    if (queryError) {
      console.error('Error checking existing sessions:', queryError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let session;
    let isResume = false;

    if (existingSessions && existingSessions.length > 0) {
      // Resume existing session
      session = existingSessions[0];
      isResume = true;

      // Update last_activity_at
      await supabase
        .from('cs_assessment_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', session.id);
    } else {
      // Create new session
      const { data: newSession, error: createError } = await supabase
        .from('cs_assessment_sessions')
        .insert({
          user_id: user.id,
          status: 'in_progress',
          current_section_index: 0,
          current_question_index: 0,
          interview_transcript: [],
        })
        .select()
        .single();

      if (createError || !newSession) {
        console.error('Error creating session:', createError);
        return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
      }

      session = newSession;
    }

    // Load assessment questions
    const assessment = loadAssessmentConfig();

    return NextResponse.json({
      session_id: session.id,
      assessment,
      resume: isResume,
      current_section_index: session.current_section_index,
      current_question_index: session.current_question_index,
      message: isResume ? 'Resuming your assessment' : 'Assessment started successfully',
    });
  } catch (error: any) {
    console.error('Error starting assessment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
