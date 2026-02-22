import { requireUser } from '@/lib/requireUser'
import { ProfileForm } from './ProfileForm'

export const metadata = { title: 'Profile Settings' }

export default async function ProfileSettingsPage() {
  const session = await requireUser()
  return <ProfileForm email={session.user.email ?? ''} />
}
