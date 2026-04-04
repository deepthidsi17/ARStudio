"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateScheduleRule(
  date: string, 
  isActive: boolean, 
  startTime: string, 
  endTime: string
) {
  await prisma.scheduleRule.upsert({
    where: { date },
    update: { isActive, startTime, endTime },
    create: { date, isActive, startTime, endTime }
  });

  revalidatePath("/admin/schedule");
}
