"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBookingsByContact(contactInfo: string) {
  if (!contactInfo) return [];
  
  return prisma.appointment.findMany({
    where: {
      OR: [
        { email: { equals: contactInfo, mode: "insensitive" } },
        { phone: { equals: contactInfo } }
      ],
      scheduledAt: {
        gte: new Date(), // Only upcoming bookings
      },
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    },
    include: {
      services: true,
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
}

export async function cancelBooking(appointmentId: string, contactInfo: string) {
  const appointment = await prisma.appointment.findFirst({
    where: { 
      id: appointmentId, 
      OR: [
        { email: { equals: contactInfo, mode: "insensitive" } },
        { phone: { equals: contactInfo } }
      ]
    },
  });

  if (!appointment) {
    throw new Error("Booking not found or unauthorized");
  }

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/my-bookings");
}