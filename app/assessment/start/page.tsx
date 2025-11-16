'use client';

/**
 * CS Assessment Start Page with Invite Code Flow
 *
 * Multi-step signup and assessment start:
 * 1. Enter and validate invite code
 * 2. Confirm identity and set password
 * 3. Create account and start assessment
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validateInviteCode, sendMagicLink } from '@/lib/api/renubu-client';
import { useAssessment } from '@/lib/hooks/useAssessment';
import { createClient } from '@/lib/supabase/client';

type Step = 'invite_code' | 'email_check' | 'check_email';

export default function AssessmentStartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { start } = useAssessment();

  const [step, setStep] = useState<Step>('invite_code');
  const [inviteCode, setInviteCode] = useState('');
  const [contactInfo, setContactInfo] = useState<{ id: string; name: string; email: string | null } | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-populate and validate invite code from URL
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setInviteCode(codeFromUrl.toUpperCase());
      // Auto-validate the code
      handleValidateInvite(null, codeFromUrl.toUpperCase());
    }
  }, [searchParams]);

  // Step 1: Validate invite code
  const handleValidateInvite = async (e: React.FormEvent | null, codeOverride?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setIsLoading(true);

    const codeToValidate = codeOverride || inviteCode;

    try {
      const response = await validateInviteCode(codeToValidate);
      setContactInfo(response.contact);
      setName(response.contact.name);
      setEmail(response.contact.email || '');
      setStep('email_check');
    } catch (err: any) {
      setError(err.message || 'Invalid invite code');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Send magic link
  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await sendMagicLink({
        invite_code: inviteCode,
        email,
        name,
      });

      setStep('check_email');
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CS Assessment
            </h1>
            <p className="text-gray-300 text-lg">
              Join our talent bench and get matched with world-class CS opportunities
            </p>
          </div>

          {/* Step 1: Invite Code */}
          {step === 'invite_code' && (
            <>
              <div className="mb-8 space-y-4">
                <h2 className="text-2xl font-semibold text-purple-300">Get Started</h2>
                <p className="text-gray-300">
                  You'll need an invite code to begin. If you received an invitation email, enter your code below.
                </p>
              </div>

              <form onSubmit={handleValidateInvite} className="space-y-6">
                <div>
                  <label htmlFor="invite_code" className="block text-sm font-medium text-gray-300 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    id="invite_code"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors uppercase tracking-widest"
                    placeholder="ABC123XY"
                    maxLength={8}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !inviteCode}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  {isLoading ? 'Validating...' : 'Continue →'}
                </button>
              </form>

              {/* Existing member link */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-purple-400 hover:text-purple-300">
                    Log in here
                  </Link>
                </p>
              </div>
            </>
          )}

          {/* Step 2: Email Check */}
          {step === 'email_check' && (
            <>
              <div className="mb-8 space-y-4">
                <h2 className="text-2xl font-semibold text-purple-300">Confirm Your Details</h2>
                <p className="text-gray-300">
                  Please confirm your name and email address from the invitation.
                </p>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    💡 You can edit your email if it's changed. We'll send a confirmation link to verify ownership.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSendMagicLink} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Jane Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-gray-900/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="jane@example.com"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !name || !email}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-purple-500/50"
                >
                  {isLoading ? 'Sending Magic Link...' : 'Send Verification Email →'}
                </button>
              </form>
            </>
          )}

          {/* Check Email Step */}
          {step === 'check_email' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-purple-300 mb-2">Check Your Email</h2>
                <p className="text-gray-300 mb-6">
                  We've sent a confirmation email to <strong className="text-white">{email}</strong>
                </p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-300 mb-4">
                  <strong>Next steps:</strong>
                </p>
                <ol className="text-left text-sm text-gray-300 space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">1.</span>
                    <span>Check your email inbox for a message from us</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">2.</span>
                    <span>Click the confirmation link in the email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-400 mr-3">3.</span>
                    <span>Return here and log in to start your assessment</span>
                  </li>
                </ol>
              </div>

              <div className="text-sm text-gray-400 mb-6">
                Didn't receive the email? Check your spam folder or contact support.
              </div>

              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all duration-200"
              >
                Go to Login
              </Link>
            </div>
          )}

          {/* Starting Step */}
          {step === 'starting' && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
              <p className="text-gray-300 text-lg">Starting your assessment...</p>
            </div>
          )}

          {/* What to Expect - shown on invite code step */}
          {step === 'invite_code' && (
            <div className="mt-8 pt-8 border-t border-purple-500/20 space-y-4">
              <h3 className="text-xl font-semibold text-purple-300">What to Expect</h3>
              <ul className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>
                    <strong>26 thoughtful questions</strong> across 6 sections covering your background, skills, and AI readiness
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>
                    <strong>~15-20 minutes</strong> to complete at your own pace
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>
                    <strong>AI-powered analysis</strong> scores you across 12 dimensions including IQ, EQ, technical skills, and AI competency
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-3">•</span>
                  <span>
                    <strong>Immediate results</strong> with your archetype, scores, and personalized recommendations
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* Privacy Note */}
          <p className="text-gray-500 text-xs text-center mt-6">
            Your responses are confidential and used only for matching you with relevant opportunities.
          </p>
        </div>
      </div>
    </div>
  );
}
