import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Nama dan Slug kategori wajib diisi' }, { status: 400 });
    }

    // Check if name or slug already exists
    const existing = await sql(
      'SELECT * FROM kajian_categories WHERE LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($2)',
      [name, slug]
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Nama atau Slug kategori sudah digunakan' }, { status: 400 });
    }

    await sql(
      'INSERT INTO kajian_categories (name, slug) VALUES ($1, $2)',
      [name, slug]
    );

    // Invalidate caches
    try {
      await redis.flushall();
    } catch (e) {
      console.error('Redis flush failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error creating kajian category:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
