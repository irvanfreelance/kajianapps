import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, price, oldPrice, stock, image } = body;

    if (!name || !category || price === undefined || stock === undefined || !image) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(name);

    const result = await sql(`
      INSERT INTO products (name, category, price, old_price, stock, image, rating, sold, slug) 
      VALUES ($1, $2, $3, $4, $5, $6, 5.0, 0, $7)
      RETURNING *
    `, [name, category, price, oldPrice || null, stock, image, slug]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
