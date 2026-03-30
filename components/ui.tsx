import Link from "next/link";
import type { ReactNode } from "react";

import { classNames } from "@/lib/utils";

export function AppNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-rose-300 hover:text-rose-600"
    >
      {children}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">{eyebrow}</p> : null}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{title}</h1>
          {description ? <p className="max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={classNames("rounded-3xl border border-stone-200 bg-white p-6 shadow-sm", className)}>
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {description ? <p className="text-sm text-stone-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function MessageBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      {message}
    </div>
  );
}
