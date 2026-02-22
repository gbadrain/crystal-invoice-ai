import { requireUser } from '@/lib/requireUser'
import { ChangePasswordForm } from './ChangePasswordForm'

export const metadata = {
  title: 'Change Password',
}

export default async function SettingsPasswordPage() {
  await requireUser()
  return (
    <div className="max-w-2xl">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Settings
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Update your account password.
          </p>
        </div>
      </div>
      <ChangePasswordForm />
    </div>
  )
}
