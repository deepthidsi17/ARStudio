"use client";

import { useState, useEffect } from "react";
import { useCart } from "./cart-context";
import { centsToCurrency } from "@/lib/utils";
import { createBooking, getAvailableTimeSlots } from "@/app/actions/booking";

export function CheckoutModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    scheduledAt: "",
  });

  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{label: string, value: string, isAM: boolean}[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setIsLoadingSlots(true);
      const isOnlyThreading = items.length > 0 && items.every(i => i.name.toLowerCase().includes("threading"));
      const requiredDuration = isOnlyThreading ? 30 : 60;
      
      getAvailableTimeSlots(selectedDate, requiredDuration).then(res => {
        setAvailableSlots(res.slots || []);
        setIsLoadingSlots(false);
      });
      setFormData(prev => ({ ...prev, scheduledAt: "" }));
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, items]);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => sum + (item.priceDefault || 0), 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.firstName.trim().length < 3) {
      alert("Please provide a valid first name (at least 3 characters).");
      return;
    }
    
    if (formData.lastName.trim().length < 2) {
      alert("Please provide a valid last name.");
      return;
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert("Please provide a valid 10-digit phone number.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      alert("Please provide a valid email address.");
      return;
    }

    if (!formData.scheduledAt) {
      alert("Please select a time slot.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const res = await createBooking({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        scheduledAt: formData.scheduledAt,
        totalPriceCents: total,
        services: items.map(i => ({ id: i.id, name: i.name, priceDefault: i.priceDefault }))
      });
      
      if (res?.success) {
        setIsSuccess(true);
        // Changed timeout from 3000 to longer to allow users to read confirmation/address
        setTimeout(() => {
          clearCart();
          onClose();
          setIsSuccess(false);
          setFormData({ firstName: "", lastName: "", phone: "", email: "", scheduledAt: "" });
          setSelectedDate("");
        }, 8000);
      } else {
        alert("Failed to confirm booking: " + (res?.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to confirm booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Group slots for display
  // e.g. "9 AM" -> [{ minute: "00", value: "..." }, { minute: "30", value: "..." }]
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const [time, period] = slot.label.split(" ");
    const [hour, minute] = time.split(":");
    const key = `${hour} ${period}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...slot, minute });
    return acc;
  }, {} as Record<string, any[]>);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 z-10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isSuccess ? (
          <div className="p-8 sm:p-10 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">Booking Confirmed!</h3>
            <p className="text-stone-500 mb-6">Your booking has been successfully added to our schedule. We look forward to seeing you!</p>
            
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-left">
              <h4 className="font-semibold tracking-wide text-stone-900 flex items-center gap-2 mb-2">
                <svg className="h-5 w-5 text-stone-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                Contact & Location Details
              </h4>
              <p className="text-sm text-stone-600 leading-relaxed mb-4">
                <strong>Phone:</strong> (469) 469-8217<br /><br />
                <strong>Address:</strong><br />
                AR Glam Studio<br />
                800 Walworth Drive<br />
                Prosper, TX<br />
              </p>
              <p className="text-sm text-stone-500 bg-white p-3 rounded-xl border border-stone-100">
                Please try to arrive 5 minutes early to your appointment. See you soon!
              </p>
            </div>

            <button 
              onClick={() => {
                clearCart();
                onClose();
                setIsSuccess(false);
              }} 
              className="mt-8 bg-stone-900 text-white px-8 py-3 rounded-full font-medium hover:bg-stone-800 transition"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto pb-4">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 shrink-0">Finalize Booking</h2>
              
              <div className="mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <h3 className="text-sm font-semibold text-stone-900 mb-3">Selected Services</h3>
                <ul className="space-y-2 mb-4">
                  {items.map(item => (
                    <li key={item.id} className="flex justify-between text-sm text-stone-600">
                      <span>{item.name}</span>
                      <span>{centsToCurrency(item.priceDefault ?? 0)}</span>
                    </li>
                  ))}
                </ul>
                <div className="pt-3 border-t border-stone-200 flex justify-between font-bold text-stone-900">
                  <span>Estimated Total:</span>
                  <span>{centsToCurrency(total)}</span>
                </div>
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">First Name</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" minLength={3} className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Last Name</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" minLength={2} className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone Number</label>
                  <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm" placeholder="e.g. 555-1234" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
                  <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm" placeholder="e.g. client@example.com" />
                  <p className="text-xs text-stone-500 mt-1 ml-1">We will send your appointment confirmation here.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Select Date</label>
                  <input 
                    required 
                    type="date" 
                    min={todayStr}
                    name="selectedDate"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm block" 
                  />
                </div>

                {selectedDate && (
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-stone-700 mb-3">Available Time Slots</label>
                    {isLoadingSlots ? (
                      <p className="text-sm text-stone-500">Loading open spots...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-red-500">No time slots are available on this date.</p>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedSlots).map(([hourLabel, slots]) => (
                          <div key={hourLabel} className="bg-stone-50 rounded-xl p-4 border border-stone-100 flex items-center justify-between gap-4">
                            <span className="block text-sm font-semibold text-stone-600 w-16">{hourLabel}</span>
                            <div className="flex gap-2 flex-wrap flex-1">
                              {slots.map(slot => (
                                <button
                                  key={slot.value}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, scheduledAt: slot.value }))}
                                  className={`py-2 px-4 shadow-sm text-sm font-bold rounded-lg border transition-colors ${
                                    formData.scheduledAt === slot.value 
                                    ? 'bg-stone-900 text-white border-stone-900' 
                                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-stone-100'
                                  }`}
                                >
                                  {slot.minute}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            <div className="p-6 shrink-0 bg-stone-50 border-t border-stone-200 rounded-b-3xl">
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || !formData.scheduledAt}
                className="w-full flex justify-center rounded-xl bg-stone-900 px-3 py-4 text-sm font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Confirming..." : "Confirm Appointment"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}