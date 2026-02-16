import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Invoice } from '../../src/utils/invoice-types'

const INVOICES_FILE = path.join(process.cwd(), 'server', 'data', 'invoices.json')

let invoices: Invoice[] = []

async function readInvoices(): Promise<void> {
  try {
    const fileContents = await fs.readFile(INVOICES_FILE, 'utf8')
    invoices = JSON.parse(fileContents)
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      invoices = []
      await fs.mkdir(path.dirname(INVOICES_FILE), { recursive: true })
      await fs.writeFile(INVOICES_FILE, '[]', 'utf8')
    } else {
      console.error('[mock-db] Error reading invoices file:', error)
      invoices = []
    }
  }
}

async function writeInvoices(): Promise<void> {
  await fs.writeFile(INVOICES_FILE, JSON.stringify(invoices, null, 2), 'utf8')
}

// Initialize on startup
readInvoices()

// Automatically update status of pending invoices to overdue if due date has passed
async function updateOverdueStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only

    let changed = false;
    invoices.forEach(invoice => {
        if (invoice.metadata.status === 'pending') {
            const dueDate = new Date(invoice.metadata.dueDate);
            if (dueDate < today) {
                invoice.metadata.status = 'overdue';
                changed = true;
            }
        }
    });

    if (changed) {
        await writeInvoices();
    }
}

export async function getAllInvoices(): Promise<Invoice[]> {
  await readInvoices()
  await updateOverdueStatus();
  return invoices
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await readInvoices()
  // Also update status when fetching a single invoice
  await updateOverdueStatus();
  return invoices.find(inv => inv._id === id)
}

export async function addInvoice(invoice: Invoice): Promise<Invoice> {
  await readInvoices()
  const stored: Invoice = { ...invoice, _id: uuidv4() }
  invoices.push(stored)
  await writeInvoices()
  return stored
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
  await readInvoices()
  const index = invoices.findIndex(inv => inv._id === id)
  if (index === -1) return undefined

  const originalInvoice = invoices[index];
  
  // Status transition: Draft -> Pending
  if (originalInvoice.metadata.status === 'draft' && updates.metadata?.status !== 'draft') {
    updates.metadata = { ...updates.metadata, status: 'pending' };
  }

  invoices[index] = { ...originalInvoice, ...updates, _id: id }
  
  await writeInvoices()
  return invoices[index]
}

export async function markAsPaid(id: string): Promise<Invoice | undefined> {
    await readInvoices();
    const index = invoices.findIndex(inv => inv._id === id);
    if (index === -1) return undefined;

    if (invoices[index].metadata.status === 'pending' || invoices[index].metadata.status === 'overdue') {
        invoices[index].metadata.status = 'paid';
        await writeInvoices();
        return invoices[index];
    }
    // If it's already paid or a draft, do nothing, just return the invoice
    return invoices[index];
}


export async function deleteInvoice(id: string): Promise<boolean> {
  await readInvoices()
  const before = invoices.length
  invoices = invoices.filter(inv => inv._id !== id)
  if (invoices.length < before) {
    await writeInvoices()
    return true
  }
  return false
}