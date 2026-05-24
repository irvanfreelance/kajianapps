import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const dummyTestimonials = [
  "Masya Allah, barangnya cepat sampai dan sesuai dengan ekspektasi. Jahitannya rapi dan bahannya sangat nyaman dipakai untuk kajian.",
  "Alhamdulillah, pengiriman super cepat. Paket dibungkus rapi. Produk original dan ukurannya sangat pas di badan saya. Terima kasih!",
  "Sangat memuaskan! Warnanya persis seperti di foto, adem saat dipakai beraktivitas seharian. Insya Allah akan langganan terus.",
  "Bahan bajunya bagus banget, nggak gampang lecek. Cocok dipakai buat kajian atau acara formal. Suami saya juga suka banget.",
  "Kualitas premium dengan harga yang sangat terjangkau. Admin sangat responsif dan ramah saat ditanya ukuran. Jazakumullah khairan."
];

const pexelsImages = [
  "https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=600", 
  "https://images.pexels.com/photos/2752045/pexels-photo-2752045.jpeg?auto=compress&cs=tinysrgb&w=600", 
  "https://images.pexels.com/photos/5418931/pexels-photo-5418931.jpeg?auto=compress&cs=tinysrgb&w=600", 
  "https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=600", 
  "https://images.pexels.com/photos/11135661/pexels-photo-11135661.jpeg?auto=compress&cs=tinysrgb&w=600" 
];

export async function GET() {
  try {
    // Convert up to 5 non-pending orders to completed just so we have data
    await sql(`
      UPDATE orders 
      SET status = 'completed'
      WHERE id IN (
        SELECT id FROM orders WHERE status != 'pending' LIMIT 5
      )
    `);

    // Fetch up to 10 completed orders to seed
    const orders = await sql(`SELECT id FROM orders WHERE status = 'completed' LIMIT 10`);

    if (orders.length === 0) {
      return NextResponse.json({ success: false, message: 'Tidak ada order yang bisa di-seed.' });
    }

    let updatedCount = 0;

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5
      const testimonial = dummyTestimonials[i % dummyTestimonials.length];
      const image = pexelsImages[i % pexelsImages.length];

      await sql(`
        UPDATE orders 
        SET rating = $1, testimonial = $2, testimonial_images = $3
        WHERE id = $4
      `, [rating, testimonial, image, order.id]);

      updatedCount++;
    }

    return NextResponse.json({ success: true, message: `Berhasil menambahkan testimoni ke ${updatedCount} pesanan.` });
  } catch (error: any) {
    console.error('Error seeding testimonials:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
