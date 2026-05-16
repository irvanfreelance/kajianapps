import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { redis } from '@/lib/redis';

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
const ORIGIN_DISTRICT_ID = process.env.RAJAONGKIR_ORIGIN_DISTRICT_ID || '1391';

export async function POST(req: Request) {
  if (!RAJAONGKIR_API_KEY) {
    return NextResponse.json({ error: 'RajaOngkir API Key not configured' }, { status: 500 });
  }

  try {
    const { destination, weight, courier } = await req.json();

    if (!destination || !weight || !courier) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const cacheKey = `rajaongkir:cost:komerce:${ORIGIN_DISTRICT_ID}:${destination}:${weight}:${courier}`;
    
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData);
      }
    } catch (err) {
      console.error('Redis error:', err);
    }

    // Fetch origin from settings if available
    let originId = ORIGIN_DISTRICT_ID;
    try {
      const settingRes = await sql(`SELECT config_value FROM settings WHERE config_key = 'rajaongkir_origin_district_id'`);
      if (settingRes.length > 0) {
        originId = settingRes[0].config_value;
      }
    } catch (err) {
      console.error('Failed to fetch origin from settings:', err);
    }

    const res = await fetch(`${BASE_URL}/calculate/district/domestic-cost`, {
      method: 'POST',
      headers: { 
        'key': RAJAONGKIR_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        origin: originId,
        destination: destination,
        weight: weight.toString(),
        courier: courier,
        price: 'lowest'
      })
    });

    const data = await res.json();

    if (data.meta?.code === 200) {
      // Normalize Komerce format to something the frontend can use
      // Komerce returns an array of services directly in data
      const normalized = data.data.map((item: any) => ({
        service: `${(item.code || 'COURIER').toUpperCase()} ${item.service}`,
        description: item.service,
        cost: [{ value: item.cost, etd: item.etd, note: '' }]
      }));
      
      try {
        await redis.set(cacheKey, normalized, { ex: 30 * 24 * 60 * 60 }); // Cache for 1 month
      } catch (err) {
        console.error('Redis set error:', err);
      }
      return NextResponse.json(normalized);
    }

    // Fallback if limit exceeded
    if (data.meta?.code === 429) {
      console.warn('Komerce limit exceeded, returning flat rate');
      const fallback = [{
        service: 'FLAT RATE',
        description: 'Layanan Pengiriman Standar',
        cost: [{ value: 20000, etd: '2-4', note: 'Limit API tercapai' }]
      }];
      return NextResponse.json(fallback);
    }

    console.error('Komerce Cost API Error:', data);
    return NextResponse.json({ error: data.meta?.message || 'Failed to fetch shipping cost' }, { status: 400 });
  } catch (error: any) {
    console.error('Komerce Cost API Catch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
