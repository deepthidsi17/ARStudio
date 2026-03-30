import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function selectedDate(input?: string | null) {
  if (!input) return new Date();
  const parsed = parseISO(input);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const day = selectedDate(searchParams.get("date"));
  const start = startOfDay(day);
  const end = endOfDay(day);

  const visits = await prisma.visit.findMany({
    where: {
      visitAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      customer: true,
      visitServices: true,
    },
    orderBy: { visitAt: "asc" },
  });

  const rows = [
    ["Customer", "Visit Time", "Services", "Amount Paid", "Payment Method", "Notes"].join(","),
    ...visits.map((visit) =>
      [
        JSON.stringify(visit.customer.name),
        JSON.stringify(visit.visitAt.toISOString()),
        JSON.stringify(visit.visitServices.map((service) => service.serviceName).join(" | ")),
        JSON.stringify(((visit.amountPaidCents ?? 0) / 100).toFixed(2)),
        JSON.stringify(visit.paymentMethod ?? ""),
        JSON.stringify(visit.notes ?? ""),
      ].join(","),
    ),
  ];

  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ar-studio-daily-${format(day, "yyyy-MM-dd")}.csv"`,
    },
  });
}
