"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendBookingModifiedEmail, sendBookingCancelledEmail, sendBookingCompletedEmail } from "@/lib/email";
import { fromZonedTime } from "date-fns-tz";
import { STUDIO_TZ, dollarsToCents } from "@/lib/utils";

export async function updateAppointmentAdmin(
  id: string,
  newStartStr: string,
  newEndStr: string,
  newServiceIds: string[],
  priceOverrides: Record<string, string> = {}
) {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: { services: true }
  });

  if (!existing) return;

  const updatedStart = fromZonedTime(newStartStr, STUDIO_TZ);
  const updatedEnd = fromZonedTime(newEndStr, STUDIO_TZ);

  const services = await prisma.service.findMany({
    where: { id: { in: newServiceIds } }
  });
  // Admin-entered price wins; custom-priced services (no default) stay null until set
  const priceFor = (s: { id: string; priceDefault: number | null }) =>
    s.id in priceOverrides ? dollarsToCents(priceOverrides[s.id]) : s.priceDefault;
  const totalPriceCents = services.reduce((sum, s) => sum + (priceFor(s) || 0), 0);

  const fullyUpdated = await prisma.appointment.update({
    where: { id },
    data: {
      scheduledAt: updatedStart,
      endTime: updatedEnd,
      totalPriceCents,
      services: {
        deleteMany: {},
        create: services.map(s => ({
          serviceId: s.id,
          serviceName: s.name,
          priceCents: priceFor(s)
        }))
      }
    },
    include: { services: true }
  });

  revalidatePath("/admin/bookings");

  await sendBookingModifiedEmail(fullyUpdated, existing.scheduledAt, updatedStart).catch(console.error);
}

export async function cancelAppointmentAdmin(id: string) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED"
    },
    include: { services: true }
  });

  revalidatePath("/admin/bookings");

  await sendBookingCancelledEmail(appointment).catch(console.error);
}

export async function markAppointmentCompleteAdmin(id: string) {
  const appointment = await prisma.appointment.update({
    where: { id },
    data: {
      status: "COMPLETED"
    }
  });

  revalidatePath("/admin/bookings");

  await sendBookingCompletedEmail(appointment).catch(console.error);
}