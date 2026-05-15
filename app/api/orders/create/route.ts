import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';
import { createXenditPaymentRequest, XenditPaymentType } from '@/lib/xendit';
import { enqueueWhatsApp } from '@/lib/fonnte';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'USER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    const { items, paymentMethodId } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    if (!paymentMethodId) {
      return NextResponse.json({ error: 'Metode pembayaran harus dipilih' }, { status: 400 });
    }

    // Get Payment Method Details
    const pmResult = await sql(`SELECT * FROM payment_methods WHERE id = $1`, [paymentMethodId]);
    if (pmResult.length === 0) {
      return NextResponse.json({ error: 'Payment method not found' }, { status: 400 });
    }
    const paymentMethod = pmResult[0];

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
    const adminFeeFlat = Number(paymentMethod.admin_fee_flat) || 0;
    const adminFeePct = Number(paymentMethod.admin_fee_pct) || 0;
    const adminFee = adminFeeFlat + (total * (adminFeePct / 100));
    const grandTotal = Math.round(total + adminFee);

    // Generate a single consistent order code
    const orderCode = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const orderDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const isManual = paymentMethod.provider === 'manual';
    let vendorPaymentId: string | null = null;
    let paymentUrl: string | null = null;

    if (!isManual && paymentMethod.provider?.toLowerCase() === 'xendit') {
      const type = paymentMethod.type?.toLowerCase() || '';
      let xenditType: XenditPaymentType = 'VIRTUAL_ACCOUNT';

      if (type.includes('e_wallet') || type.includes('e-wallet') || type.includes('ewallet')) {
        xenditType = 'EWALLET';
      } else if (type.includes('retail') || type.includes('outlet') || type.includes('over_the_counter')) {
        xenditType = 'OVER_THE_COUNTER';
      } else if (type.includes('qr') || type === 'qr_code') {
        xenditType = 'QR_CODE';
      }

      const xenditRes = await createXenditPaymentRequest({
        externalId: orderCode,
        amount: grandTotal,
        type: xenditType,
        channelCode: paymentMethod.code,
        customerName: session.user.name || 'User',
        customerEmail: session.user.email || undefined,
      });

      vendorPaymentId = xenditRes.id;

      if (xenditType === 'VIRTUAL_ACCOUNT') {
        paymentUrl = xenditRes.payment_method?.virtual_account?.channel_properties?.virtual_account_number ?? null;
      } else if (xenditType === 'EWALLET') {
        const action = xenditRes.actions?.find((a: any) => a.url_type === 'DEEPLINK' || a.action === 'AUTH');
        paymentUrl = action?.url ?? null;
      } else if (xenditType === 'OVER_THE_COUNTER') {
        paymentUrl = xenditRes.payment_method?.over_the_counter?.channel_properties?.payment_code ?? null;
      } else if (xenditType === 'QR_CODE') {
        paymentUrl = JSON.stringify({
          qr_string: xenditRes.payment_method?.qr_code?.channel_properties?.qr_string,
          type: 'qr_code'
        });
      }
    }

    // Insert order with the consistent orderCode
    const orderResult = await sql(`
      INSERT INTO orders (order_code, user_id, payment_method_id, vendor_payment_id, payment_url, order_date, total, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [orderCode, userId, paymentMethodId, vendorPaymentId, paymentUrl, orderDate, grandTotal, 'pending']);

    const orderId = orderResult[0].id;

    // Insert order items
    for (const item of items) {
      await sql(`
        INSERT INTO order_items (order_id, product_id, qty, price)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.productId, item.qty, item.price]);
    }

    // Invalidate orders list cache
    try { await redis.del('api:orders:list'); } catch {}

    // Send WA Notification async
    try {
      const userRes = await sql(`SELECT phone, name FROM users WHERE id = $1`, [userId]);
      const phone = userRes[0]?.phone;
      if (phone) {
        await enqueueWhatsApp({
          eventTrigger: 'PRODUCT_CHECKOUT_PENDING',
          target: phone,
          variables: {
            nama: userRes[0].name,
            kode_pesanan: orderCode,
            nominal: grandTotal.toLocaleString('id-ID'),
            metode: paymentMethod.name,
            link_status: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://kajianapps.vercel.app'}/status/${orderCode}`
          }
        });
        await sql(`UPDATE orders SET is_checkout_sent = true WHERE id = $1`, [orderId]);
      }
    } catch (waErr) {
      console.error('WA Send Error:', waErr);
    }

    return NextResponse.json({ orderId, orderCode });
  } catch (error: any) {
    console.error('Order Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
