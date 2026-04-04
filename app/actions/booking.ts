"use server";

import { prisma } from "@/lib/prisma";
import { sendNewBookingEmail } from "@/lib/email";

export async function getAvailableTimeSlots(dateStr: string, requiredDurationMins: number = 60) {
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
      select: { scheduledAt: true, endTime: true, services: { select: { serviceName: true } } }
    });

    const availableSlots = slots.filter(slot => {
      const slotStart = new Date(slot.value);
      const slotEnd = new Date(slotStart.getTime() + requiredDurationMins * 60000);
      
      // Slot is blocked if it overlaps any existing appointment.
      const hasOverlap = booked.some(appt => {
        const apptStart = appt.scheduledAt;
        let actualEnd = appt.endTime;
        
        if (!actualEnd) {
           const isOnlyThreading = appt.services.length > 0 && appt.services.every(s => s.serviceName.toLowerCase().includes("threading"));
           const minDuration = isOnlyThreading ? 30 : 60;
           actualEnd = new Date(apptStart.getTime() + minDuration * 60000);
        }
        
        return (slotStart < actualEnd) && (slotEnd > apptStart);
      });
      
      return !hasOverlap;
    });

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
    const isOnlyThreading = data.services.length > 0 && data.services.every(svc => svc.name.toLowerCase().includes("threading"));
    const durationMinutes = isOnlyThreading ? 30 : 60;
    
    const start = new Date(data.scheduledAt);
    const end = new Date(start.getTime() + durationMinutes * 60000);

    // Log data simply to help us diagnose if it happens again.
    console.log("Creating booking with data:", { ...data, name, endTime: end });

    const appointment = await prisma.appointment.create({
      data: {
        name,
        email: data.email,
        phone: data.phone,
        scheduledAt: start,
        endTime: end,
        totalPriceCents: data.totalPriceCents,
        status: "PENDING",
        services: {
          create: data.services.map(svc => ({
            serviceId: svc.id,
            serviceName: svc.name,
            priceCents: svc.priceDefault,
          }))
        }
      },
      include: { services: true }
    });

    // Dispatch emails asynchronously so it doesn't block the UI
    sendNewBookingEmail(appointment).catch(console.error);

    return { success: true, appointmentId: appointment.id };
  } catch (error: any) {
    console.error("Booking creation failed:", error);
    return { success: false, error: error.message || "Failed to create booking" };
  }
}