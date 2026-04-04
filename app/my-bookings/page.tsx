"use client";

import { useState } from "react";
import { getBookingsByContact, cancelBooking } from "./actions";
import { centsToCurrency } from "@/lib/utils";

type Booking = Awaited<ReturnType<typeof getBookingsByContact>>[0];

export default function MyBookingsPage() {
  const [contactInfo, setContactInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo) return;
    
    setIsLoading(true);
    try {
      const results = await getBookingsByContact(contactInfo);
      setBookings(results);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to cancel the booking for ${name}?`)) {
      return;
    }
    
    setIsLoading(true);
    try {
      await cancelBooking(id, contactInfo);
      // Refresh list
      const results = await getBookingsByContact(contactInfo);
      setBookings(results);
    } catch (error) {
      alert("Failed to cancel booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 border-b border-stone-100">
            <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">Manage Bookings</h1>
            <p className="mt-2 text-stone-500">Lookup and cancel your upcoming appointments.</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSearch} className="mb-8">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Enter your Phone or Email
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  className="flex-1 rounded-xl border-stone-300 shadow-sm focus:border-stone-900 focus:ring-stone-900 sm:text-sm px-4 py-3"
                  placeholder="e.g. 555-1234 or hello@example.com"
                />
                <button
                  type="submit"
                  disabled={isLoading || !contactInfo}
                  className="inline-flex justify-center items-center rounded-xl bg-stone-900 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-colors"
                >
                  {isLoading && !hasSearched ? "Searching..." : "Lookup"}
                </button>
              </div>
            </form>

            {hasSearched && (
              <div className="space-y-6">
                {bookings.length === 0 ? (
                  <div className="text-center py-10 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
                      <p className="text-stone-500 font-medium">No upcoming appointments found for this contact info.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-stone-900">Your Upcoming Appointments</h3>
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-sm font-medium text-rose-600 mb-1">
                              {new Date(booking.scheduledAt).toLocaleString('en-US', {
                                weekday: 'long',
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="font-bold text-stone-900">{booking.name}</p>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-200 text-stone-800">
                            {booking.status}
                          </span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-stone-200">
                          <p className="text-xs text-stone-500 uppercase tracking-wider font-bold mb-2">Services Reserved</p>
                          <ul className="space-y-2">
                            {booking.services.map(svc => (
                              <li key={svc.id} className="text-sm text-stone-700 flex justify-between">
                                <span>{svc.serviceName}</span>
                                <span className="font-medium">{centsToCurrency(svc.priceCents || 0)}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="flex justify-between items-center mt-6 pt-4 border-t border-stone-200">
                            <button
                              onClick={() => handleCancel(booking.id, booking.name)}
                              disabled={isLoading}
                              className="text-sm font-bold text-rose-600 hover:text-rose-800 disabled:opacity-50"
                            >
                              Cancel Appointment
                            </button>
                            <p className="text-sm font-bold text-stone-900">
                              Total: {centsToCurrency(booking.totalPriceCents || 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a href="/" className="text-sm font-medium text-stone-500 hover:text-stone-900">
            &larr; Back to Services
          </a>
        </div>
      </div>
    </div>
  );
}