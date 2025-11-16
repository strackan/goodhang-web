// POST /api/assessment/[sessionId]/answer
// Saves answer with auto-save functionality

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AnswerRequestBody {
  question_id: string;
  answer: string;
  current_section?: string;
  current_question?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    const { sessionId } = params;
    const body: AnswerRequestBody = await request.json();
    const { question_id, answer, current_section, current_question } = body;

    if (!question_id || !answer) {
      return NextResponse.json(
        { error: 'Missing question_id or answer' },
        { status: 400 }
      );
    }

    // Fetch existing session
    const { data: session, error: fetchError } = await supabase
      .from('cs_assessment_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      console.error('Error fetching session:', fetchError);
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      );
    }

    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot modify completed assessment' },
        { status: 400 }
      );
    }

    // Update answers
    const updatedAnswers = {
      ...(session.answers || {}),
      [question_id]: {
        question_id,
        answer,
        answered_at: new Date().toISOString(),
      },
    };

    // Build update object
    const updateData: any = {
      answers: updatedAnswers,
      status: 'in_progress',
    };

    if (current_section) {
      updateData.current_section = current_section;
    }

    if (current_question !== undefined) {
      updateData.current_question = current_question;
    }

    // Save to database
    const { error: updateError } = await supabase
      .from('cs_assessment_sessions')
      .update(updateData)
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      return NextResponse.json(
        { error: 'Failed to save answer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id: sessionId,
      saved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in /api/assessment/[sessionId]/answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
