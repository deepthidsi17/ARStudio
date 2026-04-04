"use client";

import { useCart } from "./cart-context";
import { centsToCurrency } from "@/lib/utils";
import { useState } from "react";
import { CheckoutModal } from "./checkout-modal";

export function CartWidget() {
  const { items, removeItem } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (items.length === 0) return null;

  const total = items.reduce((sum, item) => sum + (item.priceDefault || 0), 0);
  
  const serviceNames = items.map(i => i.name).join(", ");

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 sm:p-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <p className="text-sm text-stone-500 font-medium">Selected Services ({items.length})</p>
            <div className="flex flex-wrap gap-2 mt-2 max-h-24 overflow-y-auto pr-2">
              {items.map(item => (
                <span key={item.id} className="inline-flex items-center py-1 px-2.5 rounded-full bg-stone-100 text-sm font-medium text-stone-800 tracking-tight">
                  {item.name}
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="ml-1.5 inline-flex items-center justify-center rounded-full bg-stone-200 w-5 h-5 text-stone-500 hover:text-stone-800 hover:bg-stone-300 focus:outline-none transition-colors"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0 justify-between sm:justify-end shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold">Total From</p>
              <p className="text-xl font-bold text-stone-900 tracking-tight">{centsToCurrency(total)}</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold tracking-tight text-white shadow-sm hover:bg-rose-500 transition-colors"
            >
              Schedule session
            </button>
          </div>
        </div>
      </div>

      <CheckoutModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
