"use client";

import { useState } from "react";
import Image from "next/image";
import { centsToCurrency } from "@/lib/utils";

type ServiceProps = {
  id: string;
  name: string;
  priceDefault: number | null;
  imageUrl: string | null;
  description: string;
};

export default function ServiceCard({ service }: { service: ServiceProps }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      onClick={() => setIsExpanded(!isExpanded)}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md cursor-pointer"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-stone-100">
        {service.imageUrl ? (
          <img 
            src={service.imageUrl} 
            alt={service.name} 
            className="absolute inset-0 h-full w-full object-cover object-center transition duration-300 group-hover:scale-105" 
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-rose-50 text-rose-200">
            <span className="text-4xl">✦</span>
          </div>
        )}
        
        {/* Overlay overlay on hover or when expanded to show "View details" hint */}
        <div className={`absolute inset-0 bg-stone-900/40 flex items-center justify-center transition-opacity duration-300 ${isExpanded ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
          <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-stone-900 shadow-sm backdrop-blur-sm">
            {isExpanded ? "Close Details" : "View Details"}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-semibold text-stone-900">{service.name}</h3>
          <span className="inline-flex shrink-0 items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">
            From {centsToCurrency(service.priceDefault ?? 0)}
          </span>
        </div>
        
        {/* Expandable description section */}
        <div 
          className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <p className="text-sm leading-relaxed text-stone-600">
              {service.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
