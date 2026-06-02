import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { sql } from './lib/db';

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-');

async function main() {
  console.log('Running series migration...');

  // 1. Create kajian_series table
  try {
    await sql(`
      CREATE TABLE IF NOT EXISTS "kajian_series" (
        "id"          bigserial PRIMARY KEY,
        "title"       varchar(150) NOT NULL,
        "ustadz"      varchar(100) NOT NULL,
        "category"    varchar(50)  NOT NULL,
        "image"       text,
        "description" text,
        "slug"        varchar(200) UNIQUE,
        "created_at"  timestamp DEFAULT NOW()
      );
    `);
    console.log('✓ Table kajian_series created or already exists.');
  } catch (e: any) {
    console.log('kajian_series:', e.message);
  }

  // 2. Add series_type to kajian
  try {
    await sql(`ALTER TABLE "kajian" ADD COLUMN "series_type" varchar(10) DEFAULT 'single' NOT NULL`);
    console.log('✓ Column series_type added to kajian.');
  } catch (e: any) {
    console.log('series_type:', e.message);
  }

  // 3. Add series_id to kajian
  try {
    await sql(`ALTER TABLE "kajian" ADD COLUMN "series_id" bigint REFERENCES kajian_series(id) ON DELETE SET NULL`);
    console.log('✓ Column series_id added to kajian.');
  } catch (e: any) {
    console.log('series_id:', e.message);
  }

  // 4. Add episode_number to kajian
  try {
    await sql(`ALTER TABLE "kajian" ADD COLUMN "episode_number" integer DEFAULT NULL`);
    console.log('✓ Column episode_number added to kajian.');
  } catch (e: any) {
    console.log('episode_number:', e.message);
  }

  // 5. Add description field to kajian (if not exists)
  try {
    await sql(`ALTER TABLE "kajian" ADD COLUMN "description" text`);
    console.log('✓ Column description added to kajian.');
  } catch (e: any) {
    console.log('description:', e.message);
  }

  // ─────────────────────────────────────────────
  // SEED: 3 Kajian Single (type = free)
  // ─────────────────────────────────────────────
  const singleKajians = [
    {
      title: 'Fiqih Shalat Berjamaah',
      ustadz: 'Ustadz Ahmad Zainuddin',
      category: 'Fiqh',
      date: '2026-06-07',
      time: '08:00 - 10:00 WIB',
      type: 'free',
      price: 0,
      spot: 150,
      location: 'Masjid Al-Mukhlisin, Bandung',
      url_zoom: 'https://zoom.us/j/example1',
      url_youtube: 'https://youtube.com/live/example1',
      description: 'Kajian mendalam mengenai tatacara shalat berjamaah, mulai dari niat, shaf, hingga adab-adab yang perlu diperhatikan oleh setiap muslim.',
      image: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=400&q=80',
    },
    {
      title: 'Keutamaan Bulan Dzulhijjah',
      ustadz: 'Ustadz Firanda Andirja',
      category: 'Hadits',
      date: '2026-06-14',
      time: '19:30 - 21:00 WIB',
      type: 'free',
      price: 0,
      spot: 200,
      location: 'Masjid Al-Ikhlas, Jakarta',
      url_zoom: 'https://zoom.us/j/example2',
      url_youtube: 'https://youtube.com/live/example2',
      description: 'Pembahasan hadits-hadits shahih seputar keutamaan 10 hari pertama bulan Dzulhijjah, amalan yang dianjurkan, dan hikmah di baliknya.',
      image: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&q=80',
    },
    {
      title: 'Akidah Ahlus Sunnah Wal Jamaah',
      ustadz: 'Ustadz Khalid Basalamah',
      category: 'Tarbiyah',
      date: '2026-06-21',
      time: '09:00 - 11:00 WIB',
      type: 'free',
      price: 0,
      spot: 300,
      location: 'Masjid Agung At-Tin, Jakarta Timur',
      url_zoom: 'https://zoom.us/j/example3',
      url_youtube: 'https://youtube.com/live/example3',
      description: 'Penjelasan komprehensif mengenai pokok-pokok akidah Ahlus Sunnah wal Jamaah berdasarkan Al-Quran dan Sunnah Nabi shallallahu alaihi wa sallam.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    },
  ];

  for (const k of singleKajians) {
    try {
      const slug = slugify(k.title);
      await sql(`
        INSERT INTO kajian (title, ustadz, category, date, time_display, type, price, spot, filled, image, location, url_zoom, url_youtube, description, slug, series_type, kajian_mode)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10,$11,$12,$13,$14,'single', 'hybrid')
        ON CONFLICT (slug) DO NOTHING
      `, [k.title, k.ustadz, k.category, k.date, k.time, k.type, k.price, k.spot, k.image, k.location, k.url_zoom, k.url_youtube, k.description, slug]);
      console.log(`✓ Seeded single kajian: ${k.title}`);
    } catch (e: any) {
      console.log(`  Error seeding ${k.title}:`, e.message);
    }
  }

  // ─────────────────────────────────────────────
  // SEED: 1 Series + 3 Episodes
  // ─────────────────────────────────────────────
  const seriesData = {
    title: 'Seri Tafsir Juz Amma',
    ustadz: 'Ustadz Adi Hidayat',
    category: 'Tahsin',
    description: 'Seri kajian tafsir komprehensif Juz Amma (Juz 30) — menelaah makna, tafsir, dan kandungan hukum dari setiap surah dengan metode yang mudah dipahami.',
    image: 'https://images.unsplash.com/photo-1585909695284-32d2985ac9c0?w=400&q=80',
    slug: 'seri-tafsir-juz-amma',
  };

  let seriesId: number | null = null;
  try {
    const existing = await sql(`SELECT id FROM kajian_series WHERE slug = $1`, [seriesData.slug]);
    if (existing.length > 0) {
      seriesId = existing[0].id;
      console.log(`✓ Series already exists, id=${seriesId}`);
    } else {
      const res = await sql(`
        INSERT INTO kajian_series (title, ustadz, category, image, description, slug)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id
      `, [seriesData.title, seriesData.ustadz, seriesData.category, seriesData.image, seriesData.description, seriesData.slug]);
      seriesId = res[0].id;
      console.log(`✓ Created series: ${seriesData.title} (id=${seriesId})`);
    }
  } catch (e: any) {
    console.log('Error creating series:', e.message);
  }

  if (seriesId) {
    const episodes = [
      {
        title: 'Tafsir Surat An-Nas & Al-Falaq',
        date: '2026-06-05',
        time: '19:30 - 21:00 WIB',
        episode: 1,
        url_zoom: 'https://zoom.us/j/series-eps1',
        url_youtube: 'https://youtube.com/live/series-eps1',
        description: 'Episode perdana — membahas tafsir dan kandungan hukum Surat An-Nas (manusia) dan Al-Falaq (fajar), dua surat penutup Al-Quran yang sarat makna perlindungan.',
        location: 'Masjid At-Taqwa, Depok',
      },
      {
        title: 'Tafsir Surat Al-Ikhlas & Al-Kafirun',
        date: '2026-06-12',
        time: '19:30 - 21:00 WIB',
        episode: 2,
        url_zoom: 'https://zoom.us/j/series-eps2',
        url_youtube: 'https://youtube.com/live/series-eps2',
        description: 'Episode kedua — menelaah makna tauhid dalam Surat Al-Ikhlas dan prinsip toleransi dalam Surat Al-Kafirun beserta syarat dan batasannya.',
        location: 'Masjid At-Taqwa, Depok',
      },
      {
        title: 'Tafsir Surat Al-Kautsar & Al-Maun',
        date: '2026-06-19',
        time: '19:30 - 21:00 WIB',
        episode: 3,
        url_zoom: 'https://zoom.us/j/series-eps3',
        url_youtube: 'https://youtube.com/live/series-eps3',
        description: 'Episode ketiga — mengkaji nikmat yang Allah berikan melalui Al-Kautsar dan kritik sosial dalam Al-Maun terhadap mereka yang lalai membantu sesama.',
        location: 'Masjid At-Taqwa, Depok',
      },
    ];

    for (const ep of episodes) {
      try {
        const slug = slugify(`${seriesData.slug}-eps-${ep.episode}`);
        await sql(`
          INSERT INTO kajian (title, ustadz, category, date, time_display, type, price, spot, filled, image, location, url_zoom, url_youtube, description, slug, series_type, series_id, episode_number, kajian_mode)
          VALUES ($1,$2,$3,$4,$5,'free',0,200,0,$6,$7,$8,$9,$10,$11,'series',$12,$13, 'hybrid')
          ON CONFLICT (slug) DO NOTHING
        `, [
          ep.title, seriesData.ustadz, seriesData.category,
          ep.date, ep.time, seriesData.image, ep.location,
          ep.url_zoom, ep.url_youtube, ep.description,
          slug, seriesId, ep.episode,
        ]);
        console.log(`✓ Seeded episode ${ep.episode}: ${ep.title}`);
      } catch (e: any) {
        console.log(`  Error seeding episode ${ep.episode}:`, e.message);
      }
    }
  }

  // Update existing kajian to have series_type = 'single' where null
  try {
    await sql(`UPDATE kajian SET series_type = 'single' WHERE series_type IS NULL`);
    console.log('✓ Backfilled series_type = single for existing kajian.');
  } catch (e: any) {
    console.log('Backfill error:', e.message);
  }

  console.log('\n✅ Migration & seed completed!');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
