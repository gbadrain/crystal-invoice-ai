import { promises as fs } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import type { Invoice } from '../../src/utils/invoice-types'

const INVOICES_FILE = path.join(process.cwd(), 'server', 'data', 'invoices.json')
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

let invoices: Invoice[] = []
let isInitialized = false; // Flag to ensure normalization and purge run only once per server start

async function readInvoices(): Promise<void> {
  try {
    const fileContents = await fs.readFile(INVOICES_FILE, 'utf8')
    invoices = JSON.parse(fileContents)
    
    // Normalize invoices: ensure deletedAt and originalStatus are consistent
    let changed = false;
    invoices = invoices.map(invoice => {
      // Ensure every invoice has a deletedAt field (null if not trashed)
      if (invoice.deletedAt === undefined) {
        invoice.deletedAt = null;
        changed = true;
      }

      if (invoice.metadata.status === 'trashed') {
        // Trashed invoices MUST have deletedAt and originalStatus
        if (!invoice.deletedAt) {
          // Trashed but no deletedAt — restore to original status
          invoice.metadata.status = invoice.metadata.originalStatus || 'draft';
          invoice.metadata.originalStatus = undefined;
          invoice.deletedAt = null;
          changed = true;
        } else if (!invoice.metadata.originalStatus) {
          invoice.metadata.originalStatus = 'draft';
          changed = true;
        }
      } else {
        // Non-trashed invoices MUST NOT have deletedAt or originalStatus
        if (invoice.deletedAt != null) {
          invoice.deletedAt = null;
          changed = true;
        }
        if (invoice.metadata.originalStatus !== undefined) {
          invoice.metadata.originalStatus = undefined;
          changed = true;
        }
      }

      return invoice;
    });

    if (changed) {
      console.log('[mock-db] Normalized invoices.json. Rewriting file.');
      await writeInvoices(); // Persist normalized data
    }

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

async function updateOverdueStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let changed = false;
    invoices.forEach(invoice => {
        // Only update if not trashed
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

// --- FIX 3: Add 30-day auto-purge logic ---
async function autoPurgeTrashedInvoices() {
    const now = Date.now();
    let changed = false;
    const initialLength = invoices.length;

    invoices = invoices.filter(invoice => {
        if (invoice.metadata.status === 'trashed' && invoice.deletedAt) {
            const deletedTime = new Date(invoice.deletedAt).getTime();
            if (now - deletedTime > THIRTY_DAYS_MS) {
                console.log(`[mock-db] Auto-purging invoice: ${invoice._id} (deleted over 30 days ago)`);
                changed = true;
                return false; // Exclude this invoice from the filtered list
            }
        }
        return true; // Keep other invoices
    });

    if (changed) {
        console.log(`[mock-db] Purged ${initialLength - invoices.length} invoices.`);
        await writeInvoices(); // Persist changes after purge
    }
}


// --- FIX 1: Correct getAllInvoices(includeTrashed) ---
export async function getAllInvoices(includeTrashed = false): Promise<Invoice[]> {
  await readInvoices() // Ensure latest data and normalization
  
  // Run auto-purge only once per server start, or periodically
  // For simplicity, running it on every getAllInvoices call for mock-db
  await autoPurgeTrashedInvoices(); 
  await updateOverdueStatus(); // Update overdue status after purge

  if (includeTrashed) {
    return invoices.filter(inv => inv.metadata.status === 'trashed');
  }
  return invoices.filter(inv => inv.metadata.status !== 'trashed');
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await readInvoices()
  await updateOverdueStatus(); // Ensure status is up-to-date
  return invoices.find(inv => inv._id === id)
}

export async function addInvoice(invoice: Invoice): Promise<Invoice> {
  await readInvoices()
  const stored: Invoice = { 
    ...invoice, 
    _id: uuidv4(),
    deletedAt: null, // Ensure new invoices are not deleted
    metadata: {
      ...invoice.metadata,
      originalStatus: undefined // Ensure new invoices don't have originalStatus
    }
  }
  invoices.push(stored)
  await writeInvoices()
  return stored
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | undefined> {
  await readInvoices()
  const index = invoices.findIndex(inv => inv._id === id)
  if (index === -1) return undefined

  const originalInvoice = invoices[index];
  
  // Only transition from draft if not already trashed
  if (originalInvoice.metadata.status === 'draft' && updates.metadata?.status !== 'draft' && originalInvoice.metadata.status !== 'trashed') {
    updates.metadata = { ...updates.metadata, status: 'pending' };
  }

  invoices[index] = { ...originalInvoice, ...updates, _id: id }
  
  await writeInvoices()
  return invoices[index]
}

// --- FIX 5: Ensure Soft Delete works correctly ---
export async function softDeleteInvoice(id: string): Promise<Invoice | undefined> {
    await readInvoices();
    const index = invoices.findIndex(inv => inv._id === id);
    if (index === -1 || invoices[index].metadata.status === 'trashed') return undefined; // Don't soft delete if already trashed

    const invoice = invoices[index];
    invoice.deletedAt = new Date().toISOString();
    invoice.metadata.originalStatus = invoice.metadata.status;
    invoice.metadata.status = 'trashed';
    
    await writeInvoices();
    return invoice;
}

// --- FIX 6: Ensure Restore works correctly ---
export async function restoreInvoice(id: string): Promise<Invoice | undefined> {
    await readInvoices();
    const index = invoices.findIndex(inv => inv._id === id);
    if (index === -1 || invoices[index].metadata.status !== 'trashed') return undefined; // Only restore if currently trashed

    const invoice = invoices[index];
    invoice.deletedAt = null;
    invoice.metadata.status = invoice.metadata.originalStatus || 'draft'; // Restore to original or draft
    invoice.metadata.originalStatus = undefined; // Clear original status

    await writeInvoices();
    return invoice;
}

// --- FIX 7: Ensure Permanent Delete works correctly ---
export async function permanentDeleteInvoice(id: string): Promise<boolean> {
  await readInvoices()
  const before = invoices.length
  invoices = invoices.filter(inv => inv._id !== id)
  if (invoices.length < before) {
    await writeInvoices()
    return true
  }
  return false
}

// Bulk: permanently delete all trashed invoices
export async function permanentDeleteAllTrashed(): Promise<number> {
  await readInvoices()
  const before = invoices.length
  invoices = invoices.filter(inv => inv.metadata.status !== 'trashed')
  const deleted = before - invoices.length
  if (deleted > 0) {
    await writeInvoices()
  }
  return deleted
}

// Bulk: restore all trashed invoices
export async function restoreAllTrashed(): Promise<number> {
  await readInvoices()
  let count = 0
  invoices.forEach(inv => {
    if (inv.metadata.status === 'trashed') {
      inv.metadata.status = inv.metadata.originalStatus || 'draft'
      inv.metadata.originalStatus = undefined
      inv.deletedAt = null
      count++
    }
  })
  if (count > 0) {
    await writeInvoices()
  }
  return count
}