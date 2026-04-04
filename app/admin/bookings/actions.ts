"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendBookingModifiedEmail, sendBookingCancelledEmail } from "@/lib/email";

export async function updateAppointmentAdmin(id: string, newStartStr: string, newEndStr: string, newServiceIds: string[]) {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: { services: true }
  });

  if (!existing) return;

  const updatedStart = new Date(newStartStr);
  const updatedEnd = new Date(newEndStr);

  const services = await prisma.service.findMany({
    where: { id: { in: newServiceIds } }
  });
  const totalPriceCents = services.reduce((sum, s) => sum + (s.priceDefault || 0), 0);

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
          priceCents: s.priceDefault
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