/**
 * Orders Service Layer
 * Called directly by Server Components (SSR) and API routes.
 */
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function getOrdersList() {
  const cacheKey = 'api:orders:list';

  try {
    const cached = await redis.get(cacheKey);
    if (cached) return cached as any[];
  } catch { /* Redis optional */ }

  const rows = await sql(`
    SELECT 
      o.id, o.order_code as "orderCode", u.name as "customer", o.order_date as "date", 
      o.total, o.status, o.payment_proof as "paymentProof",
      o.shipping_address as "shippingAddress", o.province_name as "provinceName",
      o.city_name as "cityName", o.courier, o.courier_service as "courierService",
      o.shipping_cost as "shippingCost",
      pm.name as "paymentMethod",
      (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) as items
    FROM orders o
    JOIN users u ON o.user_id = u.id
    LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
    ORDER BY o.id DESC
  `);

  try {
    await redis.set(cacheKey, rows, { ex: 60 });
  } catch { /* Redis optional */ }

  return rows;
}

export async function createOrder(
  userId: number, 
  items: { productId: number, qty: number, price: number }[], 
  paymentMethodId?: number,
  vendorPaymentId?: string,
  paymentUrl?: string,
  shipping?: any
) {
  const orderCode = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const shippingCost = Number(shipping?.shippingCost) || 0;
  const total = subtotal + shippingCost;
  const orderDate = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const orderResult = await sql(`
    INSERT INTO orders (
      order_code, user_id, payment_method_id, vendor_payment_id, payment_url, 
      order_date, total, status,
      shipping_address, province_id, province_name, city_id, city_name, 
      postal_code, courier, courier_service, shipping_cost, total_weight
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id
  `, [
    orderCode, userId, paymentMethodId ?? null, vendorPaymentId ?? null, paymentUrl ?? null, 
    orderDate, total, 'pending',
    shipping?.address || null, shipping?.provinceId || null, shipping?.provinceName || null, 
    shipping?.cityId || null, shipping?.cityName || null, shipping?.postalCode || null, 
    shipping?.courier || null, shipping?.courierService || null, 
    shippingCost, Number(shipping?.totalWeight) || 1000
  ]);

  const orderId = orderResult[0].id;

  for (const item of items) {
    await sql(`
      INSERT INTO order_items (order_id, product_id, qty, price)
      VALUES ($1, $2, $3, $4)
    `, [orderId, item.productId, item.qty, item.price]);
  }

  // Invalidate cache
  try {
    await redis.del('api:orders:list');
  } catch { /* Redis optional */ }

  return { orderId, orderCode };
}

export async function getUserOrders(userId: number) {
  const rows = await sql(`
    SELECT 
      o.id, o.order_code as "orderCode", o.order_date as "date", 
      o.total, o.status,
      (SELECT json_agg(json_build_object('name', p.name, 'qty', oi.qty, 'price', oi.price))
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = o.id) as items
    FROM orders o
    WHERE o.user_id = $1
    ORDER BY o.id DESC
  `, [userId]);
  return rows;
}
