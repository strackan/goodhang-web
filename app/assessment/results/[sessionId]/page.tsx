'use client';

/**
 * Assessment Results Page
 * Displays the scored assessment results including:
 * - Overall score and tier
 * - Archetype
 * - 12-dimension scores
 * - Green/red flags
 * - Recommendations
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { AssessmentResults } from '@/lib/assessment/types';

export default function AssessmentResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`/api/assessment/${sessionId}/results`);

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to load results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load results');
      } finally {
        setIsLoading(false);
      }
    }

    if (sessionId) {
      loadResults();
    }
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-500/10 border border-red-500/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-red-400 mb-4">Error Loading Results</h2>
          <p className="text-gray-300 mb-6">{error || 'Results not found'}</p>
          <button
            onClick={() => router.push('/assessment/start')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'top_1':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'benched':
        return 'text-green-400 border-green-500/30 bg-green-500/10';
      case 'passed':
        return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      default:
        return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'top_1':
        return 'Top 1% Candidate';
      case 'benched':
        return 'Talent Bench';
      case 'passed':
        return 'Assessed';
      default:
        return tier;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Your CS Assessment Results
          </h1>
          <p className="text-gray-400">
            Analyzed on {new Date(results.analyzed_at).toLocaleDateString()}
          </p>
        </div>

        {/* Overall Score & Tier */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Overall Score */}
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 text-center">
            <h2 className="text-gray-400 text-sm uppercase tracking-wide mb-2">Overall Score</h2>
            <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
              {results.overall_score}
            </div>
            <p className="text-gray-300">out of 100</p>
          </div>

          {/* Tier */}
          <div className={`border rounded-lg p-8 text-center ${getTierColor(results.tier)}`}>
            <h2 className="text-sm uppercase tracking-wide mb-2 opacity-80">Tier</h2>
            <div className="text-3xl font-bold mb-2">{getTierLabel(results.tier)}</div>
            {results.tier === 'top_1' && <p className="text-sm opacity-80">Elite CS Professional</p>}
            {results.tier === 'benched' && <p className="text-sm opacity-80">Ready for Opportunities</p>}
          </div>
        </div>

        {/* Archetype */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-purple-300">Your Archetype</h2>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-3xl font-bold text-white">{results.archetype}</h3>
            <span className="text-sm text-gray-400">
              {results.archetype_confidence} confidence
            </span>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-purple-300">Dimension Scores</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(results.dimensions).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="text-white font-semibold">{value}/100</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 transition-all duration-300"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flags */}
        {(results.flags.green_flags.length > 0 || results.flags.red_flags.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Green Flags */}
            {results.flags.green_flags.length > 0 && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-4">✓ Strengths</h3>
                <ul className="space-y-2">
                  {results.flags.green_flags.map((flag, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Red Flags */}
            {results.flags.red_flags.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-400 mb-4">⚠ Areas to Develop</h3>
                <ul className="space-y-2">
                  {results.flags.red_flags.map((flag, idx) => (
                    <li key={idx} className="text-gray-300 text-sm">
                      • {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Recommendation */}
        {results.recommendation && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Recommendation</h2>
            <p className="text-gray-300 leading-relaxed">{results.recommendation}</p>
          </div>
        )}

        {/* Best Fit Roles */}
        {results.best_fit_roles && results.best_fit_roles.length > 0 && (
          <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">Best Fit Roles</h2>
            <div className="flex flex-wrap gap-3">
              {results.best_fit_roles.map((role, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="text-center">
          <button
            onClick={() => router.push('/members')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
          >
            Go to Members Area
          </button>
        </div>
      </div>
    </div>
  );
}
