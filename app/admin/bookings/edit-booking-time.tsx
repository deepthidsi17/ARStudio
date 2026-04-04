"use client";

import { useState } from "react";
import { updateAppointmentTime } from "./actions";

export default function EditBookingTime({ id, currentDateTime, currentEndTime, isPast }: { id: string; currentDateTime: Date; currentEndTime?: Date | null; isPast: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    const d = new Date(currentDateTime);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setDateStr(`${yr}-${mo}-${da}`);
    
    const hr = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    setTimeStr(`${hr}:${mn}`);

    const end = currentEndTime ? new Date(currentEndTime) : new Date(d.getTime() + 60 * 60000);
    const eHr = String(end.getHours()).padStart(2, '0');
    const eMn = String(end.getMinutes()).padStart(2, '0');
    setEndTimeStr(`${eHr}:${eMn}`);
    
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!dateStr || !timeStr || !endTimeStr) return;
    setIsSaving(true);
    await updateAppointmentTime(id, `${dateStr}T${timeStr}:00`, `${dateStr}T${endTimeStr}:00`);
    setIsSaving(false);
    setIsEditing(false);
  };

  if (isPast) return null;

  if (!isEditing) {
    return (
      <button onClick={handleEdit} className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2 ml-2">
        Adjust Time
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-stone-100 p-2 rounded-lg border border-stone-200">
      <input 
        type="date" 
        value={dateStr} 
        onChange={e => setDateStr(e.target.value)} 
        className="text-xs rounded border-stone-300 py-1"
      />
      <div className="flex items-center gap-1">
        <input 
          type="time" 
          value={timeStr} 
          onChange={e => setTimeStr(e.target.value)} 
          className="text-xs rounded border-stone-300 py-1"
        />
        <span className="text-xs text-stone-500">to</span>
        <input 
          type="time" 
          value={endTimeStr} 
          onChange={e => setEndTimeStr(e.target.value)} 
          className="text-xs rounded border-stone-300 py-1"
        />
      </div>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-stone-900 text-white px-2 py-1 text-xs rounded hover:bg-stone-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button 
          onClick={() => setIsEditing(false)} 
          className="text-stone-500 text-xs px-1 hover:text-stone-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}