"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendBookingModifiedEmail, sendBookingCancelledEmail } from "@/lib/email";

export async function updateAppointmentTime(id: string, newStartStr: string, newEndStr: string) {
  const existing = await prisma.appointment.findUnique({
    where: { id },
    include: { services: true }
  });

  if (!existing) return;

  const updatedStart = new Date(newStartStr);
  const updatedEnd = new Date(newEndStr);

  await prisma.appointment.update({
    where: { id },
    data: {
      scheduledAt: updatedStart,
      endTime: updatedEnd
    }
  });

  revalidatePath("/admin/bookings");

  if (existing.scheduledAt.getTime() !== updatedStart.getTime()) {
    sendBookingModifiedEmail(existing, existing.scheduledAt, updatedStart).catch(console.error);
  }
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

  sendBookingCancelledEmail(appointment).catch(console.error);
}