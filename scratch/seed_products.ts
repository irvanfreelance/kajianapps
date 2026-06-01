import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from '../lib/db';

async function main() {
  console.log('Re-seeding products table...');
  try {
    // 1. Delete dependent order items first to avoid foreign key violations
    try {
      await sql(`DELETE FROM order_items`);
      console.log('Cleared order_items.');
    } catch (e: any) {
      console.log('Note: Error clearing order_items:', e.message);
    }

    // 2. Delete products
    await sql(`DELETE FROM products`);
    console.log('Cleared products.');
    
    // 3. Insert default products
    await sql(`
      INSERT INTO products (id, name, price, old_price, stock, image, category, rating, sold, description, slug) VALUES
      (101, 'Gamis Premium Al-Haramain', 389000, 450000, 45, 'https://images.pexels.com/photos/935985/pexels-photo-935985.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.8, 234, 'Gamis pria bahan katun Madinah premium, nyaman dan adem.', 'gamis-premium-al-haramain'),
      (102, 'Hijab Voal Luxury Edition', 129000, NULL, 120, 'https://images.pexels.com/photos/4992410/pexels-photo-4992410.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.9, 567, 'Hijab voal premium dengan pinggiran laser cut.', 'hijab-voal-luxury-edition'),
      (103, 'Tumbler Dakwah ''Istiqomah''', 89000, 120000, 30, 'https://images.pexels.com/photos/1342529/pexels-photo-1342529.jpeg?auto=compress&cs=tinysrgb&w=600', 'Merchandise', 4.7, 189, 'Tumbler stainless 500ml dengan kaligrafi motivasi.', 'tumbler-dakwah-istiqomah'),
      (104, 'Minyak Wangi Oud Al-Madinah', 175000, NULL, 50, 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg?auto=compress&cs=tinysrgb&w=600', 'Parfum', 4.9, 412, 'Parfum non-alkohol aroma oud premium dari Madinah.', 'minyak-wangi-oud-al-madinah'),
      (105, 'Sajadah Travel Premium', 159000, 199000, 60, 'https://images.pexels.com/photos/13508493/pexels-photo-13508493.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.8, 321, 'Sajadah lipat portable dengan kompas kiblat built-in.', 'sajadah-travel-premium'),
      (106, 'Buku ''Jalan Menuju Jannah''', 95000, NULL, 80, 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?auto=compress&cs=tinysrgb&w=600', 'Buku', 4.6, 876, 'Buku best-seller panduan amal yaumiyah lengkap.', 'buku-jalan-menuju-jannah'),
      (107, 'Koko Anak Seri Ramadhan', 145000, 175000, 25, 'https://images.pexels.com/photos/8164741/pexels-photo-8164741.jpeg?auto=compress&cs=tinysrgb&w=600', 'Fashion', 4.7, 198, 'Baju koko anak motif islami, bahan adem dan lembut.', 'koko-anak-seri-ramadhan'),
      (108, 'Tasbih Digital Premium', 65000, NULL, 150, 'https://images.pexels.com/photos/8164585/pexels-photo-8164585.jpeg?auto=compress&cs=tinysrgb&w=600', 'Ibadah', 4.5, 543, 'Tasbih digital dengan counter and pengingat dzikir.', 'tasbih-digital-premium')
    `);
    console.log('Inserted default products.');
    
    // 4. Update products sequence
    await sql(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
    console.log('Reset products ID sequence.');

    // 5. Try inserting default order items back
    try {
      await sql(`
        INSERT INTO order_items (order_id, product_id, qty, price) VALUES 
        (1, 101, 1, 389000), 
        (2, 108, 2, 65000),  
        (3, 105, 1, 159000), 
        (4, 102, 2, 129000), 
        (4, 106, 2, 96000)
      `);
      console.log('Inserted default order_items.');
    } catch (e: any) {
      console.log('Note: Skipping order_items seeding (orders might have been cleared):', e.message);
    }

    console.log('Products re-seeded successfully!');
  } catch (e: any) {
    console.error('Error seeding products:', e);
  }
  process.exit(0);
}

main();
