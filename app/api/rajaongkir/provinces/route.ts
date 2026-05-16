import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';

export async function GET() {
  if (!RAJAONGKIR_API_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key not configured' }, { status: 500 });
  }

  const cacheKey = 'rajaongkir:provinces:komerce';
  
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
  } catch (err) {
    console.error('Redis error:', err);
  }

  try {
    const res = await fetch(`${BASE_URL}/destination/province`, {
      headers: { key: RAJAONGKIR_API_KEY || '' }
    });
    const data = await res.json();

    if (data.meta?.code === 200) {
      // Normalize to match previous format if needed, but here we just map Komerce to a clean format
      const provinces = data.data.map((p: any) => ({
        province_id: p.id.toString(),
        province: p.name
      }));
      
      try {
        await redis.set(cacheKey, provinces); // Forever cache
      } catch (err) {
        console.error('Redis set error:', err);
      }
      return NextResponse.json(provinces);
    }

    return NextResponse.json({ error: data.meta?.message || 'Failed to fetch provinces' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
