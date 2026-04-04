"use client";

import { useState } from "react";
import { updateAppointmentTime } from "./actions";

export default function EditBookingTime({ id, currentDateTime, isPast }: { id: string; currentDateTime: Date, isPast: boolean }) {
  const [isEditing, setIsEditing] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
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
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!dateStr || !timeStr) return;
    setIsSaving(true);
    await updateAppointmentTime(id, `${dateStr}T${timeStr}:00`);
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
    <div className="mt-2 flex flex-wrap items-center gap-2 bg-stone-100 p-2 rounded-lg border border-stone-200">
      <input 
        type="date" 
        value={dateStr} 
        onChange={e => setDateStr(e.target.value)} 
        className="text-xs rounded border-stone-300 py-1"
      />
      <input 
        type="time" 
        value={timeStr} 
        onChange={e => setTimeStr(e.target.value)} 
        className="text-xs rounded border-stone-300 py-1"
      />
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
  );
}