import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

export async function GET() {
  const cacheKey = 'api:rajaongkir:origin';
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  } catch {}

  try {
    const settingRes = await sql(`SELECT config_value FROM settings WHERE config_key = 'rajaongkir_origin_district_id'`);
    const originId = settingRes.length > 0 ? settingRes[0].config_value : '1391';

    const nameRes = await sql(`SELECT config_value FROM settings WHERE config_key = 'rajaongkir_origin_name'`);
    let originName = nameRes.length > 0 ? nameRes[0].config_value : '';

    if (!originName) {
      // Default mapping for known origins
      const knownOrigins: Record<string, string> = {
        '1391': 'Depok, Cirebon, Jawa Barat',
        '1392': 'Dukupuntang, Cirebon, Jawa Barat',
        '23': 'Bandung, Jawa Barat'
      };
      originName = knownOrigins[originId] || 'Jawa Barat';
    }

    const data = {
      id: originId,
      name: originName
    };

    try {
      await redis.set(cacheKey, data);
    } catch {}

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
