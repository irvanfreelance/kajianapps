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

  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "resi" varchar(100)`);
    console.log('Column resi added to orders.');
  } catch (e: any) {
    console.log('Note: resi in orders might already exist:', e.message);
  }

  // Seed default site_favicon to /badar_favicon.png
  try {
    await sql(`
      INSERT INTO settings (config_key, config_value)
      VALUES ('site_favicon', '/badar_favicon.png')
      ON CONFLICT (config_key) DO UPDATE SET config_value = '/badar_favicon.png'
    `);
    console.log('Default site_favicon seeded.');
  } catch (e: any) {
    console.log('Error seeding site_favicon:', e.message);
  }

  // Seed default site_title to BADAR - Baik Dari Rumah
  try {
    await sql(`
      INSERT INTO settings (config_key, config_value)
      VALUES ('site_title', 'BADAR - Baik Dari Rumah')
      ON CONFLICT (config_key) DO UPDATE SET config_value = 'BADAR - Baik Dari Rumah'
    `);
    console.log('Default site_title seeded.');
  } catch (e: any) {
    console.log('Error seeding site_title:', e.message);
  }

  // Seed default whatsapp_support to 6281222527915
  try {
    await sql(`
      INSERT INTO settings (config_key, config_value)
      VALUES ('whatsapp_support', '6281222527915')
      ON CONFLICT (config_key) DO NOTHING
    `);
    console.log('Default whatsapp_support seeded.');
  } catch (e: any) {
    console.log('Error seeding whatsapp_support:', e.message);
  }

  // Seed status history for existing orders if empty
  try {
    const orders = await sql(`SELECT id, status FROM orders`);
    for (const order of orders) {
      const historyCount = await sql(`SELECT count(*) FROM order_status_history WHERE order_id = $1`, [order.id]);
      if (parseInt(historyCount[0].count) === 0) {
        console.log(`Seeding history for Order ID ${order.id} with status ${order.status}...`);
        const statuses = ['pending', 'paid', 'packed', 'shipped', 'completed'];
        const statusIdx = statuses.indexOf(order.status.toLowerCase());
        
        const historySteps = [
          { status: 'pending', description: 'Pesanan berhasil dibuat (Checkout)' },
          { status: 'paid', description: 'Pembayaran berhasil dikonfirmasi (Lunas)' },
          { status: 'packed', description: 'Pesanan Anda sedang dikemas dan disiapkan oleh seller' },
          { status: 'shipped', description: 'Pesanan Anda sedang dikirim oleh kurir' },
          { status: 'completed', description: 'Pesanan telah selesai dan diterima dengan baik' }
        ];

        for (let i = 0; i <= statusIdx; i++) {
          if (i >= 0 && i < historySteps.length) {
            const step = historySteps[i];
            await sql(`
              INSERT INTO order_status_history (order_id, status, description, created_at)
              VALUES ($1, $2, $3, NOW() - INTERVAL '${(statusIdx - i) * 2} hours')
            `, [order.id, step.status, step.description]);
          }
        }
      }
    }
    console.log('Order status history seeded for existing orders.');
  } catch (e: any) {
    console.log('Error seeding order status history:', e.message);
  }

  // Add testimonial columns to orders table
  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "rating" integer`);
    console.log('Column rating added to orders.');
  } catch (e: any) {
    console.log('Note: rating in orders might already exist:', e.message);
  }

  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "testimonial" text`);
    console.log('Column testimonial added to orders.');
  } catch (e: any) {
    console.log('Note: testimonial in orders might already exist:', e.message);
  }

  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "testimonial_images" text`);
    console.log('Column testimonial_images added to orders.');
  } catch (e: any) {
    console.log('Note: testimonial_images in orders might already exist:', e.message);
  }

  try {
    await sql(`ALTER TABLE "orders" ADD COLUMN "testimonial_video" text`);
    console.log('Column testimonial_video added to orders.');
  } catch (e: any) {
    console.log('Note: testimonial_video in orders might already exist:', e.message);
  }

  // Add attendance tracking fields to kajian_registrations
  try {
    await sql(`ALTER TABLE "kajian_registrations" ADD COLUMN "is_hadir" boolean DEFAULT FALSE`);
    console.log('Column is_hadir added to kajian_registrations.');
  } catch (e: any) {
    console.log('Note: is_hadir might already exist:', e.message);
  }

  try {
    await sql(`ALTER TABLE "kajian_registrations" ADD COLUMN "checked_in_at" timestamp NULL`);
    console.log('Column checked_in_at added to kajian_registrations.');
  } catch (e: any) {
    console.log('Note: checked_in_at might already exist:', e.message);
  }

  console.log('Migration completed.');
  process.exit(0);
}

main();
