import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Running kajian_categories migration...');

  try {
    // 1. Create kajian_categories table
    await sql(`
      CREATE TABLE IF NOT EXISTS "kajian_categories" (
        "id" bigserial PRIMARY KEY,
        "name" varchar(50) NOT NULL UNIQUE,
        "slug" varchar(100) NOT NULL UNIQUE,
        "created_at" timestamp DEFAULT NOW()
      );
    `);
    console.log('Table "kajian_categories" created or already exists.');
  } catch (e: any) {
    console.error('Error creating table "kajian_categories":', e.message);
    process.exit(1);
  }

  try {
    // 2. Create index
    await sql(`
      CREATE INDEX IF NOT EXISTS "idx_kajian_categories_slug" ON "kajian_categories" ("slug");
    `);
    console.log('Index "idx_kajian_categories_slug" created or already exists.');
  } catch (e: any) {
    console.error('Error creating index:', e.message);
  }

  // 3. Seed default categories
  const defaultCategories = [
    { name: 'Fiqh', slug: 'fiqh' },
    { name: 'Tahsin', slug: 'tahsin' },
    { name: 'Sirah', slug: 'sirah' },
    { name: 'Bahasa', slug: 'bahasa' },
    { name: 'Hadits', slug: 'hadits' },
    { name: 'Tarbiyah', slug: 'tarbiyah' }
  ];

  console.log('Seeding default categories...');
  for (const cat of defaultCategories) {
    try {
      await sql(`
        INSERT INTO "kajian_categories" ("name", "slug")
        VALUES ($1, $2)
        ON CONFLICT ("name") DO NOTHING
      `, [cat.name, cat.slug]);
      console.log(`Category seeded: ${cat.name}`);
    } catch (e: any) {
      console.error(`Error seeding category ${cat.name}:`, e.message);
    }
  }

  console.log('Migration and seeding completed.');
  process.exit(0);
}

main();
