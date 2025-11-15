'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ResultsActionsProps {
  sessionId: string;
  isPublished: boolean;
}

export function ResultsActions({ sessionId, isPublished }: ResultsActionsProps) {
  const router = useRouter();

  return (
    <div className="bg-gray-900/30 border border-gray-700/30 rounded-lg p-8 mt-8">
      <h3 className="text-2xl font-bold text-white mb-6">What's Next?</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Return to Members Area */}
        <Link
          href="/members"
          className="px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-center font-semibold"
        >
          Back to Members Area
        </Link>

        {/* Retake Assessment (future) */}
        <button
          disabled
          className="px-6 py-4 bg-gray-800/50 text-gray-500 rounded-lg cursor-not-allowed text-center font-semibold"
        >
          Retake Assessment (Coming Soon)
        </button>

        {/* Publish Profile (future - Phase 2) */}
        {!isPublished && (
          <button
            disabled
            className="px-6 py-4 bg-purple-800/50 text-purple-400 rounded-lg cursor-not-allowed text-center font-semibold"
          >
            Publish to Job Board (Phase 2)
          </button>
        )}

        {/* Download Results (future) */}
        <button
          disabled
          className="px-6 py-4 bg-gray-800/50 text-gray-500 rounded-lg cursor-not-allowed text-center font-semibold"
        >
          Download PDF (Coming Soon)
        </button>
      </div>
    </div>
  );
}
