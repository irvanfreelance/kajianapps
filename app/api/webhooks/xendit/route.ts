import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { enqueueWhatsApp } from '@/lib/fonnte';
import { redis } from '@/lib/redis';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log('[Xendit Webhook] Received:', JSON.stringify(payload).slice(0, 300));

    const data = payload.data || payload;
    const event = payload.event || '';

    // Xendit sends reference_id (our externalId / orderCode)
    const referenceId: string = data.reference_id || data.external_id || '';
    // Xendit payment request id (our vendor_payment_id)
    const vendorId: string = data.id || '';
    const xenditStatus: string = data.status || '';

    if (!referenceId && !vendorId) {
      return NextResponse.json({ message: 'Invalid payload: no reference_id or id found' }, { status: 400 });
    }

    // Normalize Xendit status to our status
    let newStatus: 'PENDING' | 'PAID' | 'FAILED' = 'PENDING';
    if (['SUCCEEDED', 'COMPLETED', 'PAID', 'ACTIVE'].includes(xenditStatus.toUpperCase())) {
      newStatus = 'PAID';
    } else if (['FAILED', 'EXPIRED', 'CANCELED', 'VOIDED'].includes(xenditStatus.toUpperCase())) {
      newStatus = 'FAILED';
    }

    // Only act on meaningful status changes
    if (newStatus === 'PENDING') {
      return NextResponse.json({ status: 'ignored', reason: 'pending event' });
    }

    // Invalidate redis cache using referenceId
    if (referenceId) {
      await redis.del(`api:status:get:${referenceId}`);
    }

    // ── Handle Product Orders (ORD-XXXX) ─────────────────────────────────────
    if (referenceId.startsWith('ORD-') || (!referenceId && vendorId)) {
      let rows: any[] = [];

      if (referenceId.startsWith('ORD-')) {
        rows = await sql(`SELECT id, user_id, status FROM orders WHERE order_code = $1`, [referenceId]);
      } else if (vendorId) {
        rows = await sql(`SELECT id, user_id, status FROM orders WHERE vendor_payment_id = $1`, [vendorId]);
      }

      if (rows.length > 0) {
        const { id: orderId, user_id: userId, status: currentStatus } = rows[0];

        if (currentStatus !== 'PAID' && newStatus === 'PAID') {
          await sql(`UPDATE orders SET status = 'PAID' WHERE id = $1`, [orderId]);

          // Invalidate caches
          await redis.del(`api:status:get:${referenceId}`).catch(() => {});
          await redis.del('api:orders:list').catch(() => {});

          // Send paid WA notification
          try {
            const userRes = await sql(`SELECT phone, name FROM users WHERE id = $1`, [userId]);
            if (userRes[0]?.phone) {
              await enqueueWhatsApp({
                eventTrigger: 'PRODUCT_CHECKOUT_SUCCESS',
                target: userRes[0].phone,
                variables: {
                  nama: userRes[0].name,
                  kode_pesanan: referenceId || `ORD-${orderId}`
                }
              });
              await sql(`UPDATE orders SET is_paid_sent = true WHERE id = $1`, [orderId]);
            }
          } catch (waErr) {
            console.error('WA notification error:', waErr);
          }
        } else if (newStatus === 'FAILED') {
          await sql(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [orderId]);
        }
      } else {
        console.warn('[Webhook] Order not found for:', referenceId || vendorId);
      }
    }

    // ── Handle Kajian Registrations (REG-{numericId}) ─────────────────────────
    else if (referenceId.startsWith('REG-')) {
      const idStr = referenceId.replace('REG-', '');
      let rows: any[] = [];

      if (/^\d+$/.test(idStr)) {
        // Numeric ID (REG-19)
        rows = await sql(`SELECT id, user_id, status, paid_amount FROM kajian_registrations WHERE id = $1`, [idStr]);
      } else {
        // Alphanumeric — old Xendit externalId format; lookup via vendor_payment_id
        rows = await sql(`
          SELECT id, user_id, status, paid_amount FROM kajian_registrations 
          WHERE vendor_payment_id = $1
        `, [vendorId || idStr]);
      }

      if (rows.length > 0) {
        const { id: regId, user_id: userId, status: currentStatus, paid_amount: paidAmount } = rows[0];
        // Update cache key for REG-{numericId}
        await redis.del(`api:status:get:REG-${regId}`).catch(() => {});

        if (currentStatus !== 'PAID' && newStatus === 'PAID') {
          await sql(`UPDATE kajian_registrations SET status = 'PAID', is_approved = true, is_paid_sent = true WHERE id = $1`, [regId]);

          // Send paid WA notification
          try {
            const userRes = await sql(`SELECT phone, name FROM users WHERE id = $1`, [userId]);
            if (userRes[0]?.phone) {
              await enqueueWhatsApp({
                eventTrigger: 'KAJIAN_CHECKOUT_SUCCESS',
                target: userRes[0].phone,
                variables: {
                  nama: userRes[0].name,
                  kode_pesanan: `REG-${regId}`,
                  nominal: Number(paidAmount).toLocaleString('id-ID')
                }
              });
            }
          } catch (waErr) {
            console.error('WA notification error:', waErr);
          }
        } else if (newStatus === 'FAILED') {
          await sql(`UPDATE kajian_registrations SET status = 'FAILED' WHERE id = $1`, [regId]);
        }
      } else {
        console.warn('[Webhook] Kajian registration not found for:', referenceId, 'vendorId:', vendorId);
      }
    }

    // ── Log the payload ───────────────────────────────────────────────────────
    try {
      await sql(`
        INSERT INTO payment_logs (invoice_code, endpoint, request_payload, response_payload, http_status)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        referenceId || vendorId,
        `/api/webhooks/xendit${event ? `:${event}` : ''}`,
        JSON.stringify(payload),
        JSON.stringify({ status: 'success', newStatus }),
        200
      ]);
    } catch (logErr) {
      console.error('payment_logs insert error:', logErr);
    }

    return NextResponse.json({ status: 'success', processed: newStatus });
  } catch (error) {
    console.error('[Xendit Webhook] Error:', error);
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}
