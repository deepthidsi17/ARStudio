"use client";

import { useTransition, useEffect, useState } from "react";
import { updateScheduleRule } from "./actions";

type ScheduleRule = {
  date: string;
  isActive: boolean;
  startTime: string;
  endTime: string;
};

export default function ScheduleManager({ initialRules }: { initialRules: ScheduleRule[] }) {
  const [isPending, startTransition] = useTransition();
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    const generatedDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getTime());
      d.setDate(today.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

      const existing = initialRules.find((r) => r.date === dateStr);

      generatedDays.push({
        dateStr,
        label,
        isActive: existing ? existing.isActive : true, 
        startTime: existing ? existing.startTime : (isWeekend ? "09:00" : "15:00"),
        endTime: existing ? existing.endTime : "19:30"
      });
    }
    setDays(generatedDays);
  }, [initialRules]);

  const handleUpdate = (date: string, isActive: boolean, startTime: string, endTime: string) => {
    // Optimistic UI update
    setDays(prev => prev.map(d => d.dateStr === date ? { ...d, isActive, startTime, endTime } : d));
    
    startTransition(() => {
      updateScheduleRule(date, isActive, startTime, endTime);
    });
  };

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center text-stone-500">
        Loading schedule planner...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="divide-y divide-stone-100 max-h-[70vh] overflow-y-auto">
        {days.map((day) => {
          return (
            <div key={day.dateStr} className={`p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${day.isActive ? 'hover:bg-stone-50' : 'bg-stone-50/50 hover:bg-stone-50'}`}>
              <div className="flex items-center gap-4 w-48">
                <div className="flex h-5 items-center">
                  <input 
                    type="checkbox" 
                    id={`day-${day.dateStr}`}
                    checked={day.isActive}
                    disabled={isPending}
                    onChange={(e) => handleUpdate(day.dateStr, e.target.checked, day.startTime, day.endTime)}
                    className="h-4 w-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
                  />
                </div>
                <label 
                  htmlFor={`day-${day.dateStr}`} 
                  className={`font-medium ${day.isActive ? 'text-stone-900' : 'text-stone-400'}`}
                >
                  {day.label}
                  <span className="block text-xs text-stone-400 font-normal">{day.dateStr}</span>
                </label>
              </div>

              {day.isActive ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.startTime}
                    disabled={isPending}
                    onChange={(e) => handleUpdate(day.dateStr, true, e.target.value, day.endTime)}
                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-stone-900 sm:text-sm sm:leading-6"
                  />
                  <span className="text-stone-400">-</span>
                  <input
                    type="time"
                    value={day.endTime}
                    disabled={isPending}
                    onChange={(e) => handleUpdate(day.dateStr, true, day.startTime, e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 focus:ring-2 focus:ring-inset focus:ring-stone-900 sm:text-sm sm:leading-6"
                  />
                </div>
              ) : (
                <div className="text-sm font-medium text-stone-400 hidden sm:block">
                  Closed
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}