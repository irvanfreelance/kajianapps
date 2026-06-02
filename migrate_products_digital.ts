import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  const { redis } = await import('./lib/redis');
  console.log('Running products migration & seeding...');

  try {
    // 1. Add columns to products table if they don't exist
    await sql(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "jenis" varchar(20) DEFAULT 'fisik' NOT NULL`);
    console.log('Column "jenis" added to products (or already exists).');
  } catch (e: any) {
    console.error('Error adding column "jenis":', e.message);
  }

  try {
    await sql(`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "link" text`);
    console.log('Column "link" added to products (or already exists).');
  } catch (e: any) {
    console.error('Error adding column "link":', e.message);
  }

  try {
    // 2. Clear old product, order items, order status history, and order data to avoid foreign key errors
    console.log('Cleaning up old order history, items, orders, and products...');
    await sql(`DELETE FROM "order_status_history"`);
    await sql(`DELETE FROM "order_items"`);
    await sql(`DELETE FROM "orders"`);
    await sql(`DELETE FROM "products"`);

    // 3. Insert fresh seed products
    console.log('Seeding products...');
    await sql(`
      INSERT INTO products (id, name, price, old_price, stock, image, category, rating, sold, description, slug, jenis, link) VALUES
      (101, 'Gamis Premium Al-Haramain', 389000, 450000, 45, 'https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.8, 234, 'Gamis pria bahan katun Madinah premium, nyaman dan adem.', 'gamis-premium-al-haramain', 'fisik', NULL),
      (102, 'Hijab Voal Luxury Edition', 129000, NULL, 120, 'https://images.pexels.com/photos/4992410/pexels-photo-4992410.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.9, 567, 'Hijab voal premium dengan pinggiran laser cut.', 'hijab-voal-luxury-edition', 'fisik', NULL),
      (103, 'Tumbler Dakwah ''Istiqomah''', 89000, 120000, 30, 'https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600', 'Merchandise', 4.7, 189, 'Tumbler stainless 500ml dengan kaligrafi motivasi.', 'tumbler-dakwah-istiqomah', 'fisik', NULL),
      (104, 'Minyak Wangi Oud Al-Madinah', 175000, NULL, 50, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600', 'Parfum', 4.9, 412, 'Parfum non-alkohol aroma oud premium dari Madinah.', 'minyak-wangi-oud-al-madinah', 'fisik', NULL),
      (105, 'Sajadah Travel Premium', 159000, 199000, 60, 'https://images.pexels.com/photos/13508493/pexels-photo-13508493.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.8, 321, 'Sajadah lipat portable dengan kompas kiblat built-in.', 'sajadah-travel-premium', 'fisik', NULL),
      (106, 'Buku ''Jalan Menuju Jannah''', 95000, NULL, 80, 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Buku', 4.6, 876, 'Buku best-seller panduan amal yaumiyah lengkap.', 'buku-jalan-menuju-jannah', 'fisik', NULL),
      (107, 'Koko Anak Seri Ramadhan', 145000, 175000, 25, 'https://images.pexels.com/photos/8164741/pexels-photo-8164741.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.7, 198, 'Baju koko anak motif islami, bahan adem dan lembut.', 'koko-anak-seri-ramadhan', 'fisik', NULL),
      (108, 'Tasbih Digital Premium', 65000, NULL, 150, 'https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.5, 543, 'Tasbih digital dengan counter and pengingat dzikir.', 'tasbih-digital-premium', 'fisik', NULL),
      (109, 'E-Book Panduan Ramadhan', 49000, 75000, 9999, 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Buku', 4.9, 87, 'E-Book panduan lengkap menyambut bulan suci Ramadhan.', 'e-book-panduan-ramadhan', 'digital', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'),
      (110, 'Video Kajian Fiqih Ramadhan', 75000, 100000, 9999, 'https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.8, 45, 'Video rekaman kajian fiqih Ramadhan bersama Ustadz Fitrian Kadir.', 'video-kajian-fiqih-ramadhan', 'digital', 'https://youtu.be/N-B8wI_OPRA')
    `);

    await sql(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);

    // 4. Re-insert fresh seed orders
    console.log('Seeding orders...');
    await sql(`
      INSERT INTO orders (id, order_code, user_id, order_date, total, status) VALUES 
      (1, 'ORD-98273', 1, '2026-05-01', 389000, 'shipped'),
      (2, 'ORD-12837', 2, '2026-04-28', 130000, 'completed'),
      (3, 'ORD-55421', 3, '2026-05-03', 159000, 'pending'),
      (4, 'ORD-77623', 4, '2026-05-03', 450000, 'packed')
    `);
    
    await sql(`SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders))`);

    // 5. Re-insert order items
    console.log('Seeding order items...');
    await sql(`
      INSERT INTO order_items (order_id, product_id, qty, price) VALUES 
      (1, 101, 1, 389000), 
      (2, 108, 2, 65000),  
      (3, 105, 1, 159000), 
      (4, 102, 2, 129000), 
      (4, 106, 2, 96000)
    `);

    // 6. Seed status history
    console.log('Seeding status history...');
    const orderStatuses = [
      { id: 1, status: 'shipped', desc: 'Pesanan Anda sedang dikirim oleh kurir' },
      { id: 2, status: 'completed', desc: 'Pesanan telah selesai dan diterima dengan baik' },
      { id: 3, status: 'pending', desc: 'Pesanan berhasil dibuat (Checkout)' },
      { id: 4, status: 'packed', desc: 'Pesanan Anda sedang dikemas dan disiapkan oleh seller' }
    ];

    for (const ord of orderStatuses) {
      await sql(`
        INSERT INTO order_status_history (order_id, status, description)
        VALUES ($1, 'pending', 'Pesanan berhasil dibuat (Checkout)')
      `, [ord.id]);

      if (ord.status !== 'pending') {
        await sql(`
          INSERT INTO order_status_history (order_id, status, description)
          VALUES ($1, $2, $3)
        `, [ord.id, ord.status, ord.desc]);
      }
    }

    // 7. Flush cache
    await redis.flushall();
    console.log('Redis cache flushed successfully.');

    console.log('Products migration and seeding completed successfully!');
    process.exit(0);
  } catch (err: any) {
    console.error('Error during migration & seeding:', err.message);
    process.exit(1);
  }
}

main();
