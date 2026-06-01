import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Running product_categories migration...');

  try {
    // 1. Create product_categories table
    await sql(`
      CREATE TABLE IF NOT EXISTS "product_categories" (
        "id" bigserial PRIMARY KEY,
        "name" varchar(50) NOT NULL UNIQUE,
        "slug" varchar(100) NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT NOW()
      );
    `);
    console.log('Table "product_categories" created or already exists.');
  } catch (e: any) {
    console.error('Error creating table "product_categories":', e.message);
    process.exit(1);
  }

  try {
    // 2. Create index
    await sql(`
      CREATE INDEX IF NOT EXISTS "idx_product_categories_slug" ON "product_categories" ("slug");
    `);
    console.log('Index "idx_product_categories_slug" created or already exists.');
  } catch (e: any) {
    console.error('Error creating index:', e.message);
  }

  // 3. Seed default categories
  const defaultCategories = [
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Merchandise', slug: 'merchandise' },
    { name: 'Parfum', slug: 'parfum' },
    { name: 'Ibadah', slug: 'ibadah' },
    { name: 'Buku', slug: 'buku' }
  ];

  console.log('Seeding default product categories...');
  for (const cat of defaultCategories) {
    try {
      await sql(`
        INSERT INTO "product_categories" ("name", "slug")
        VALUES ($1, $2)
        ON CONFLICT ("name") DO NOTHING
      `, [cat.name, cat.slug]);
      console.log(`Product category seeded: ${cat.name}`);
    } catch (e: any) {
      console.error(`Error seeding product category ${cat.name}:`, e.message);
    }
  }

  console.log('Migration and seeding completed.');
  process.exit(0);
}

main();
