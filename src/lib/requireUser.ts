// lib/requireUser.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

/**
 * A helper function to protect server components and pages.
 * It checks for a valid session and redirects to the sign-in page if it doesn't exist.
 * @returns The session if the user is authenticated.
 */
export const requireUser = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  return session;
};
