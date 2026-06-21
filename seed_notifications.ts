import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Seeding notification templates...');

  const templates = [
    {
      id: 1,
      event_trigger: 'PRODUCT_CHECKOUT_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran pesanan Anda (*{kode_pesanan}*) telah berhasil kami terima. Semoga berkah dan terima kasih atas kepercayaannya.',
      is_active: true
    },
    {
      id: 2,
      event_trigger: 'PRODUCT_PAID',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pembayaran untuk pesanan Anda (*{kode_pesanan}*) sebesar *Rp {nominal}* telah berhasil kami verifikasi dan diterima. Kami akan segera memproses dan mengemas pesanan Anda. Terima kasih!',
      is_active: true
    },
    {
      id: 3,
      event_trigger: 'KAJIAN_CHECKOUT_PENDING',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pendaftaran kajian Anda dengan kode {kode_pesanan} sedang menunggu pembayaran sebesar Rp {nominal} via {metode}. Status: {link_status}',
      is_active: true
    },
    {
      id: 4,
      event_trigger: 'KAJIAN_FREE_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pendaftaran kajian Anda berhasil! Kode pendaftaran: {kode_pesanan}. Sampai jumpa di majelis.',
      is_active: true
    },
    {
      id: 5,
      event_trigger: 'PRODUCT_CHECKOUT_PENDING',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pesanan produk Anda dengan kode {kode_pesanan} sedang menunggu pembayaran sebesar Rp {nominal} via {metode}. Status: {link_status}',
      is_active: true
    },
    {
      id: 6,
      event_trigger: 'KAJIAN_PAID_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran kajian dengan kode {kode_pesanan} telah kami terima. Anda sudah terdaftar sebagai peserta resmi.',
      is_active: true
    },
    {
      id: 7,
      event_trigger: 'PRODUCT_SUCCESS_PAID',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran produk dengan kode {kode_pesanan} telah kami terima. Pesanan Anda akan segera kami proses.',
      is_active: true
    },
    {
      id: 8,
      event_trigger: 'KAJIAN_CHECKOUT_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran pendaftaran kajian Anda (*{kode_pesanan}*) telah berhasil kami terima. Sampai jumpa di lokasi kajian!',
      is_active: true
    }
  ];

  try {
    await sql(`DELETE FROM notification_templates`);
    console.log('Cleared existing templates');
  } catch (e) {}

  for (const t of templates) {
    try {
      await sql(`
        INSERT INTO "public"."notification_templates" ("id", "event_trigger", "channel", "message_content", "is_active") 
        VALUES ($1, $2, $3, $4, $5)
      `, [t.id, t.event_trigger, t.channel, t.message_content, t.is_active]);
      console.log(`Seeded ${t.event_trigger}`);
    } catch (e: any) {
      console.error(`Error seeding ${t.event_trigger}:`, e.message);
    }
  }

  // Update sequence
  try {
    await sql(`SELECT setval('notification_templates_id_seq', (SELECT MAX(id) FROM notification_templates));`);
  } catch (e) {}

  console.log('Seed completed.');
  process.exit(0);
}

main();
