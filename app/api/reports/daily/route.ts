export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addDays, startOfDay } from "date-fns";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = startOfDay(new Date());
  const in30Days = addDays(today, 30);

  // Aggregate all stats
  const [
    totalProperties,
    available,
    rented,
    forSale,
    maintenance,
    reserved,
    newLeads,
    expiringSoon,
    overduePayments,
    availableList,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.property.count({ where: { status: "FOR_SALE" } }),
    prisma.property.count({ where: { status: "MAINTENANCE" } }),
    prisma.property.count({ where: { status: "RESERVED" } }),
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.lease.count({
      where: { status: "ACTIVE", endDate: { gte: today, lte: in30Days } },
    }),
    prisma.payment.count({
      where: { status: "PENDING", dueDate: { lt: today } },
    }),
    prisma.property.findMany({
      where: { status: "AVAILABLE" },
      include: {
        owner: { select: { name: true, phone: true } },
        building: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  // Upsert daily report
  const report = await prisma.dailyReport.upsert({
    where: { date: today },
    create: {
      date: today,
      totalProperties,
      available,
      rented,
      forSale,
      maintenance,
      newLeads,
      expiringSoon,
      overduePayments,
      reportData: { reserved, availableCount: available },
    },
    update: {
      totalProperties,
      available,
      rented,
      forSale,
      maintenance,
      newLeads,
      expiringSoon,
      overduePayments,
      reportData: { reserved, availableCount: available },
    },
  });

  return NextResponse.json({
    report,
    availableList,
    stats: { totalProperties, available, rented, forSale, maintenance, reserved, newLeads, expiringSoon, overduePayments },
  });
}
