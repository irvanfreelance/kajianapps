import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Running migrations...');
  
  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "payment_method_id" bigint`);
  } catch (e: any) {
    console.log('Note: payment_method_id in orders might already exist:', e.message);
  }

  try {
    await sql(`ALTER TABLE "kajian_registrations" ADD COLUMN "payment_method_id" bigint`);
  } catch (e: any) {
    console.log('Note: payment_method_id in kajian_registrations might already exist:', e.message);
  }

  try {
    await sql(`DO $$ BEGIN
      ALTER TABLE "orders" ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
  } catch (e: any) {
    console.log('Constraint error:', e.message);
  }

  try {
    await sql(`DO $$ BEGIN
      ALTER TABLE "kajian_registrations" ADD CONSTRAINT "kajian_registrations_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
  } catch (e: any) {
    console.log('Constraint error:', e.message);
  }

  console.log('Migration completed.');
  process.exit(0);
}

main();
