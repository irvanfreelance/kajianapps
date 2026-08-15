import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await sql(`
      SELECT config_key, config_value 
      FROM settings 
      WHERE config_key IN ('site_title', 'site_favicon', 'site_logo', 'whatsapp_support')
    `);
    
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.config_key] = row.config_value;
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error("Fetch public settings error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
