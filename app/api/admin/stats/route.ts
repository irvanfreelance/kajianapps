import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch Scorecard Data
    const shopRevenueResult = await sql(`
      SELECT COALESCE(SUM(total), 0)::int as amount 
      FROM orders 
      WHERE status IN ('completed', 'shipped', 'paid')
    `);
    const kajianRevenueResult = await sql(`
      SELECT COALESCE(SUM(paid_amount), 0)::int as amount 
      FROM kajian_registrations 
      WHERE status = 'PAID' OR is_approved = true
    `);
    
    const pendingOrdersResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM orders 
      WHERE status = 'pending'
    `);
    const activeKajianResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM kajian
    `);
    const totalProductsResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM products
    `);
    const totalUsersResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM users
    `);
    const totalRegistrationsPaidResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM kajian_registrations 
      WHERE (status = 'PAID' OR is_approved = true) AND paid_amount > 0
    `);
    const totalRegistrationsFreeResult = await sql(`
      SELECT COUNT(*)::int as count 
      FROM kajian_registrations 
      WHERE (status = 'PAID' OR is_approved = true) AND paid_amount = 0
    `);

    const shopRevenue = shopRevenueResult[0]?.amount || 0;
    const kajianRevenue = kajianRevenueResult[0]?.amount || 0;
    const totalRevenue = shopRevenue + kajianRevenue;
    const pendingOrders = pendingOrdersResult[0]?.count || 0;
    const activeKajian = activeKajianResult[0]?.count || 0;
    const totalProducts = totalProductsResult[0]?.count || 0;
    const totalUsers = totalUsersResult[0]?.count || 0;
    const totalRegistrationsPaid = totalRegistrationsPaidResult[0]?.count || 0;
    const totalRegistrationsFree = totalRegistrationsFreeResult[0]?.count || 0;

    // 2. Fetch Line Chart Data: Daily revenue trend for the last 30 days
    const dailyShopResult = await sql(`
      SELECT 
        DATE(created_at) as date, 
        SUM(total)::int as amount
      FROM orders 
      WHERE status IN ('completed', 'shipped', 'paid')
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    const dailyKajianResult = await sql(`
      SELECT 
        DATE(registered_at) as date, 
        SUM(paid_amount)::int as amount
      FROM kajian_registrations 
      WHERE (status = 'PAID' OR is_approved = true)
        AND registered_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(registered_at)
      ORDER BY date ASC
    `);

    // Merge line chart daily data
    const last30Days: any[] = [];
    const shopMap = new Map<string, number>();
    const kajianMap = new Map<string, number>();

    dailyShopResult.forEach((row: any) => {
      // row.date is a Date object or string YYYY-MM-DD
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      shopMap.set(dateStr, row.amount);
    });

    dailyKajianResult.forEach((row: any) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      kajianMap.set(dateStr, row.amount);
    });

    // Populate all 30 days up to today
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Format date for user display: e.g. "02 Jun"
      const day = d.getDate();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const label = `${day} ${monthNames[d.getMonth()]}`;

      const shopAmt = shopMap.get(dateStr) || 0;
      const kajianAmt = kajianMap.get(dateStr) || 0;

      last30Days.push({
        date: dateStr,
        label,
        shop: shopAmt,
        kajian: kajianAmt,
        total: shopAmt + kajianAmt
      });
    }

    // 3. Fetch Bar Chart Data: Top 5 Kajian Kuota vs Terisi
    const topKajianResult = await sql(`
      SELECT 
        title, 
        spot, 
        filled
      FROM kajian
      ORDER BY filled DESC, spot DESC
      LIMIT 5
    `);

    const topKajian = topKajianResult.map((k: any) => ({
      name: k.title.length > 25 ? k.title.substring(0, 22) + "..." : k.title,
      kuota: k.spot || 0,
      terisi: k.filled || 0
    }));

    // 4. Fetch Pie Chart Data 1: Payment Method Distribution
    const paymentMethodsResult = await sql(`
      SELECT 
        pm.name as name,
        COUNT(*)::int as count
      FROM (
        SELECT payment_method_id FROM orders WHERE payment_method_id IS NOT NULL
        UNION ALL
        SELECT payment_method_id FROM kajian_registrations WHERE payment_method_id IS NOT NULL AND paid_amount > 0
      ) combined
      JOIN payment_methods pm ON combined.payment_method_id = pm.id
      GROUP BY pm.name
      ORDER BY count DESC
    `);

    // 5. Fetch Pie Chart Data 2: Demographics (Gender)
    const demographicsResult = await sql(`
      SELECT 
        CASE 
          WHEN LOWER(gender) IN ('laki-laki', 'l', 'pria', 'male') THEN 'Ikhwan (Pria)'
          WHEN LOWER(gender) IN ('perempuan', 'p', 'wanita', 'female') THEN 'Akhwat (Wanita)'
          ELSE 'Tidak Mengisi'
        END as name,
        COUNT(*)::int as count
      FROM users
      GROUP BY 
        CASE 
          WHEN LOWER(gender) IN ('laki-laki', 'l', 'pria', 'male') THEN 'Ikhwan (Pria)'
          WHEN LOWER(gender) IN ('perempuan', 'p', 'wanita', 'female') THEN 'Akhwat (Wanita)'
          ELSE 'Tidak Mengisi'
        END
      ORDER BY count DESC
    `);

    // 6. Fetch Recent Orders (First 4)
    const recentOrders = await sql(`
      SELECT 
        o.id, 
        o.order_code as "orderCode", 
        u.name as "customer", 
        o.order_date as "date", 
        o.total, 
        o.status,
        (SELECT json_agg(json_build_object('name', p.name, 'qty', oi.qty, 'price', oi.price))
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = o.id) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 4
    `);
    // 7. Fetch Upcoming Kajian (First 3)
    const recentKajian = await sql(`
      SELECT 
        id, 
        title, 
        ustadz, 
        date, 
        time_display, 
        image, 
        spot, 
        filled
      FROM kajian
      ORDER BY id DESC
      LIMIT 3
    `);

    return NextResponse.json({
      success: true,
      scorecard: {
        totalRevenue,
        shopRevenue,
        kajianRevenue,
        pendingOrders,
        activeKajian,
        totalProducts,
        totalUsers,
        totalRegistrationsPaid,
        totalRegistrationsFree
      },
      charts: {
        revenueTrend: last30Days,
        kajianPopularity: topKajian,
        paymentMethods: paymentMethodsResult,
        demographics: demographicsResult
      },
      recentOrders,
      recentKajian
    });
  } catch (error: any) {
    console.error("Dashboard Stats Fetch Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
