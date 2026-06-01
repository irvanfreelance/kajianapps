import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { id, eventTrigger, channel, messageContent, isActive } = await req.json();

    if (!id || !eventTrigger || !channel || !messageContent) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const rows = await sql(`
      UPDATE notification_templates
      SET event_trigger = $2, channel = $3, message_content = $4, is_active = $5
      WHERE id = $1
      RETURNING 
        id, 
        event_trigger AS "eventTrigger", 
        channel, 
        message_content AS "messageContent", 
        is_active AS "isActive"
    `, [
      id,
      eventTrigger,
      channel,
      messageContent,
      isActive !== false
    ]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
