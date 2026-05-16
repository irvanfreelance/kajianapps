import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET() {
  try {
    const settingRes = await sql(`SELECT config_value FROM settings WHERE config_key = 'rajaongkir_origin_district_id'`);
    const originId = settingRes.length > 0 ? settingRes[0].config_value : '1391';

    // We need to find the name. Since we don't have a direct "get district by ID" endpoint,
    // we have to rely on a hardcoded mapping for the origin or a search.
    // However, for 1391 and 1392, I'll try to provide the name if I can find it.
    
    // Default mapping for known origins
    const knownOrigins: Record<string, string> = {
      '1391': 'Depok, Cirebon',
      '1392': 'Dukupuntang, Cirebon',
      '23': 'Bandung'
    };

    return NextResponse.json({
      id: originId,
      name: knownOrigins[originId] || 'Jawa Barat'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
