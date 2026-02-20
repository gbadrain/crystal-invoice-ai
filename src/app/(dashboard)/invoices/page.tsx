// src/app/(dashboard)/invoices/page.tsx
import { requireUser } from '@/lib/requireUser';
import { prisma } from '@/lib/prisma';
import { InvoiceList } from '@/components/invoice/InvoiceList';
import type { Invoice } from '@/utils/invoice-types';

async function getInvoices(userId: string): Promise<Invoice[]> {
  try {
    const invoices = await prisma.invoice.findMany({
      where: {
        userId,
        status: {
          not: 'trashed',
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map Prisma Invoice to your existing frontend Invoice type
    const formattedInvoices: Invoice[] = invoices.map((inv) => ({
      _id: inv.id,
      logo: undefined, // Logo is handled client-side or not stored in DB
      client: {
        name: inv.clientName,
        email: inv.clientEmail || '',
        address: inv.clientAddress || '',
        phone: inv.clientPhone || '',
      },
      metadata: {
        invoiceNumber: inv.invoiceNumber,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status.toLowerCase() as Invoice['metadata']['status'],
        originalStatus: inv.originalStatus?.toLowerCase() as Invoice['metadata']['originalStatus'],
      },
      lineItems: inv.lineItems as any, // Prisma's Json type needs casting
      summary: {
        subtotal: inv.subtotal,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        discountRate: inv.discountRate,
        discountAmount: inv.discountAmount,
        total: inv.total,
      },
      notes: inv.notes || '',
      deletedAt: inv.deletedAt?.toISOString() || null,
    }));

    return formattedInvoices;
  } catch (error) {
    console.error("Error fetching invoices from DB:", error);
    // In a real app, you might want to handle this more gracefully
    return [];
  }
}

export default async function InvoicesPage() {
  // 1. Protect the page and get the user session
  const session = await requireUser();

  // 2. Fetch data on the server for the logged-in user
  const initialInvoices = await getInvoices(session.user!.id);

  // 3. Render the client component with the initial data
  return <InvoiceList initialInvoices={initialInvoices} />;
}