import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/requireUser'
import { InvoiceForm } from '@/components/invoice/InvoiceForm'
import { InvoiceFormSkeleton } from '@/components/invoice/InvoiceFormSkeleton'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const session = await requireUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, userId: session.user.id },
    select: { invoiceNumber: true },
  })

  return {
    title: `Edit Invoice ${invoice?.invoiceNumber ?? ''}`,
  }
}

async function EditInvoiceContent({ id }: { id: string }) {
  const session = await requireUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!invoice) {
    notFound()
  }

  const plainInvoice = JSON.parse(JSON.stringify(invoice))

  return <InvoiceForm initialInvoice={plainInvoice} />
}

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<InvoiceFormSkeleton />}>
      <EditInvoiceContent id={params.id} />
    </Suspense>
  )
}

