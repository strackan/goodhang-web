// POST /api/assessment/[sessionId]/answer
// Submit an answer to a question
// - Appends Q&A to transcript
// - Updates progress (section/question index)
// - Auto-saves progress

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    // Parse request body
    const body = await request.json();
    const { question_id, question_text, answer, section_index, question_index } = body;

    // Validate required fields
    if (!question_id || !question_text || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields: question_id, question_text, answer' },
        { status: 400 }
      );
    }

    // Get session to verify ownership and get existing transcript
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

    // Build new transcript entries
    const existingTranscript = (session.interview_transcript as InterviewMessage[]) || [];

    const questionMessage: InterviewMessage = {
      role: 'assistant',
      content: question_text,
      timestamp: new Date().toISOString(),
    };

    const answerMessage: InterviewMessage = {
      role: 'user',
      content: answer,
      timestamp: new Date().toISOString(),
    };

    const updatedTranscript = [...existingTranscript, questionMessage, answerMessage];

    // Update session with new transcript and progress
    const { error: updateError } = await supabase
      .from('cs_assessment_sessions')
      .update({
        interview_transcript: updatedTranscript,
        current_section_index: section_index !== undefined ? section_index : session.current_section_index,
        current_question_index: question_index !== undefined ? question_index : session.current_question_index,
        last_activity_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session transcript:', updateError);
      return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Answer saved successfully',
      question_id,
    });
  } catch (error: any) {
    console.error('Error saving answer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
