import { NextResponse } from "next/server";

import { upsertCalendlyWebhookEvent } from "@/lib/calendly";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    await upsertCalendlyWebhookEvent(payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
