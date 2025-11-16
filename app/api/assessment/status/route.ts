import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get most recent session
  const { data: session, error } = await supabase
    .from('cs_assessment_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // No assessment yet
  if (!session) {
    return NextResponse.json({ status: 'not_started' });
  }

  // Completed
  if (session.status === 'completed') {
    return NextResponse.json({
      status: 'completed',
      session_id: session.id,
      overall_score: session.overall_score,
      archetype: session.archetype
    });
  }

  // In progress
  const totalQuestions = 20; // Core assessment questions
  const answeredCount = (session.interview_transcript as any[]).filter(
    msg => msg.role === 'user'
  ).length;
  const progress = Math.round((answeredCount / totalQuestions) * 100);

  return NextResponse.json({
    status: 'in_progress',
    session_id: session.id,
    progress
  });
}
