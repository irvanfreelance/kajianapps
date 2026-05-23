import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderCode, rating, testimonial, images, video } = await request.json();

    if (!orderCode) {
      return NextResponse.json({ error: 'Order Code/ID is required' }, { status: 400 });
    }

    if (rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Get order and check ownership
    const dbUser = await sql('SELECT id FROM users WHERE email = $1', [session.user.email]);
    if (!dbUser || dbUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = dbUser[0].id;

    const orderRows = await sql('SELECT * FROM orders WHERE (order_code = $1 OR id = CAST($2 AS bigint)) AND user_id = $3', [
      orderCode, 
      isNaN(Number(orderCode)) ? -1 : Number(orderCode), 
      userId
    ]);

    if (!orderRows || orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 });
    }

    const order = orderRows[0];

    // Update order with testimonial info
    await sql(
      'UPDATE orders SET rating = $1, testimonial = $2, testimonial_images = $3, testimonial_video = $4 WHERE id = $5',
      [
        parseInt(rating),
        testimonial || null,
        images || null,
        video || null,
        order.id
      ]
    );

    return NextResponse.json({ success: true, message: 'Testimonial successfully submitted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
