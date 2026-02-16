// server/mocks/mockDb.ts

import { v4 as uuidv4 } from 'uuid'
import { Invoice } from '../../src/utils/invoice-types'

// Simple mock for ObjectId, just uses UUID for string IDs
class ObjectId {
  private _id: string;
  constructor(id?: string) {
    this._id = id || uuidv4();
  }

  toString(): string {
    return this._id;
  }

  toHexString(): string {
    return this._id; // For simplicity, return UUID as hex string
  }

  equals(other: ObjectId): boolean {
    return this._id === other._id;
  }
}

class MockCursor<T> implements AsyncIterable<T> {
  private _data: T[];
  private _position: number = 0;
  private _limit: number | null = null;

  constructor(data: T[]) {
    this._data = data.slice(); // Copy to avoid modifying original array
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T>> {
    if (this._limit !== null && this._position >= this._limit) {
      return { value: undefined, done: true };
    }

    if (this._position >= this._data.length) {
      return { value: undefined, done: true };
    }

    const value = this._data[this._position];
    this._position++;
    return { value, done: false };
  }

  limit(limitValue: number): MockCursor<T> {
    if (limitValue > 0) {
      this._limit = limitValue;
    }
    return this;
  }

  async toArray(): Promise<T[]> {
    const data = this._limit !== null ? this._data.slice(0, this._limit) : this._data;
    return data;
  }

  // For simplicity, not implementing full explain functionality
  explain(): object {
    return {
      explainVersion: '1',
      queryPlanner: {
        namespace: 'mock_db.mock_collection',
        indexFilterSet: false,
        parsedQuery: {},
        winningPlan: { stage: 'COLLSCAN', direction: 'forward' },
        rejectedPlans: [],
      },
      ok: 1,
    };
  }
}

class MockCollection<T extends { _id?: ObjectId | string }> {
  public name: string;
  private _data: T[];
  private _id_counter: number = 1; // For simple numeric IDs if ObjectId not used

  constructor(name: string, mock_data: T[] = []) {
    this.name = name;
    this._data = mock_data.map(doc => ({ ...doc })); // Deep copy initial data
  }

  private _applyFilter(query: any): T[] {
    if (!query || Object.keys(query).length === 0) {
      return this._data.slice();
    }

    return this._data.filter(doc => {
      let match = true;
      for (const field in query) {
        if (!match) break; // Short-circuit if already failed

        const criteria = query[field];

        if (field.startsWith('$')) {
          // Handle top-level logical operators like $and, $or
          if (field === '$and') {
            match = (criteria as any[]).every(subQuery => this._matchSubdocument(doc, subQuery));
          } else if (field === '$or') {
            match = (criteria as any[]).some(subQuery => this._matchSubdocument(doc, subQuery));
          } else {
            // Unsupported top-level operator
            match = false;
          }
        } else if (typeof criteria === 'object' && criteria !== null && Object.keys(criteria).some(k => k.startsWith('$'))) {
          // Handle comparison operators like {field: {$gt: value}}
          match = this._applyComparisonOperators(doc, field, criteria);
        } else {
          // Simple equality match
          if (doc[field as keyof T] !== criteria) {
            match = false;
          }
        }
      }
      return match;
    });
  }

  private _matchSubdocument(doc: T, subQuery: any): boolean {
    for (const field in subQuery) {
      const criteria = subQuery[field];
      if (typeof criteria === 'object' && criteria !== null && Object.keys(criteria).some(k => k.startsWith('$'))) {
        if (!this._applyComparisonOperators(doc, field, criteria)) {
          return false;
        }
      } else {
        if (doc[field as keyof T] !== criteria) {
          return false;
        }
      }
    }
    return true;
  }

  private _applyComparisonOperators(doc: T, field: string, criteria: any): boolean {
    const value = doc[field as keyof T];

    for (const op in criteria) {
      const threshold = criteria[op];

      switch (op) {
        case '$gt':
          if (!(value > threshold)) return false;
          break;
        case '$gte':
          if (!(value >= threshold)) return false;
          break;
        case '$lt':
          if (!(value < threshold)) return false;
          break;
        case '$lte':
          if (!(value <= threshold)) return false;
          break;
        case '$eq':
          if (!(value == threshold)) return false;
          break;
        case '$ne':
          if (!(value != threshold)) return false;
          break;
        default:
          // Unsupported comparison operator
          return false;
      }
    }
    return true;
  }

  find(query: any = {}, projection: any = {}): MockCursor<T> {
    let filteredDocs = this._applyFilter(query);

    if (Object.keys(projection).length > 0) {
      filteredDocs = filteredDocs.map(doc => {
        const projectedDoc: Partial<T> = {};
        const inclusionMode = Object.values(projection).some(v => v === 1);

        for (const key in doc) {
          const includeField = true; // Default to include

          if (key in projection) {
            if (key === '_id') {
              if (projection[key] === 0) continue; // Exclude _id
            } else if (inclusionMode) {
              if (projection[key] === 0) continue; // Exclude field in inclusion mode
            } else {
              if (projection[key] === 1) projectedDoc[key] = doc[key]; // Include field in exclusion mode
              continue;
            }
          } else if (inclusionMode) {
            continue; // Exclude fields not explicitly included in inclusion mode
          }
          projectedDoc[key] = doc[key];
        }
        return projectedDoc as T;
      });
    }

    return new MockCursor(filteredDocs);
  }

  async findOne(query: any = {}, projection: any = {}): Promise<T | null> {
    const cursor = this.find(query, projection);
    const result = await cursor.next();
    return result.value || null;
  }

  async insertOne(document: T): Promise<{ insertedId: ObjectId | string }> {
    const newDoc = { ...document };
    if (!newDoc._id) {
      newDoc._id = new ObjectId();
    }
    this._data.push(newDoc);
    return { insertedId: newDoc._id };
  }

  async updateOne(filter: any, update: any, options: { upsert?: boolean } = {}): Promise<{ matchedCount: number; modifiedCount: number; upsertedId?: ObjectId | string }> {
    const docsToUpdate = this._applyFilter(filter);
    let matchedCount = 0;
    let modifiedCount = 0;
    let upsertedId: ObjectId | string | undefined;

    if (docsToUpdate.length > 0) {
      matchedCount = 1;
      const docIndex = this._data.findIndex(d => d === docsToUpdate[0]);
      if (docIndex !== -1) {
        const originalDoc = this._data[docIndex];
        const updatedDoc = { ...originalDoc };

        if (update.$set) {
          Object.assign(updatedDoc, update.$set);
        }
        if (update.$inc) {
          for (const field in update.$inc) {
            if (typeof updatedDoc[field as keyof T] === 'number') {
              (updatedDoc[field as keyof T] as any) += update.$inc[field];
            } else {
              updatedDoc[field as keyof T] = update.$inc[field];
            }
          }
        }
        // Add other update operators as needed

        if (JSON.stringify(originalDoc) !== JSON.stringify(updatedDoc)) {
          this._data[docIndex] = updatedDoc;
          modifiedCount = 1;
        }
      }
    } else if (options.upsert) {
      const newDoc: T = {} as T;
      // Apply filter fields to new document
      for (const field in filter) {
        if (!field.startsWith('$') && typeof filter[field] !== 'object') {
          (newDoc as any)[field] = filter[field];
        }
      }
      if (!newDoc._id) {
        newDoc._id = new ObjectId();
      }
      upsertedId = newDoc._id;

      if (update.$set) {
        Object.assign(newDoc, update.$set);
      }
      if (update.$inc) {
        for (const field in update.$inc) {
          if (typeof (newDoc as any)[field] === 'number') {
            (newDoc as any)[field] += update.$inc[field];
          } else {
            (newDoc as any)[field] = update.$inc[field];
          }
        }
      }
      this._data.push(newDoc);
      matchedCount = 0; // As per MongoDB, upserted counts as 0 matched
      modifiedCount = 1; // And 1 modified (inserted)
    }

    return { matchedCount, modifiedCount, upsertedId };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const docsToDelete = this._applyFilter(filter);
    let deletedCount = 0;

    if (docsToDelete.length > 0) {
      const docToRemove = docsToDelete[0];
      const initialLength = this._data.length;
      this._data = this._data.filter(doc => doc !== docToRemove); // Filter by reference
      if (this._data.length < initialLength) {
        deletedCount = 1;
      }
    }
    return { deletedCount };
  }

  async deleteMany(filter: any): Promise<{ deletedCount: number }> {
    const docsToDelete = this._applyFilter(filter);
    const initialLength = this._data.length;
    const idsToDelete = new Set(docsToDelete.map(doc => doc._id?.toString()));

    this._data = this._data.filter(doc => !idsToDelete.has(doc._id?.toString()));
    const deletedCount = initialLength - this._data.length;

    return { deletedCount };
  }

  async countDocuments(filter: any = {}): Promise<number> {
    return this._applyFilter(filter).length;
  }
}

class MockDatabase {
  public name: string;
  private _collections: { [key: string]: MockCollection<any> } = {};

  constructor(name: string) {
    this.name = name;
  }

  collection<T extends { _id?: ObjectId | string }>(name: string): MockCollection<T> {
    if (!this._collections[name]) {
      this._collections[name] = new MockCollection<T>(name);
    }
    return this._collections[name];
  }

  // For simplicity, not implementing full command functionality
  command(commandName: string, ...args: any[]): object {
    if (commandName === 'ping') {
      return { ok: 1 };
    }
    throw new Error(`MockDatabase command '${commandName}' not implemented.`);
  }
}

class MockMongoClient {
  private _databases: { [key: string]: MockDatabase } = {};

  db(name: string): MockDatabase {
    if (!this._databases[name]) {
      this._databases[name] = new MockDatabase(name);
    }
    return this._databases[name];
  }

  close(): void {
    console.log('MockMongoClient closed.');
  }
}

// Export a singleton instance for easy access
export const mockClient = new MockMongoClient();
export const mockDb = mockClient.db('crystal_invoice_db');
export const invoicesCollection = mockDb.collection<Invoice>('invoices');

// Optional: Pre-populate with some mock data
// invoicesCollection.insertOne({
//   _id: new ObjectId(),
//   client: { name: 'Mock Client 1', email: 'mock1@example.com', address: '123 Mock St', phone: '555-1111' },
//   metadata: { invoiceNumber: 'INV-MOCK-001', issueDate: '2024-01-01', dueDate: '2024-01-31', status: 'draft' },
//   lineItems: [{ id: 'item1', description: 'Mock Service', quantity: 1, rate: 100, amount: 100 }],
//   summary: { subtotal: 100, taxRate: 0, taxAmount: 0, discountRate: 0, discountAmount: 0, total: 100 },
//   notes: 'This is a mock invoice.',
// });
