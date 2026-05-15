import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function GET() {
  try {
    const cacheKey = 'api:payment-methods:list';
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    const methods = await sql(`
      SELECT id, name, code, type, logo_url as "logoUrl", admin_fee_flat, admin_fee_pct, provider 
      FROM payment_methods 
      WHERE is_active = true 
      ORDER BY sort_order
    `);
    
    await redis.set(cacheKey, methods);
    
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
