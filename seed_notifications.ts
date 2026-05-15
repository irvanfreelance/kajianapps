import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

async function main() {
  console.log('Seeding notification templates...');

  const templates = [
    {
      id: 1,
      event_trigger: 'PRODUCT_CHECKOUT_PENDING',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pesanan Anda dengan kode *{kode_pesanan}* telah berhasil dibuat. Total Pembayaran: *Rp {nominal}*. Metode: {metode}. Silakan klik link berikut untuk melihat detail dan status pesanan: {link_status}. Terima kasih!',
      is_active: true
    },
    {
      id: 2,
      event_trigger: 'PRODUCT_CHECKOUT_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran pesanan Anda (*{kode_pesanan}*) telah berhasil kami terima. Semoga berkah dan terima kasih atas kepercayaannya.',
      is_active: true
    },
    {
      id: 3,
      event_trigger: 'KAJIAN_CHECKOUT_PENDING',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pendaftaran kajian Anda berhasil dicatat dengan ID *{kode_pesanan}*. Total Pembayaran: *Rp {nominal}*. Metode: {metode}. Silakan klik link berikut untuk melihat status dan cara pembayaran: {link_status}. Terima kasih!',
      is_active: true
    },
    {
      id: 4,
      event_trigger: 'KAJIAN_CHECKOUT_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Alhamdulillah {nama}, pembayaran pendaftaran kajian Anda (*{kode_pesanan}*) telah berhasil kami terima. Sampai jumpa di lokasi kajian!',
      is_active: true
    },
    {
      id: 5,
      event_trigger: 'KAJIAN_FREE_SUCCESS',
      channel: 'WHATSAPP',
      message_content: 'Halo {nama}, pendaftaran kajian Anda berhasil (Gratis). ID Registrasi: *{kode_pesanan}*. Sampai jumpa di kajian! Terima kasih.',
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
