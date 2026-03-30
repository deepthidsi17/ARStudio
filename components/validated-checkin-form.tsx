"use client";

import { useState } from "react";

type ValidatedCheckinFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
};

export function ValidatedCheckinForm({
  action,
  children,
  className,
}: ValidatedCheckinFormProps) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        const form = event.currentTarget;
        const checked = form.querySelectorAll<HTMLInputElement>('input[name="serviceIds"]:checked');
        if (!checked.length) {
          event.preventDefault();
          setError("Select at least one service before saving the visit.");
          return;
        }
        setError(null);
      }}
    >
      {children}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
    </form>
  );
}
