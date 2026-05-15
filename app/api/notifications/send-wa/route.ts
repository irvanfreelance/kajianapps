import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendWhatsApp } from '@/lib/fonnte';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';

async function handler(req: Request) {
  try {
    const body = await req.json();
    const { eventTrigger, target, variables } = body;

    if (!eventTrigger || !target) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Ambil template dari database
    const templates = await sql(`SELECT message_content, is_active FROM notification_templates WHERE event_trigger = $1`, [eventTrigger]);

    if (templates.length === 0) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const template = templates[0];
    if (!template.is_active) {
      return NextResponse.json({ message: 'Template is inactive, skipped' }, { status: 200 });
    }

    let message = template.message_content;

    // Masking variables
    if (variables) {
      for (const [key, value] of Object.entries(variables)) {
        message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), value as string);
      }
    }

    // Kirim via Fonnte
    const fonnteRes = await sendWhatsApp({
      target,
      message,
    });

    return NextResponse.json({ success: true, fonnteRes });
  } catch (error: any) {
    console.error('Send WA Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Ensure QStash signature verification is enabled
// For local testing, we might want to bypass if not using QStash
export const POST = process.env.NODE_ENV === 'development' && !process.env.QSTASH_TOKEN ? handler : verifySignatureAppRouter(handler);
