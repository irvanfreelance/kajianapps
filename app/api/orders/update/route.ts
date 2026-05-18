import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';
import { enqueueWhatsApp } from '@/lib/fonnte';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    // Retrieve order details
    const existingOrders = await sql(`
      SELECT o.*, u.name as user_name, u.phone as user_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.order_code = $1 OR o.id::text = $1
    `, [id]);

    if (existingOrders.length === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const order = existingOrders[0];
    const isChanged = status.toLowerCase() !== order.status?.toLowerCase();
    let updatedOrder = order;

    if (isChanged) {
      // Determine description based on status
      let description = '';
      switch (status.toLowerCase()) {
        case 'paid':
          description = 'Pembayaran berhasil dikonfirmasi (Lunas)';
          break;
        case 'packed':
          description = 'Pesanan Anda sedang dikemas dan disiapkan oleh seller';
          break;
        case 'shipped':
          description = 'Pesanan Anda sedang dikirim oleh kurir';
          break;
        case 'completed':
          description = 'Pesanan telah selesai dan diterima dengan baik';
          break;
        default:
          description = `Status pesanan diubah menjadi ${status}`;
      }

      // Update order status
      const updateResult = await sql(`
        UPDATE orders 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `, [status, order.id]);
      
      updatedOrder = updateResult[0];

      // Insert status history
      await sql(`
        INSERT INTO order_status_history (order_id, status, description)
        VALUES ($1, $2, $3)
      `, [order.id, status, description]);

      // Trigger WhatsApp notification if status changes to paid
      if (status.toLowerCase() === 'paid' && !order.is_paid_sent) {
        try {
          if (order.user_phone) {
            await enqueueWhatsApp({
              eventTrigger: 'PRODUCT_PAID',
              target: order.user_phone,
              variables: {
                nama: order.user_name,
                kode_pesanan: order.order_code,
                nominal: Number(order.total).toLocaleString('id-ID'),
              }
            });

            await sql(`UPDATE orders SET is_paid_sent = true WHERE id = $1`, [order.id]);
            updatedOrder.is_paid_sent = true;
          }
        } catch (waErr) {
          console.error('Failed to send WhatsApp paid notification:', waErr);
        }
      }
    }

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
