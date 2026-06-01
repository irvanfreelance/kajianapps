import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID kategori wajib diisi' }, { status: 400 });
    }

    // Check if category exists
    const categoryRows = await sql('SELECT name FROM kajian_categories WHERE id = $1', [id]);
    if (categoryRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    const categoryName = categoryRows[0].name;

    // Check if any kajian uses this category
    const usageRows = await sql('SELECT id FROM kajian WHERE category = $1 LIMIT 1', [categoryName]);
    if (usageRows.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Kategori "${categoryName}" tidak dapat dihapus karena sedang digunakan oleh beberapa kajian. Silakan ganti kategori kajian tersebut terlebih dahulu.`
      }, { status: 400 });
    }

    await sql('DELETE FROM kajian_categories WHERE id = $1', [id]);

    // Invalidate caches
    try {
      await redis.flushall();
    } catch (e) {
      console.error('Redis flush failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting kajian category:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
