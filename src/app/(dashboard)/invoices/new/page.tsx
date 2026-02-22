import { Suspense } from 'react'
import { requireUser } from '@/lib/requireUser'
import { prisma } from '@/lib/prisma'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { InvoiceFormSkeleton } from '@/components/invoice/InvoiceFormSkeleton'

export const metadata = { title: 'New Invoice' }

async function NewInvoiceContent() {
  const session = await requireUser()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { invoiceDueDays: true, invoiceFooter: true, invoiceCurrency: true },
  })
  const initialDefaults = {
    dueDays: user?.invoiceDueDays ?? 30,
    footer: user?.invoiceFooter ?? '',
    currency: user?.invoiceCurrency ?? 'USD',
  }
  return <InvoiceForm initialDefaults={initialDefaults} />
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<InvoiceFormSkeleton />}>
      <NewInvoiceContent />
    </Suspense>
  )
}
