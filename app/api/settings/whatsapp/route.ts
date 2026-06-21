import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT config_value 
      FROM settings 
      WHERE config_key = 'whatsapp_support' 
      LIMIT 1
    `);
    const waNumber = rows[0]?.config_value;
    if (!waNumber) {
      return NextResponse.json({ success: false, error: "WhatsApp number not configured" }, { status: 404 });
    }
    return NextResponse.json({ success: true, whatsapp: waNumber });
  } catch (error: any) {
    console.error("Fetch WhatsApp setting error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
