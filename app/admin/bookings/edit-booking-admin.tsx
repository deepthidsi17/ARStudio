"use client";

import { useState } from "react";
import { updateAppointmentAdmin } from "./actions";
import { formatDateTime, centsToCurrency, STUDIO_TZ } from "@/lib/utils";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";

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
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const toDollars = (cents: number | null | undefined) => (cents ? (cents / 100).toFixed(2) : "");

  const handleEdit = () => {
    const zonedD = toZonedTime(new Date(appt.scheduledAt), STUDIO_TZ);
    setDateStr(format(zonedD, "yyyy-MM-dd"));
    setTimeStr(format(zonedD, "HH:mm"));

    const end = appt.endTime ? new Date(appt.endTime) : new Date(new Date(appt.scheduledAt).getTime() + 60 * 60000);
    const zonedEnd = toZonedTime(end, STUDIO_TZ);
    setEndTimeStr(format(zonedEnd, "HH:mm"));

    setSelectedServiceIds(appt.services.map((s: any) => s.serviceId));
    // Keep the price already agreed on this booking, falling back to the service default
    const initialPrices: Record<string, string> = {};
    for (const s of appt.services) {
      const service = allServices.find((x) => x.id === s.serviceId);
      initialPrices[s.serviceId] = toDollars(s.priceCents ?? service?.priceDefault);
    }
    setPrices(initialPrices);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!dateStr || !timeStr || !endTimeStr || selectedServiceIds.length === 0) return;
    setIsSaving(true);
    const selectedPrices = Object.fromEntries(selectedServiceIds.map((id) => [id, prices[id] ?? ""]));
    await updateAppointmentAdmin(appt.id, `${dateStr}T${timeStr}:00`, `${dateStr}T${endTimeStr}:00`, selectedServiceIds, selectedPrices);
    setIsSaving(false);
    setIsEditing(false);
  };

  const toggleService = (id: string) => {
    if (!selectedServiceIds.includes(id) && prices[id] === undefined) {
      const service = allServices.find((x) => x.id === id);
      setPrices(prev => ({ ...prev, [id]: toDollars(service?.priceDefault) }));
    }
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
                to {format(toZonedTime(new Date(appt.endTime), STUDIO_TZ), "h:mm a")}
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
                <span>{s.priceCents == null ? "Custom — set price" : centsToCurrency(s.priceCents)}</span>
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
                <span className="text-stone-500">{service.priceDefault == null ? "Custom" : centsToCurrency(service.priceDefault)}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t border-stone-200 pt-2">
        <p className="text-xs font-bold text-stone-800">Prices for this booking ($):</p>
        {selectedServiceIds.map(id => {
          const service = allServices.find(x => x.id === id);
          return (
            <label key={id} className="flex items-center justify-between gap-2 text-xs text-stone-700">
              <span className="leading-tight">{service?.name}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder="Set price"
                value={prices[id] ?? ""}
                onChange={e => setPrices(prev => ({ ...prev, [id]: e.target.value }))}
                className="w-24 text-xs rounded border-stone-300 py-1 text-right"
              />
            </label>
          );
        })}
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