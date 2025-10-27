import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email
// Use Resend's onboarding email until custom domain is verified
export const FROM_EMAIL = 'Good Hang <onboarding@resend.dev>';
