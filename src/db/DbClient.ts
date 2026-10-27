import { Pool, QueryResultRow } from 'pg';

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface Customer {
  id: number;
  email: string;
  full_name: string;
  created_at: Date;
}

export class DbClient {
  private readonly pool: Pool;

  constructor(config: DbConfig) {
    this.pool = new Pool(config);
  }

  static fromEnv(): DbClient {
    return new DbClient({
      host: requireEnv('DB_HOST'),
      port: Number(requireEnv('DB_PORT')),
      user: requireEnv('DB_USER'),
      password: requireEnv('DB_PASSWORD'),
      database: requireEnv('DB_NAME'),
    });
  }

  async query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }

  async findCustomerByEmail(email: string): Promise<Customer | null> {
    const rows = await this.query<Customer>(
      'SELECT id, email, full_name, created_at FROM customers WHERE email = $1',
      [email],
    );
    return rows[0] ?? null;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Is .env present?`);
  }
  return value;
}