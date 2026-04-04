"use server";

import { prisma } from "@/lib/prisma";

export async function getAvailableTimeSlots(dateStr: string) {
  try {
    const localDate = new Date(dateStr + "T00:00:00");
    const dateOnly = dateStr; // since it's passed as YYYY-MM-DD
    
    // Check if the current date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (localDate < today) {
      return { success: true, slots: [] };
    }
    
    const rule = await prisma.scheduleRule.findUnique({
      where: { date: dateOnly }
    });

    if (!rule || !rule.isActive) {
      return { success: true, slots: [] };
    }

    const startHour = parseInt(rule.startTime.split(":")[0]);
    const startMin = parseInt(rule.startTime.split(":")[1]);
    const endHour = parseInt(rule.endTime.split(":")[0]);
    const endMin = parseInt(rule.endTime.split(":")[1]);

    const startTotalMins = startHour * 60 + startMin;
    const endTotalMins = endHour * 60 + endMin;

    const slots = [];
    for (let m = startTotalMins; m < endTotalMins; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const ampm = h >= 12 ? 'PM' : 'AM';
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      
      const timeStr = `${h12}:${min.toString().padStart(2, '0')} ${ampm}`;
      const hour24 = h.toString().padStart(2, '0');
      const min24 = min.toString().padStart(2, '0');
      const valueStr = `${dateStr}T${hour24}:${min24}:00`; 
      
      slots.push({ label: timeStr, value: valueStr, isAM: ampm === 'AM' });
    }

    // Now we must also filter out slots that are already booked.
    // We can do this by finding all appointments on that date.
    
    // Local start of day and end of day in UTC roughly
    const startOfDay = new Date(dateStr + "T00:00:00");
    const endOfDay = new Date(dateStr + "T23:59:59");
    
    const booked = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ["PENDING", "CONFIRMED"] }
      },
      select: { scheduledAt: true }
    });

    const bookedTimes = booked.map(b => {
      const h = b.scheduledAt.getHours().toString().padStart(2, '0');
      const m = b.scheduledAt.getMinutes().toString().padStart(2, '0');
      return `${dateStr}T${h}:${m}:00`;
    });

    // Make sure we have AM first, PM next (which they naturally are sequentially 0-23 hours anyway!)
    const availableSlots = slots.filter(s => !bookedTimes.includes(s.value));

    // Sort AM first, then PM explicitly, though chronological works too
    const amSlots = availableSlots.filter(s => s.isAM);
    const pmSlots = availableSlots.filter(s => !s.isAM);

    return { success: true, slots: [...amSlots, ...pmSlots] };
  } catch (error) {
    console.error(error);
    return { success: false, slots: [] };
  }
}

export async function createBooking(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  scheduledAt: string;
  totalPriceCents: number;
  services: { id: string; name: string; priceDefault: number | null }[];
}) {
  try {
    const name = `${data.firstName} ${data.lastName}`.trim();
    
    // Log data simply to help us diagnose if it happens again.
    console.log("Creating booking with data:", { ...data, name });

    const appointment = await prisma.appointment.create({
      data: {
        name,
        email: data.email,
        phone: data.phone,
        scheduledAt: new Date(data.scheduledAt),
        totalPriceCents: data.totalPriceCents,
        status: "PENDING",
        services: {
          create: data.services.map(svc => ({
            serviceId: svc.id,
            serviceName: svc.name,
            priceCents: svc.priceDefault,
          }))
        }
      }
    });

    return { success: true, appointmentId: appointment.id };
  } catch (error: any) {
    console.error("Booking creation failed:", error);
    return { success: false, error: error.message || "Failed to create booking" };
  }
}