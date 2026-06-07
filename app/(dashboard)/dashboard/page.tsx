export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Users,
  Bell,
  Calendar,
} from "lucide-react";
import { formatCurrency, PROPERTY_STATUS_COLORS, PROPERTY_STATUS_LABELS } from "@/lib/utils";
import { addDays, startOfDay, format } from "date-fns";
import { he } from "date-fns/locale";
import Link from "next/link";

async function getDashboardData() {
  const today = startOfDay(new Date());
  const in30Days = addDays(today, 30);

  const [
    totalProperties,
    available,
    rented,
    forSale,
    maintenance,
    newLeadsToday,
    expiringSoon,
    overduePayments,
    unreadAlerts,
    recentLeads,
    availableProperties,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { status: "AVAILABLE" } }),
    prisma.property.count({ where: { status: "RENTED" } }),
    prisma.property.count({ where: { status: "FOR_SALE" } }),
    prisma.property.count({ where: { status: "MAINTENANCE" } }),
    prisma.lead.count({ where: { createdAt: { gte: today } } }),
    prisma.lease.count({ where: { status: "ACTIVE", endDate: { gte: today, lte: in30Days } } }),
    prisma.payment.count({ where: { status: "PENDING", dueDate: { lt: today } } }),
    prisma.scraperAlert.count({ where: { isRead: false } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.property.findMany({
      where: { status: "AVAILABLE" },
      include: { owner: { select: { name: true, phone: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    stats: { totalProperties, available, rented, forSale, maintenance, newLeadsToday, expiringSoon, overduePayments, unreadAlerts },
    recentLeads,
    availableProperties,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const { stats, recentLeads, availableProperties } = await getDashboardData();

  const todayHe = format(new Date(), "EEEE, d בMMMM yyyy", { locale: he });

  const statCards = [
    { label: "סה״כ נכסים", value: stats.totalProperties, icon: Building2, color: "text-slate-700", bg: "bg-slate-100" },
    { label: "פנויים", value: stats.available, icon: CheckCircle2, color: "text-green-700", bg: "bg-green-100" },
    { label: "מושכרים", value: stats.rented, icon: TrendingUp, color: "text-blue-700", bg: "bg-blue-100" },
    { label: "למכירה", value: stats.forSale, icon: Building2, color: "text-purple-700", bg: "bg-purple-100" },
    { label: "לידים היום", value: stats.newLeadsToday, icon: Users, color: "text-orange-700", bg: "bg-orange-100" },
    { label: "חוזים פגי תוקף (30 יום)", value: stats.expiringSoon, icon: Calendar, color: "text-yellow-700", bg: "bg-yellow-100" },
    { label: "תשלומים באיחור", value: stats.overduePayments, icon: AlertTriangle, color: "text-red-700", bg: "bg-red-100" },
    { label: "התראות חדשות", value: stats.unreadAlerts, icon: Bell, color: "text-indigo-700", bg: "bg-indigo-100" },
  ];

  return (
    <div>
      <Topbar title="לוח בקרה" />

      <div className="p-6 space-y-6">
        {/* Welcome */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">שלום, {session?.user?.name ?? "משתמש"} 👋</h2>
          <p className="text-gray-500 text-sm mt-1">{todayHe}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{value.toLocaleString("he-IL")}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Available properties */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">דירות פנויות להשכרה</h3>
                <Link href="/reports" className="text-sm text-blue-600 hover:underline">
                  לדוח מלא
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {availableProperties.length === 0 ? (
                <p className="text-gray-400 text-sm px-6 py-4">אין נכסים פנויים כרגע</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {availableProperties.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/properties/${p.id}`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {p.address}, {p.city}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {p.rooms ? `${p.rooms} חד׳` : ""}
                            {p.size ? ` · ${p.size} מ״ר` : ""}
                            {p.neighborhood ? ` · ${p.neighborhood}` : ""}
                          </p>
                        </div>
                        <div className="text-left">
                          {p.rentPrice && (
                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(p.rentPrice)}</p>
                          )}
                          <p className="text-xs text-gray-400">{p.owner.name}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Recent leads */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">לידים אחרונים</h3>
                <Link href="/leads" className="text-sm text-blue-600 hover:underline">
                  לכל הלידים
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentLeads.length === 0 ? (
                <p className="text-gray-400 text-sm px-6 py-4">אין לידים עדיין</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentLeads.map((lead) => (
                    <li key={lead.id}>
                      <Link
                        href={`/leads`}
                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{lead.name ?? "ליד ללא שם"}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {lead.city ?? ""}
                            {lead.minRooms ? ` · ${lead.minRooms}+ חד׳` : ""}
                            {lead.maxBudget ? ` · עד ${formatCurrency(lead.maxBudget)}` : ""}
                          </p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              lead.status === "NEW" ? "warning" :
                              lead.status === "MATCHED" ? "success" :
                              lead.status === "REJECTED" ? "danger" : "info"
                            }
                          >
                            {lead.status === "NEW" ? "חדש" :
                             lead.status === "CONTACTED" ? "נוצר קשר" :
                             lead.status === "MATCHED" ? "הותאם" :
                             lead.status === "CLOSED" ? "סגור" : "נדחה"}
                          </Badge>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Warnings */}
        {(stats.expiringSoon > 0 || stats.overduePayments > 0 || stats.unreadAlerts > 0) && (
          <div className="space-y-2">
            {stats.expiringSoon > 0 && (
              <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <Clock className="w-4 h-4 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800">
                  <strong>{stats.expiringSoon}</strong> חוזי שכירות פגים תוקפם בחודש הקרוב
                </p>
                <Link href="/properties?filter=expiring" className="mr-auto text-sm text-yellow-700 underline">
                  לצפייה
                </Link>
              </div>
            )}
            {stats.overduePayments > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">
                  <strong>{stats.overduePayments}</strong> תשלומים באיחור דורשים טיפול
                </p>
              </div>
            )}
            {stats.unreadAlerts > 0 && (
              <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <Bell className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  <strong>{stats.unreadAlerts}</strong> התראות חדשות ממדלן ויד2
                </p>
                <Link href="/alerts" className="mr-auto text-sm text-blue-700 underline">
                  לצפייה
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
