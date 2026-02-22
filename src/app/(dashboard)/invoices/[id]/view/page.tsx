import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/requireUser'
import { ViewInvoiceClient } from './ViewInvoiceClient'
import { ViewInvoiceSkeleton } from './ViewInvoiceSkeleton'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const session = await requireUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id, userId: session.user.id },
    select: { invoiceNumber: true },
  })

  return {
    title: `Invoice ${invoice?.invoiceNumber ?? ''}`,
  }
}

async function ViewInvoiceContent({ id }: { id: string }) {
  const session = await requireUser()

  const invoice = await prisma.invoice.findUnique({
    where: { id, userId: session.user.id },
  })

  if (!invoice) {
    notFound()
  }

  // The prisma `invoice` object is not directly serializable
  // A simple JSON stringify/parse will strip undefined values and convert dates
  const plainInvoice = JSON.parse(JSON.stringify(invoice))

  return <ViewInvoiceClient initialInvoice={plainInvoice} />
}

export default function ViewInvoicePage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<ViewInvoiceSkeleton />}>
      <ViewInvoiceContent id={params.id} />
    </Suspense>
  )
}
