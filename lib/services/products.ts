/**
 * Products Service Layer
 * Called directly by Server Components (SSR) and API routes.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getProductsList() {
  const cacheKey = 'api:products:list';

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  const rows = await sql(`
    SELECT id, name, price, old_price, stock, image,
           category, rating, sold, description, slug
    FROM products
    ORDER BY id ASC
  `);

  try {
    await redis.set(cacheKey, rows, { ex: 300 });
  } catch { /* Redis optional */ }

  return rows;
}

export async function getProductBySlug(slug: string) {
  const rows = await sql(
    `SELECT * FROM products WHERE slug = $1`,
    [slug]
  );
  return rows[0] ?? null;
}

export async function getProductById(id: string | number) {
  const rows = await sql(
    `SELECT * FROM products WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}
