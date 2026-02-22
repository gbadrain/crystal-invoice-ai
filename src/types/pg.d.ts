// Fallback type declaration for 'pg' when @types/pg is not installed (e.g. NODE_ENV=production locally).
// In CI/Vercel, @types/pg is installed from devDependencies and this file is effectively unused.
declare module 'pg' {
  export class Pool {
    constructor(config?: { connectionString?: string; [key: string]: unknown })
    query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>
    end(): Promise<void>
  }
  export class Client {
    constructor(config?: { connectionString?: string; [key: string]: unknown })
    connect(): Promise<void>
    query(text: string, values?: unknown[]): Promise<{ rows: unknown[] }>
    end(): Promise<void>
  }
}
