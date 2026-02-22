import { requireUser } from '@/lib/requireUser'
import { InvoiceDefaultsForm } from './InvoiceDefaultsForm'

export const metadata = { title: 'Invoice Defaults' }

export default async function InvoiceDefaultsPage() {
  await requireUser()
  return <InvoiceDefaultsForm />
}
