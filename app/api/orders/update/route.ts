import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const result = await sql(`
      UPDATE orders 
      SET status = $1
      WHERE order_code = $2 OR id::text = $2
      RETURNING *
    `, [status, id]);

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
