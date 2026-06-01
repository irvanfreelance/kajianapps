import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { id, name, slug } = await req.json();
    if (!id || !name || !slug) {
      return NextResponse.json({ success: false, error: 'ID, nama, dan slug kategori wajib diisi' }, { status: 400 });
    }

    // Check if name or slug already exists for another category
    const existing = await sql(
      'SELECT * FROM kajian_categories WHERE (LOWER(name) = LOWER($1) OR LOWER(slug) = LOWER($2)) AND id != $3',
      [name, slug, id]
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: 'Nama atau Slug kategori sudah digunakan oleh kategori lain' }, { status: 400 });
    }

    // Fetch original name to potentially update references in the kajian table
    const orig = await sql('SELECT name FROM kajian_categories WHERE id = $1', [id]);
    if (orig.length === 0) {
      return NextResponse.json({ success: false, error: 'Kategori tidak ditemukan' }, { status: 404 });
    }
    const oldName = orig[0].name;

    await sql(
      'UPDATE kajian_categories SET name = $1, slug = $2 WHERE id = $3',
      [name, slug, id]
    );

    // If the category name changed, update the category field in the kajian table to match
    if (oldName !== name) {
      await sql('UPDATE kajian SET category = $1 WHERE category = $2', [name, oldName]);
    }

    // Invalidate caches
    try {
      await redis.flushall();
    } catch (e) {
      console.error('Redis flush failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating kajian category:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
