"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateAppointmentTime(id: string, newStartStr: string, newEndStr: string) {
  await prisma.appointment.update({
    where: { id },
    data: {
      scheduledAt: new Date(newStartStr),
      endTime: new Date(newEndStr)
    }
  });

  revalidatePath("/admin/bookings");
}

export async function cancelAppointmentAdmin(id: string) {
  await prisma.appointment.update({
    where: { id },
    data: {
      status: "CANCELLED"
    }
  });

  revalidatePath("/admin/bookings");
}