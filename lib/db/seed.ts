import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  const client = await pool.connect();
  try {
    const sqlPath = path.join(process.cwd(), 'refs', 'kajian.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running seed script...');
    await client.query(sql);
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Error running seed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
