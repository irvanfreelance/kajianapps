import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing order ID or code' }, { status: 400 });
    }

    const rows = await sql(`
      SELECT 
        o.id, 
        o.order_code as "orderCode", 
        o.order_date as "date", 
        o.total, 
        o.status, 
        o.payment_proof as "paymentProof",
        o.shipping_address as "shippingAddress", 
        o.province_name as "provinceName",
        o.city_name as "cityName", 
        o.subdistrict_name as "subdistrictName",
        o.postal_code as "postalCode", 
        o.courier, 
        o.courier_service as "courierService",
        o.shipping_cost as "shippingCost", 
        o.resi,
        o.rating,
        o.testimonial,
        o.testimonial_images as "testimonialImages",
        o.testimonial_video as "testimonialVideo",
        pm.name as "paymentMethod",
        pm.logo_url as "paymentLogo",
        u.name as "customerName", 
        u.email as "customerEmail", 
        u.phone as "customerPhone",
        (SELECT json_agg(json_build_object(
                  'id', oi.id,
                  'name', p.name, 
                  'qty', oi.qty, 
                  'price', oi.price,
                  'image', p.image
                ))
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = o.id) as items,
        (SELECT json_agg(json_build_object(
                  'status', osh.status, 
                  'description', osh.description, 
                  'createdAt', osh.created_at
                ) ORDER BY osh.id ASC)
         FROM order_status_history osh
         WHERE osh.order_id = o.id) as history
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
      WHERE o.id::text = $1 OR o.order_code = $1
      LIMIT 1
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
