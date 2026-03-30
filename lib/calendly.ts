import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/utils";

type CalendlyCollectionItem = {
  uri?: string;
  start_time?: string;
  status?: string;
  name?: string;
  event_type?: string;
  event_type_name?: string;
  email?: string;
  phone_number?: string;
  tracking?: {
    utm_source?: string;
  };
};

type CalendlyCollectionResponse = {
  collection?: CalendlyCollectionItem[];
};

function calendlyHeaders() {
  const token = process.env.CALENDLY_API_TOKEN;
  if (!token) {
    throw new Error("Missing CALENDLY_API_TOKEN");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function fetchCollection(url: string): Promise<CalendlyCollectionItem[]> {
  const response = await fetch(url, {
    headers: calendlyHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Calendly request failed: ${response.status}`);
  }

  const payload = (await response.json()) as CalendlyCollectionResponse;
  return Array.isArray(payload.collection) ? payload.collection : [];
}

async function matchCustomer({
  email,
  phone,
}: {
  email?: string | null;
  phone?: string | null;
}) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizePhone(phone);

  if (normalizedPhone) {
    const byPhone = await prisma.customer.findUnique({
      where: { normalizedPhone },
    });
    if (byPhone) {
      return byPhone.id;
    }
  }

  if (normalizedEmail) {
    const byEmail = await prisma.customer.findUnique({
      where: { normalizedEmail },
    });
    if (byEmail) {
      return byEmail.id;
    }
  }

  return null;
}

async function upsertCalendlyEvent(item: CalendlyCollectionItem) {
  const uri = item.uri;
  if (!uri) return;

  const inviteeEmail = item.email ?? null;
  const inviteePhone = item.phone_number ?? null;
  const matchedCustomerId = await matchCustomer({
    email: inviteeEmail,
    phone: inviteePhone,
  });

  const existing = await prisma.calendlyEvent.findFirst({
    where: {
      OR: [{ calendlyInviteeUri: uri }, { calendlyEventUri: uri }],
    },
    select: { id: true },
  });

  const payload = {
    calendlyInviteeUri: uri,
    calendlyEventUri: item.uri ?? uri,
    eventName: item.event_type_name ?? item.event_type ?? item.name ?? "Calendly booking",
    inviteeName: item.name ?? null,
    inviteeEmail,
    normalizedInviteeEmail: normalizeEmail(inviteeEmail),
    inviteePhone,
    normalizedInviteePhone: normalizePhone(inviteePhone),
    scheduledAt: item.start_time ? new Date(item.start_time) : null,
    status: item.status ?? "active",
    matchedCustomerId,
    rawPayload: JSON.stringify(item),
  };

  if (existing) {
    await prisma.calendlyEvent.update({
      where: { id: existing.id },
      data: payload,
    });
    return;
  }

  await prisma.calendlyEvent.create({
    data: payload,
  });
}

export async function syncCalendlyEvents() {
  const userUri = process.env.CALENDLY_USER_URI;
  if (!userUri) {
    throw new Error("Missing CALENDLY_USER_URI");
  }

  const now = new Date();
  const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString();
  const eventsUrl = new URL("https://api.calendly.com/scheduled_events");
  eventsUrl.searchParams.set("user", userUri);
  eventsUrl.searchParams.set("min_start_time", start);
  eventsUrl.searchParams.set("sort", "start_time:asc");
  eventsUrl.searchParams.set("count", "100");

  const events = await fetchCollection(eventsUrl.toString());
  const syncResults = {
    eventsImported: 0,
    inviteesImported: 0,
  };

  for (const event of events) {
    const eventUri = event.uri;
    if (!eventUri) continue;

    await upsertCalendlyEvent({
      uri: eventUri,
      start_time: event.start_time,
      status: event.status,
      name: event.name,
      event_type_name: event.event_type_name ?? event.name,
    });
    syncResults.eventsImported += 1;

    const inviteeEndpoint = new URL(`${eventUri}/invitees`);
    inviteeEndpoint.searchParams.set("count", "100");
    try {
      const invitees = await fetchCollection(inviteeEndpoint.toString());
      for (const invitee of invitees) {
        await upsertCalendlyEvent({
          uri: invitee.uri,
          start_time: event.start_time,
          status: invitee.status ?? event.status,
          name: invitee.name,
          email: invitee.email,
          phone_number: invitee.phone_number,
          event_type_name: event.event_type_name ?? event.name,
        });
        syncResults.inviteesImported += 1;
      }
    } catch {
      continue;
    }
  }

  return syncResults;
}

export async function upsertCalendlyWebhookEvent(payload: unknown) {
  const body = payload as Record<string, unknown>;
  const event = body?.payload as Record<string, unknown> | undefined;
  const invitee = event?.invitee as Record<string, unknown> | undefined;
  const scheduledEvent = event?.scheduled_event as Record<string, unknown> | undefined;

  await upsertCalendlyEvent({
    uri: String(invitee?.uri ?? scheduledEvent?.uri ?? ""),
    start_time: String(scheduledEvent?.start_time ?? ""),
    status: String(event?.status ?? body?.event ?? "active"),
    name: String(invitee?.name ?? ""),
    email: String(invitee?.email ?? ""),
    phone_number: String(invitee?.text_reminder_number ?? ""),
    event_type_name: String(scheduledEvent?.name ?? "Calendly booking"),
  });
}
