import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const methods = await sql(`
      SELECT id, name, code, type, logo_url as "logoUrl" 
      FROM payment_methods 
      WHERE is_active = true 
      ORDER BY sort_order
    `);
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
