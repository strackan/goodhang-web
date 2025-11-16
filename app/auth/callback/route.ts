import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/members'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      // Update profile with LinkedIn data if available
      const user = data.session.user
      const userMetadata = user.user_metadata

      // Extract LinkedIn data from user metadata
      const linkedinData = {
        avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
        linkedin_url: userMetadata.provider_id
          ? `https://www.linkedin.com/in/${userMetadata.provider_id}`
          : null,
      }

      // Only update if we have LinkedIn data
      if (linkedinData.avatar_url || linkedinData.linkedin_url) {
        await supabase
          .from('profiles')
          .update(linkedinData)
          .eq('id', user.id)
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
