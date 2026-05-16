import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const provinceId = searchParams.get('provinceId');

  if (!RAJAONGKIR_API_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key not configured' }, { status: 500 });
  }

  if (!provinceId) {
    return NextResponse.json({ error: 'Province ID is required' }, { status: 400 });
  }

  const cacheKey = `rajaongkir:cities:komerce:${provinceId}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
  } catch (err) {
    console.error('Redis error:', err);
  }

  try {
    const res = await fetch(`${BASE_URL}/destination/city/${provinceId}`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    const data = await res.json();

    if (data.meta?.code === 200) {
      const cities = data.data.map((c: any) => ({
        city_id: c.id.toString(),
        city_name: c.name,
        type: '' // Komerce doesn't seem to provide type (Kota/Kabupaten) separately in this endpoint
      }));
      
      try {
        await redis.set(cacheKey, cities); // Forever cache
      } catch (err) {
        console.error('Redis set error:', err);
      }
      return NextResponse.json(cities);
    }

    return NextResponse.json({ error: data.meta?.message || 'Failed to fetch cities' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
