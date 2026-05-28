import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { name, code, type, provider, logoUrl, adminFeeFlat, adminFeePct, isActive, isRedirect } = await req.json();

    if (!name || !code || !type || !provider) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get max sort_order
    const maxRow = await sql(`SELECT COALESCE(MAX(sort_order), 0) AS max FROM payment_methods`);
    const nextSort = (maxRow[0]?.max ?? 0) + 1;

    const rows = await sql(`
      INSERT INTO payment_methods (name, code, type, provider, logo_url, admin_fee_flat, admin_fee_pct, is_active, is_redirect, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING 
        id, name, code, type, provider,
        logo_url AS "logoUrl",
        admin_fee_flat AS "adminFeeFlat",
        admin_fee_pct AS "adminFeePct",
        is_active AS "isActive",
        is_redirect AS "isRedirect",
        sort_order AS "sortOrder"
    `, [
      name,
      code,
      type,
      provider,
      logoUrl || null,
      adminFeeFlat || 0,
      adminFeePct || 0,
      isActive !== false,
      isRedirect || false,
      nextSort
    ]);

    invalidateCache();

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
