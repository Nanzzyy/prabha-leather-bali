import { IProductRepository } from '../types/repository';
import { PostgresAdapter } from './PostgresAdapter';

// Singleton instance to avoid multiple DB connections in dev
let repositoryInstance: IProductRepository | null = null;

export function getProductRepository(): IProductRepository {
  if (repositoryInstance) return repositoryInstance;

  const driver = process.env.DATA_SOURCE_DRIVER || 'postgres';

  switch (driver) {
    case 'postgres':
      repositoryInstance = new PostgresAdapter();
      break;
    case 'sheets':
      // repositoryInstance = new SheetsAdapter();
      throw new Error("Sheets driver not yet implemented.");
    case 'supabase':
      // repositoryInstance = new SupabaseAdapter();
      throw new Error("Supabase driver not yet implemented.");
    default:
      console.warn(`Driver ${driver} unknown, defaulting to postgres.`);
      repositoryInstance = new PostgresAdapter();
  }

  return repositoryInstance;
}
