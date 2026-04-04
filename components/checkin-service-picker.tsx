"use client";

import { useMemo, useState } from "react";
import { centsToCurrency } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  priceDefault: number | null;
};

export default function CheckinServicePicker({ 
  services, 
  preselectedServiceIds = [] 
}: { 
  services: Service[]; 
  preselectedServiceIds?: string[] 
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(preselectedServiceIds);

  const handleToggle = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedIds(prev => 
      e.target.checked
        ? [...prev, id]
        : prev.filter(x => x !== id)
    );
  };

  const totalCost = useMemo(() => {
    return selectedIds.reduce((total, id) => {
      const svc = services.find(s => s.id === id);
      return total + (svc?.priceDefault || 0);
    }, 0);
  }, [selectedIds, services]);

  return (
    <div className="space-y-4">
      {preselectedServiceIds.length > 0 && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800">
          <p className="text-sm">
            <strong className="font-semibold block mb-1">Appointment detected!</strong> 
            We automatically checked the services requested for today.
          </p>
        </div>
      )}
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const isSelected = selectedIds.includes(service.id);
          return (
            <label
              key={service.id}
              className={`flex items-start gap-4 rounded-3xl border px-5 py-4 cursor-pointer transition-colors ${
                isSelected ? 'border-rose-300 bg-rose-50' : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <input 
                type="checkbox" 
                name="serviceIds" 
                value={service.id} 
                checked={isSelected}
                onChange={(e) => handleToggle(service.id, e)}
                className="mt-1 h-6 w-6 accent-rose-500 cursor-pointer" 
              />
              <span>
                <span className="block text-base font-semibold text-stone-900">{service.name}</span>
                <span className="block text-sm text-stone-500">
                  {service.priceDefault ? `From ${centsToCurrency(service.priceDefault)}` : "Price set by staff"}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {totalCost > 0 && (
        <div className="mt-8 flex justify-between items-center border-t border-stone-200 pt-6 px-1">
          <span className="text-stone-500 font-medium">Estimated cost</span>
          <span className="text-2xl font-bold tracking-tight text-stone-900">{centsToCurrency(totalCost)}</span>
        </div>
      )}
    </div>
  );
}