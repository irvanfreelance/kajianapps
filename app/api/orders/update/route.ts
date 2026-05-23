import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';
import { enqueueWhatsApp } from '@/lib/fonnte';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, status, resi, description: customDescription } = body;

    if (!id || (!status && resi === undefined && !customDescription)) {
      return NextResponse.json({ success: false, error: 'Missing id, status, resi or description' }, { status: 400 });
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
    const isStatusChanged = status && status.toLowerCase() !== order.status?.toLowerCase();
    const isResiChanged = resi !== undefined && resi !== order.resi;
    const hasCustomDescription = !!customDescription;
    let updatedOrder = order;

    if (isStatusChanged || isResiChanged) {
      const updateFields: string[] = [];
      const queryParams: any[] = [];
      let paramIndex = 1;

      if (status) {
        updateFields.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }
      if (resi !== undefined) {
        updateFields.push(`resi = $${paramIndex}`);
        queryParams.push(resi || null);
        paramIndex++;
      }

      queryParams.push(order.id);
      const updateResult = await sql(`
        UPDATE orders 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `, queryParams);
      
      updatedOrder = updateResult[0];
    }

    if (isStatusChanged || hasCustomDescription) {
      const historyStatus = status || order.status;
      let description = customDescription || '';
      if (!description && status) {
        switch (status.toLowerCase()) {
          case 'paid':
            description = 'Pembayaran berhasil dikonfirmasi (Lunas)';
            break;
          case 'packed':
            description = 'Pesanan Anda sedang dikemas dan disiapkan oleh seller';
            break;
          case 'shipped':
            const currentResi = resi !== undefined ? resi : updatedOrder.resi;
            description = 'Pesanan Anda sedang dikirim oleh kurir' + (currentResi ? ` (No. Resi: ${currentResi})` : '');
            break;
          case 'completed':
            description = 'Pesanan telah selesai dan diterima dengan baik';
            break;
          default:
            description = `Status pesanan diubah menjadi ${status}`;
        }
      }

      if (description) {
        // Insert status history
        await sql(`
          INSERT INTO order_status_history (order_id, status, description)
          VALUES ($1, $2, $3)
        `, [order.id, historyStatus, description]);
      }
    } else if (isResiChanged && resi) {
      // Log resi change to history
      await sql(`
        INSERT INTO order_status_history (order_id, status, description)
        VALUES ($1, $2, $3)
      `, [order.id, order.status, `Nomor resi pengiriman diperbarui menjadi: ${resi}`]);
    }

    // Trigger WhatsApp notification if status changes to paid
    if (status && status.toLowerCase() === 'paid' && !order.is_paid_sent) {
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

    // Flush cache
    await redis.flushall();

    return NextResponse.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
