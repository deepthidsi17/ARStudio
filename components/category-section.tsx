"use client";

import { useState } from "react";
import { centsToCurrency } from "@/lib/utils";
import { useCart } from "./cart-context";

type ServiceProps = {
  id: string;
  name: string;
  priceDefault: number | null;
  description: string;
};

type CategorySectionProps = {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  services: ServiceProps[];
};

export default function CategorySection({ id, title, description, services }: CategorySectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addItem, removeItem, isInCart } = useCart();

  return (
    <div id={id} className="w-full">
      <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr] lg:items-start">
        {/* Left Side: Category Title */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-32">
          <h3 className="text-3xl font-bold tracking-tight text-stone-900">{title}</h3>
          {description && (
            <p className="text-base text-stone-600 leading-relaxed pr-4">{description}</p>
          )}
        </div>

        {/* Right Side: Services Accordion List */}
        <div className="flex flex-col space-y-3">
          {services.map((service) => {
            const isExpanded = expandedId === service.id;
            const inCart = isInCart(service.id);

            return (
              <div 
                key={service.id} 
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isExpanded ? 'border-stone-300 bg-white shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 cursor-pointer'
                }`}
                onClick={() => setExpandedId(isExpanded ? null : service.id)}
              >
                {/* Accordion Header */}
                <div className="flex items-center justify-between p-5 sm:p-6">
                  <h4 className="text-lg font-semibold text-stone-900">{service.name}</h4>
                  <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span className="hidden sm:inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-800">
                      From {centsToCurrency(service.priceDefault ?? 0)}
                    </span>
                    <span className="sm:hidden text-sm font-medium text-stone-800">
                      {centsToCurrency(service.priceDefault ?? 0)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (inCart) {
                          removeItem(service.id);
                        } else {
                          addItem({ id: service.id, name: service.name, priceDefault: service.priceDefault });
                        }
                      }}
                      className={`inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                        inCart 
                          ? "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-1 ring-inset ring-rose-200" 
                          : "bg-stone-900 text-white hover:bg-stone-800"
                      }`}
                    >
                      {inCart ? "Added" : "Add to Schedule"}
                    </button>
                    <span className="text-stone-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-5 w-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Accordion Body */}
                <div 
                  className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-stone-100 px-5 pb-6 pt-4 sm:px-6">
                      <p className="text-sm leading-relaxed text-stone-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}