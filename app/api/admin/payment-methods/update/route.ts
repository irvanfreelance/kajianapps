import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { invalidateCache } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const { id, name, code, type, provider, logoUrl, adminFeeFlat, adminFeePct, isActive, isRedirect } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await sql(`
      UPDATE payment_methods
      SET 
        name = $1,
        code = $2,
        type = $3,
        provider = $4,
        logo_url = $5,
        admin_fee_flat = $6,
        admin_fee_pct = $7,
        is_active = $8,
        is_redirect = $9
      WHERE id = $10
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
      id
    ]);

    invalidateCache();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
