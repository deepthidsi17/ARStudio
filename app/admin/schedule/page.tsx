import { prisma } from "@/lib/prisma";
import ScheduleManager from "./schedule-manager";

export const dynamic = "force-dynamic";

export default async function SchedulePage() {
  const rules = await prisma.scheduleRule.findMany({
    orderBy: { date: "asc" },
    select: {
      date: true,
      isActive: true,
      startTime: true,
      endTime: true,
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900">Schedule & Availability</h2>
        <p className="text-stone-500">Manage your daily schedule for the next 1 month. Unchecked days are closed.</p>
      </div>

      <ScheduleManager initialRules={rules} />
    </div>
  );
}
