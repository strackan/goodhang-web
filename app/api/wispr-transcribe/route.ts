/**
 * POST /api/wispr-transcribe
 *
 * Speech-to-text endpoint using Wispr Flow API.
 * Returns auto-formatted, cleaned transcript (capitalization, punctuation,
 * filler word removal, grammar correction).
 *
 * Request: multipart/form-data with audio file + optional context params
 * Response: { text: string, provider: 'wispr', duration: number }
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const apiKey = process.env.WISPR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Wispr API key not configured',
          details: 'Set WISPR_API_KEY in environment variables to enable Wispr Flow transcription',
        },
        { status: 500 }
      );
    }

    // Optional context parameters
    const dictionaryJson = formData.get('dictionary') as string | null;
    const beforeText = formData.get('before_text') as string | null;
    const afterText = formData.get('after_text') as string | null;
    const selectedText = formData.get('selected_text') as string | null;
    const conversation = formData.get('conversation') as string | null;

    // Convert audio to base64
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    // Build Wispr request body
    const body: Record<string, unknown> = { audio: base64Audio };
    if (dictionaryJson) body.dictionary = JSON.parse(dictionaryJson);
    if (beforeText) body.before_text = beforeText;
    if (afterText) body.after_text = afterText;
    if (selectedText) body.selected_text = selectedText;
    if (conversation) body.conversation = JSON.parse(conversation);

    const res = await fetch('https://platform-api.wisprflow.ai/api/v1/dash/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      console.error('Wispr API error:', error);
      return NextResponse.json(
        { error: 'Transcription failed', details: error },
        { status: res.status }
      );
    }

    const result = await res.json();

    return NextResponse.json({
      text: result.text ?? '',
      provider: 'wispr',
      duration: result.total_time ?? audioFile.size / 32000,
      detected_language: result.detected_language || undefined,
    });
  } catch (error: unknown) {
    console.error('Wispr transcription error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
