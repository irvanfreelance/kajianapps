import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET() {
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

    return NextResponse.json({
      id: originId,
      name: originName
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
