import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  try {
    const cacheKey = 'api:products:list';
    
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ success: true, data: cachedData, source: 'cache' });
    }

    const rows = await sql(`
      SELECT 
        id, name, price, old_price as "oldPrice", stock, image, 
        category, rating, sold, description, slug
      FROM products 
      ORDER BY id ASC
    `);

    await redis.set(cacheKey, rows, { ex: 300 });

    return NextResponse.json({ success: true, data: rows, source: 'db' });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
