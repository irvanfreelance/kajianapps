import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// Admin-only: no Redis cache, always fresh data
export async function GET() {
  try {
    const methods = await sql(`
      SELECT 
        id, name, code, type, logo_url AS "logoUrl",
        admin_fee_flat AS "adminFeeFlat", admin_fee_pct AS "adminFeePct",
        provider, is_active AS "isActive", is_redirect AS "isRedirect", sort_order AS "sortOrder"
      FROM payment_methods
      ORDER BY sort_order ASC, id ASC
    `);
    return NextResponse.json(methods);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
