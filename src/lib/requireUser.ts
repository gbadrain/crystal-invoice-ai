import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

/**
 * Protects any Server Component or page.
 * If no session exists the user is redirected to /auth/signin, with the
 * current path preserved as ?callbackUrl= so the sign-in form can send
 * them back to where they came from after a successful login.
 */
export const requireUser = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    // Read the incoming request path from Next.js internal headers.
    // next/headers exposes the full URL under 'x-url' in the dev server
    // and under the standard 'referer' as a fallback.
    const headersList = headers()
    const rawUrl =
      headersList.get('x-url') ??
      headersList.get('referer') ??
      ''

    let callbackPath = '/'
    try {
      if (rawUrl) {
        callbackPath = new URL(rawUrl).pathname
      }
    } catch {
      // rawUrl was not a valid absolute URL — leave callbackPath as '/'
    }

    const target =
      callbackPath && callbackPath !== '/auth/signin'
        ? `/auth/signin?callbackUrl=${encodeURIComponent(callbackPath)}`
        : '/auth/signin'

    redirect(target)
  }

  return session
}
