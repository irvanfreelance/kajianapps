import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from '../lib/db';

async function main() {
  try {
    console.log('--- Orders ---');
    const orders = await sql('SELECT id, order_code, status, order_date, created_at FROM orders ORDER BY id DESC LIMIT 5');
    console.log(orders);

    console.log('\n--- Order Status History ---');
    const history = await sql('SELECT * FROM order_status_history ORDER BY id DESC LIMIT 10');
    console.log(history);

    console.log('\n--- Joined Data ---');
    const joined = await sql(`
      SELECT 
        o.id, o.order_code, o.status,
        (SELECT json_agg(json_build_object('status', osh.status, 'description', osh.description, 'createdAt', osh.created_at) ORDER BY osh.id ASC)
         FROM order_status_history osh
         WHERE osh.order_id = o.id) as history
      FROM orders o
      ORDER BY o.id DESC LIMIT 5
    `);
    console.log(JSON.stringify(joined, null, 2));

  } catch (err: any) {
    console.error('Error:', err.message);
  }
  process.exit(0);
}

main();
