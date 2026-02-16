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

export async function getAllInvoices(): Promise<Invoice[]> {
  await readInvoices()
  return invoices
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  await readInvoices()
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
  invoices[index] = { ...invoices[index], ...updates, _id: id }
  await writeInvoices()
  return invoices[index]
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
