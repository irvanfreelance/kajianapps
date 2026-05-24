import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID wajib diisi' }, { status: 400 });
    }

    // ID can be the actual bigserial ID or the orderCode
    await sql(`
      DELETE FROM orders 
      WHERE id = $1 OR order_code = $1::varchar
    `, [id]);

    return NextResponse.json({ success: true, message: 'Pesanan berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
