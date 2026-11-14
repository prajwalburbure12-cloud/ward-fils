import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export function resolveDbConfig() {
  const host =
    process.env.SQL_HOST ||
    process.env.PGHOST ||
    process.env.POSTGRES_HOST ||
    '';
  const user =
    process.env.SQL_USER ||
    process.env.PGUSER ||
    process.env.POSTGRES_USER ||
    '';
  const password =
    process.env.SQL_PASSWORD ||
    process.env.PGPASSWORD ||
    process.env.POSTGRES_PASSWORD ||
    '';
  const database =
    process.env.SQL_DB_NAME ||
    process.env.PGDATABASE ||
    process.env.POSTGRES_DATABASE ||
    '';

  const isLocalOrSocket =
    !host ||
    host.startsWith('/') ||
    host === 'localhost' ||
    host === '127.0.0.1';

  return {
    host: host || undefined,
    user: user || undefined,
    password: password || undefined,
    database: database || undefined,
    ssl: isLocalOrSocket ? false : { rejectUnauthorized: false },
  };
}

export function isDbConfigured(): boolean {
  const cfg = resolveDbConfig();
  return Boolean(cfg.host && cfg.user && cfg.database);
}

export const createPool = () => {
  if (!global._postgresPool) {
    const cfg = resolveDbConfig();
    global._postgresPool = new Pool({
      host: cfg.host,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      ssl: cfg.ssl,
      max: 10,
      connectionTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });
