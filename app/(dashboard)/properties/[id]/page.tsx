"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatCurrency,
  PROPERTY_STATUS_LABELS,
  PROPERTY_STATUS_COLORS,
  PROPERTY_TYPE_LABELS,
} from "@/lib/utils";
import {
  ArrowRight,
  MapPin,
  Home,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

interface Tenant { name: string; phone?: string; email?: string; idNumber?: string }
interface Payment { id: string; amount: number; dueDate: string; paidDate?: string; status: string }
interface Lease {
  id: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  status: string;
  tenant: Tenant;
  payments: Payment[];
}
interface Property {
  id: string;
  address: string;
  city: string;
  neighborhood?: string;
  floor?: number;
  type: string;
  status: string;
  rooms?: number;
  size?: number;
  rentPrice?: number;
  salePrice?: number;
  elevator?: boolean;
  balcony?: boolean;
  parkingSpots?: number;
  notes?: string;
  owner: { name: string; phone?: string; email?: string; idNumber?: string };
  leases: Lease[];
  documents: Array<{ id: string; name: string; type: string; createdAt: string }>;
}

const PAYMENT_STATUS: Record<string, string> = {
  PAID: "שולם",
  PENDING: "ממתין",
  LATE: "באיחור",
  PARTIAL: "חלקי",
};
const PAYMENT_COLORS: Record<string, string> = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-gray-100 text-gray-600",
  LATE: "bg-red-100 text-red-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
};

export default function PropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((data) => { setProperty(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">טוען...</div>;
  if (!property) return <div className="flex items-center justify-center h-64 text-gray-500">הנכס לא נמצא</div>;

  const activeLease = property.leases.find((l) => l.status === "ACTIVE") ?? property.leases[0];

  return (
    <div>
      <Topbar title={property.address} />

      <div className="p-6 space-y-6">
        {/* Back + Header */}
        <div className="flex items-start justify-between">
          <div>
            <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-2">
              <ArrowRight className="w-4 h-4" />
              חזרה לנכסים
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
            <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              {property.city}
              {property.neighborhood && ` · ${property.neighborhood}`}
              {property.floor != null && ` · קומה ${property.floor}`}
            </div>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PROPERTY_STATUS_COLORS[property.status] ?? "bg-gray-100 text-gray-700"}`}>
            {PROPERTY_STATUS_LABELS[property.status] ?? property.status}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <Card>
              <div className="p-5">
                <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4" /> פרטי הנכס
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                  <div><p className="text-gray-400">סוג</p><p className="font-medium">{PROPERTY_TYPE_LABELS[property.type] ?? property.type}</p></div>
                  {property.rooms != null && <div><p className="text-gray-400">חדרים</p><p className="font-medium">{property.rooms}</p></div>}
                  {property.size != null && <div><p className="text-gray-400">שטח</p><p className="font-medium">{property.size} מ״ר</p></div>}
                  {property.rentPrice != null && <div><p className="text-gray-400">שכ״ד</p><p className="font-medium">{formatCurrency(property.rentPrice)}</p></div>}
                  {property.salePrice != null && <div><p className="text-gray-400">מחיר מכירה</p><p className="font-medium">{formatCurrency(property.salePrice)}</p></div>}
                  {property.parkingSpots != null && property.parkingSpots > 0 && <div><p className="text-gray-400">חניה</p><p className="font-medium">{property.parkingSpots} מקום</p></div>}
                  <div><p className="text-gray-400">מעלית</p><p className="font-medium">{property.elevator ? "כן" : "לא"}</p></div>
                  <div><p className="text-gray-400">מרפסת</p><p className="font-medium">{property.balcony ? "כן" : "לא"}</p></div>
                </div>
                {property.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-gray-400 text-sm mb-1">הערות</p>
                    <p className="text-sm text-gray-700">{property.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Active lease */}
            {activeLease && (
              <Card>
                <div className="p-5">
                  <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4" /> חוזה שכירות פעיל
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
                    <div><p className="text-gray-400">שוכר</p><p className="font-medium">{activeLease.tenant.name}</p></div>
                    {activeLease.tenant.phone && <div><p className="text-gray-400">טלפון</p><p className="font-medium">{activeLease.tenant.phone}</p></div>}
                    <div><p className="text-gray-400">שכ״ד חודשי</p><p className="font-medium">{formatCurrency(activeLease.monthlyRent)}</p></div>
                    <div><p className="text-gray-400">פיקדון</p><p className="font-medium">{formatCurrency(activeLease.deposit)}</p></div>
                    <div><p className="text-gray-400">תחילה</p><p className="font-medium">{new Date(activeLease.startDate).toLocaleDateString("he-IL")}</p></div>
                    <div><p className="text-gray-400">סיום</p><p className="font-medium">{new Date(activeLease.endDate).toLocaleDateString("he-IL")}</p></div>
                  </div>

                  {activeLease.payments.length > 0 && (
                    <>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">תשלומים אחרונים</h3>
                      <div className="space-y-2">
                        {activeLease.payments.map((pay) => (
                          <div key={pay.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{new Date(pay.dueDate).toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</span>
                            <span className="font-medium">{formatCurrency(pay.amount)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${PAYMENT_COLORS[pay.status] ?? "bg-gray-100 text-gray-600"}`}>
                              {PAYMENT_STATUS[pay.status] ?? pay.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Owner */}
            <Card>
              <div className="p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" /> בעל הנכס
                </h2>
                <p className="font-medium text-gray-900">{property.owner.name}</p>
                {property.owner.phone && (
                  <a href={`tel:${property.owner.phone}`} className="flex items-center gap-1 text-sm text-blue-600 mt-1 hover:underline">
                    <Phone className="w-3 h-3" /> {property.owner.phone}
                  </a>
                )}
                {property.owner.email && (
                  <a href={`mailto:${property.owner.email}`} className="flex items-center gap-1 text-sm text-blue-600 mt-1 hover:underline">
                    <Mail className="w-3 h-3" /> {property.owner.email}
                  </a>
                )}
              </div>
            </Card>

            {/* Documents */}
            <Card>
              <div className="p-5">
                <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> מסמכים ({property.documents.length})
                </h2>
                {property.documents.length === 0 ? (
                  <p className="text-sm text-gray-400">אין מסמכים</p>
                ) : (
                  <ul className="space-y-2">
                    {property.documents.map((doc) => (
                      <li key={doc.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{doc.name}</span>
                        <span className="text-xs text-gray-400">{new Date(doc.createdAt).toLocaleDateString("he-IL")}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
