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

  // Create order_status_history table
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS "order_status_history" (
        "id" bigserial PRIMARY KEY,
        "order_id" bigint NOT NULL,
        "status" varchar(50) NOT NULL,
        "description" text,
        "created_at" timestamp DEFAULT NOW()
      );
    `);
    console.log('Table order_status_history created or already exists.');
  } catch (e: any) {
    console.log('Error creating table order_status_history:', e.message);
  }

  try {
    await sql(`
      DO $$ BEGIN
        ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" 
        FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log('Foreign key constraint on order_status_history created or already exists.');
  } catch (e: any) {
    console.log('Error adding constraint order_status_history_order_id_fkey:', e.message);
  }

  try {
    await sql(`CREATE INDEX IF NOT EXISTS "idx_order_status_history_order_id" ON "order_status_history" ("order_id")`);
    console.log('Index idx_order_status_history_order_id created or already exists.');
  } catch (e: any) {
    console.log('Error creating index idx_order_status_history_order_id:', e.message);
  }

  console.log('Migration completed.');
  process.exit(0);
}

main();
