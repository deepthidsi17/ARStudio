"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-rose-300 hover:text-rose-600"
    >
      {label}
    </button>
  );
}
