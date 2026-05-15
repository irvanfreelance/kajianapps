import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Running xendit migrations...');
  
  const queries = [
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "vendor_payment_id" varchar(255)`,
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_url" text`,
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_checkout_sent" boolean DEFAULT false`,
    `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "is_paid_sent" boolean DEFAULT false`,
    
    `ALTER TABLE "kajian_registrations" ADD COLUMN IF NOT EXISTS "vendor_payment_id" varchar(255)`,
    `ALTER TABLE "kajian_registrations" ADD COLUMN IF NOT EXISTS "payment_url" text`,
    `ALTER TABLE "kajian_registrations" ADD COLUMN IF NOT EXISTS "is_checkout_sent" boolean DEFAULT false`,
    `ALTER TABLE "kajian_registrations" ADD COLUMN IF NOT EXISTS "is_paid_sent" boolean DEFAULT false`,
  ];

  for (const query of queries) {
    try {
      await sql(query);
      console.log('Success:', query);
    } catch (e: any) {
      console.log('Error/Note:', e.message);
    }
  }

  console.log('Migration completed.');
  process.exit(0);
}

main();
