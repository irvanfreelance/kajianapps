import { Pool } from 'pg';

declare global {
  var pgPool: Pool | undefined;
}

const pool = globalThis.pgPool || new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  ssl: (process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1')) ? false : { rejectUnauthorized: false },
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.pgPool = pool;
}

export const sql = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
};

export const rawQuery = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result; // returns full result object including rowCount
  } finally {
    client.release();
  }
};
