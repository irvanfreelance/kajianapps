import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing product id' }, { status: 400 });
    }

    await sql('DELETE FROM products WHERE id = $1', [id]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    if (error.code === '23503') {
      return NextResponse.json({ 
        success: false, 
        error: 'Produk ini tidak dapat dihapus karena sudah memiliki riwayat transaksi/pesanan. Silakan nonaktifkan produk atau edit detailnya saja.' 
      }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
