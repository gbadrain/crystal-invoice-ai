import { requireUser } from '@/lib/requireUser'
import { ChangePasswordForm } from './ChangePasswordForm'

export default async function SettingsPasswordPage() {
  await requireUser()
  return <ChangePasswordForm />
}
