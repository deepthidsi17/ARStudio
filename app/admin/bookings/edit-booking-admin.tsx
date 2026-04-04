"use client";

import { useState } from "react";
import { updateAppointmentAdmin } from "./actions";
import { formatDateTime, centsToCurrency } from "@/lib/utils";

export default function EditBookingAdmin({ 
  appt, 
  allServices 
}: { 
  appt: any; 
  allServices: any[]; 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    const d = new Date(appt.scheduledAt);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setDateStr(`${yr}-${mo}-${da}`);
    
    const hr = String(d.getHours()).padStart(2, '0');
    const mn = String(d.getMinutes()).padStart(2, '0');
    setTimeStr(`${hr}:${mn}`);

    const end = appt.endTime ? new Date(appt.endTime) : new Date(d.getTime() + 60 * 60000);
    const eHr = String(end.getHours()).padStart(2, '0');
    const eMn = String(end.getMinutes()).padStart(2, '0');
    setEndTimeStr(`${eHr}:${eMn}`);

    setSelectedServiceIds(appt.services.map((s: any) => s.serviceId));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!dateStr || !timeStr || !endTimeStr || selectedServiceIds.length === 0) return;
    setIsSaving(true);
    await updateAppointmentAdmin(appt.id, `${dateStr}T${timeStr}:00`, `${dateStr}T${endTimeStr}:00`, selectedServiceIds);
    setIsSaving(false);
    setIsEditing(false);
  };

  const toggleService = (id: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (!isEditing) {
    return (
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
          <p className="text-sm font-bold text-rose-600">
            {formatDateTime(appt.scheduledAt)}
            {appt.endTime && (
              <span className="text-stone-500 font-normal ml-1">
                to {new Date(appt.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </p>
          <button onClick={handleEdit} className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-2">
            Edit Details
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-stone-200">
          <ul className="text-sm text-stone-600 space-y-1 mb-2">
            {appt.services.map((s: any) => (
              <li key={s.id} className="flex justify-between">
                <span>{s.serviceName}</span>
                <span>{centsToCurrency(s.priceCents || 0)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-stone-900 text-sm">
            <span>Total:</span>
            <span>{centsToCurrency(appt.totalPriceCents || 0)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-4 bg-stone-100 p-4 rounded-lg border border-stone-200 w-full mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
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
      </div>

      <div className="space-y-2 border-t border-stone-200 pt-2">
        <p className="text-xs font-bold text-stone-800">Select Services:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {allServices.map(service => (
            <label key={service.id} className="flex items-start gap-2 text-xs text-stone-700 hover:text-stone-900 cursor-pointer p-1">
              <input 
                type="checkbox" 
                checked={selectedServiceIds.includes(service.id)}
                onChange={() => toggleService(service.id)}
                className="rounded border-stone-300 text-stone-900 focus:ring-stone-900 mt-0.5"
              />
              <span className="leading-tight">
                {service.name} <br/>
                <span className="text-stone-500">{centsToCurrency(service.priceDefault || 0)}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end mt-2 pt-3 border-t border-stone-200">
        <button 
          onClick={handleSave} 
          disabled={isSaving || selectedServiceIds.length === 0}
          className="bg-stone-900 text-white px-4 py-1.5 text-xs font-semibold rounded-full hover:bg-stone-800 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
        <button 
          onClick={() => setIsEditing(false)} 
          className="text-stone-500 text-xs px-2 hover:text-stone-700 font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}