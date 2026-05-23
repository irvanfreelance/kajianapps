import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const list = await sql(
      `SELECT o.id as order_id, o.order_code, o.rating, o.testimonial, o.testimonial_images, o.testimonial_video, o.created_at as order_date,
              u.name as user_name, u.email as user_email,
              (
                SELECT json_agg(json_build_object('product_name', p.name, 'product_id', p.id))
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                WHERE oi.order_id = o.id
              ) as products
       FROM orders o
       JOIN users u ON u.id = o.user_id
       WHERE o.rating IS NOT NULL
       ORDER BY o.created_at DESC`
    );

    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    await sql(
      `UPDATE orders SET rating = NULL, testimonial = NULL, testimonial_images = NULL, testimonial_video = NULL WHERE id = CAST($1 AS bigint)`,
      [orderId]
    );

    return NextResponse.json({ success: true, message: 'Testimonial deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
