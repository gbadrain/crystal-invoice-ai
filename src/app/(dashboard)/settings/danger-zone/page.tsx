import { requireUser } from '@/lib/requireUser'
import { DeleteAccountForm } from './DeleteAccountForm'

export const metadata = { title: 'Danger Zone' }

export default async function DangerZonePage() {
  await requireUser()
  return <DeleteAccountForm />
}
