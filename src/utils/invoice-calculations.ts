// src/utils/invoice-calculations.ts

/**
 * Performs various calculations related to invoice line items and totals.
 * This utility centralizes all invoice-specific mathematical operations.
 *
 * IMPORTANT: The core calculation logic within this function should NOT be altered
 * as it directly impacts the financial accuracy of the invoices.
 *
 * @param items An array of line items, each expected to have an 'amount' property.
 * @returns The calculated total sum of all item amounts.
 */
export const calculateTotal = (items: any[]) => {
  // Placeholder for invoice calculation logic.
  // This function should accurately sum up all line item amounts.
  // Future enhancements might include tax calculations, discounts, etc.,
  // but the fundamental summing logic must remain robust.
  return items.reduce((sum, item) => sum + item.amount, 0);
};
