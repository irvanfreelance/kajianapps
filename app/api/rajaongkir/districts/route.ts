import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get('cityId');

  if (!RAJAONGKIR_API_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key not configured' }, { status: 500 });
  }

  if (!cityId) {
    return NextResponse.json({ error: 'City ID is required' }, { status: 400 });
  }

  const cacheKey = `rajaongkir:districts:komerce:${cityId}`;
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
  } catch (err) {
    console.error('Redis error:', err);
  }

  try {
    const res = await fetch(`${BASE_URL}/destination/district/${cityId}`, {
      headers: { key: RAJAONGKIR_API_KEY }
    });
    const data = await res.json();

    if (data.meta?.code === 200) {
      const districts = data.data.map((d: any) => ({
        subdistrict_id: d.id.toString(),
        subdistrict_name: d.name
      }));
      
      try {
        await redis.set(cacheKey, districts); // Forever cache
      } catch (err) {
        console.error('Redis set error:', err);
      }
      return NextResponse.json(districts);
    }

    return NextResponse.json({ error: data.meta?.message || 'Failed to fetch districts' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
