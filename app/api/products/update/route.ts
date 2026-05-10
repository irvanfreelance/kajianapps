import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const slugify = (text: string) => text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, price, oldPrice, stock, image } = body;

    if (!id || !name || !category || price === undefined || stock === undefined || !image) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const slug = slugify(name);

    const result = await sql(`
      UPDATE products 
      SET name = $1, category = $2, price = $3, old_price = $4, 
          stock = $5, image = $6, slug = $7
      WHERE id = $8
      RETURNING *
    `, [name, category, price, oldPrice || null, stock, image, slug, id]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
