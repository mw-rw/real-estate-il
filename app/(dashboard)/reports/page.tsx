"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { FileBarChart, Download, RefreshCw, Building2, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

interface ReportData {
  stats: {
    totalProperties: number;
    available: number;
    rented: number;
    forSale: number;
    maintenance: number;
    reserved: number;
    newLeads: number;
    expiringSoon: number;
    overduePayments: number;
  };
  availableList: Array<{
    id: string;
    address: string;
    city: string;
    neighborhood?: string;
    type: string;
    rooms?: number;
    size?: number;
    floor?: number;
    rentPrice?: number;
    salePrice?: number;
    balcony: boolean;
    elevator: boolean;
    parkingSpots?: number;
    furnished: boolean;
    owner: { name: string; phone?: string };
    building?: { name: string };
  }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    const res = await fetch("/api/reports/daily");
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => { fetchReport(); }, []);

  const printReport = () => window.print();

  const todayHe = format(new Date(), "EEEE, d בMMMM yyyy", { locale: he });

  return (
    <div>
      <Topbar title="דוח יומי" />

      <div className="p-6 space-y-6 print:p-0">
        <div className="flex items-center justify-between flex-wrap gap-3 print:hidden">
          <div>
            <h2 className="text-xl font-bold text-gray-900">דוח יומי</h2>
            <p className="text-sm text-gray-500">{todayHe}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={fetchReport} disabled={loading}>
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              רענן
            </Button>
            <Button size="sm" onClick={printReport}>
              <Download className="w-4 h-4" />
              הדפס / PDF
            </Button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold">דוח נכסים פנויים</h1>
          <p className="text-gray-600">{todayHe}</p>
        </div>

        {loading ? (
          <Card><CardContent><p className="text-center text-gray-400 py-12">טוען דוח...</p></CardContent></Card>
        ) : data ? (
          <>
            {/* Stats summary */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { label: "סה״כ נכסים", value: data.stats.totalProperties, color: "text-gray-900" },
                { label: "פנויים", value: data.stats.available, color: "text-green-700" },
                { label: "מושכרים", value: data.stats.rented, color: "text-blue-700" },
                { label: "למכירה", value: data.stats.forSale, color: "text-purple-700" },
                { label: "תחזוקה", value: data.stats.maintenance, color: "text-yellow-700" },
              ].map(({ label, value, color }) => (
                <Card key={label}>
                  <CardContent className="py-4 text-center">
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Available properties */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileBarChart className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">
                    דירות פנויות להשכרה ({data.availableList.length})
                  </h3>
                </div>
              </CardHeader>

              {data.availableList.length === 0 ? (
                <CardContent>
                  <p className="text-gray-400 text-center py-8">אין נכסים פנויים כרגע</p>
                </CardContent>
              ) : (
                <div className="divide-y divide-gray-100">
                  {data.availableList.map((p) => (
                    <div key={p.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {p.address}{p.floor != null ? `, קומה ${p.floor}` : ""}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ""}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <Badge variant="default">{PROPERTY_TYPE_LABELS[p.type] ?? p.type}</Badge>
                              {p.rooms && <Badge variant="gray">{p.rooms} חד׳</Badge>}
                              {p.size && <Badge variant="gray">{p.size} מ״ר</Badge>}
                              {p.balcony && <Badge variant="gray">מרפסת</Badge>}
                              {p.elevator && <Badge variant="gray">מעלית</Badge>}
                              {p.parkingSpots ? <Badge variant="gray">{p.parkingSpots} חניה</Badge> : null}
                              {p.furnished && <Badge variant="success">מרוהט</Badge>}
                            </div>
                          </div>
                        </div>

                        <div className="text-left shrink-0">
                          {p.rentPrice && (
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(p.rentPrice)}</p>
                          )}
                          {p.salePrice && (
                            <p className="text-sm text-gray-500">מכירה: {formatCurrency(p.salePrice)}</p>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{p.owner.name}</span>
                            {p.owner.phone && <span>· {p.owner.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Alerts summary */}
            {(data.stats.expiringSoon > 0 || data.stats.overduePayments > 0) && (
              <Card>
                <CardHeader>
                  <h3 className="font-semibold text-gray-900">נקודות לתשומת לב</h3>
                </CardHeader>
                <CardContent className="space-y-2">
                  {data.stats.expiringSoon > 0 && (
                    <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg p-3">
                      ⚠️ {data.stats.expiringSoon} חוזי שכירות פגים תוקפם ב-30 הימים הקרובים
                    </p>
                  )}
                  {data.stats.overduePayments > 0 && (
                    <p className="text-sm text-red-700 bg-red-50 rounded-lg p-3">
                      🔴 {data.stats.overduePayments} תשלומים באיחור דורשים טיפול
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card><CardContent><p className="text-center text-gray-400 py-12">שגיאה בטעינת הדוח</p></CardContent></Card>
        )}
      </div>
    </div>
  );
}
