import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  try {
    const cacheKey = `api:status:get:${code}`;
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json({ data: cachedData, source: 'cache' });
    }

    let result: any = null;

    if (code.startsWith('ORD-')) {
      const rows = await sql(`
        SELECT o.order_code as code, o.total as amount, o.status, o.payment_method_id, o.payment_url, o.vendor_payment_id,
               pm.name as method_name, pm.logo_url, pm.code as method_code, pm.provider as method_provider,
               CASE 
                 WHEN lower(pm.type) IN ('va', 'virtual_account', 'virtual account') THEN 'VIRTUAL_ACCOUNT'
                 WHEN lower(pm.type) IN ('e_wallet', 'e-wallet', 'ewallet', 'e wallet') THEN 'EWALLET'
                 WHEN lower(pm.type) IN ('qr_code', 'qr', 'qris') THEN 'QR_CODE'
                 WHEN lower(pm.type) IN ('over_the_counter', 'retail_outlet', 'retail', 'otc') THEN 'OVER_THE_COUNTER'
                 ELSE upper(pm.type)
               END as method_type
        FROM orders o
        LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
        WHERE o.order_code = $1
      `, [code]);
      result = rows[0];
    } else if (code.startsWith('REG-')) {
      const idStr = code.replace('REG-', '');
      // Validate it's a numeric ID (REG-19), not a Xendit externalId (REG-LZW1K2PH)
      if (!/^\d+$/.test(idStr)) {
        return NextResponse.json({ error: 'Invalid registration code format' }, { status: 404 });
      }
      const rows = await sql(`
        SELECT kr.id, kr.paid_amount as amount, kr.payment_method_id, kr.payment_url, kr.vendor_payment_id,
               kr.status,
               pm.name as method_name, pm.logo_url, pm.code as method_code, pm.provider as method_provider,
               CASE 
                 WHEN lower(pm.type) IN ('va', 'virtual_account', 'virtual account') THEN 'VIRTUAL_ACCOUNT'
                 WHEN lower(pm.type) IN ('e_wallet', 'e-wallet', 'ewallet', 'e wallet') THEN 'EWALLET'
                 WHEN lower(pm.type) IN ('qr_code', 'qr', 'qris') THEN 'QR_CODE'
                 WHEN lower(pm.type) IN ('over_the_counter', 'retail_outlet', 'retail', 'otc') THEN 'OVER_THE_COUNTER'
                 ELSE upper(pm.type)
               END as method_type
        FROM kajian_registrations kr
        LEFT JOIN payment_methods pm ON kr.payment_method_id = pm.id
        WHERE kr.id = $1
      `, [idStr]);
      
      if (rows.length > 0) {
        result = {
          code: code,
          amount: rows[0].amount,
          status: rows[0].status || 'PENDING',
          payment_method_id: rows[0].payment_method_id,
          payment_url: rows[0].payment_url,
          vendor_payment_id: rows[0].vendor_payment_id,
          method_name: rows[0].method_name,
          method_type: rows[0].method_type,
          logo_url: rows[0].logo_url,
          method_code: rows[0].method_code,
          method_provider: rows[0].method_provider,
        };
      }
    }

    if (!result) {
      return NextResponse.json({ error: "Data not found" }, { status: 404 });
    }

    // Only cache if PAID/FAILED (terminal states); PENDING should always be fresh from DB
    if (result.status === 'PAID' || result.status === 'FAILED') {
      await redis.set(cacheKey, result);
    }

    return NextResponse.json({ data: result, source: 'db' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
