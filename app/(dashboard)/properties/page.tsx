"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_COLORS, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Search, Plus, Building2, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Property {
  id: string;
  address: string;
  city: string;
  neighborhood?: string;
  type: string;
  status: string;
  rooms?: number;
  size?: number;
  floor?: number;
  rentPrice?: number;
  salePrice?: number;
  owner: { id: string; name: string; phone?: string };
  leases: Array<{ tenant: { name: string; phone?: string } }>;
  _count: { documents: number; alerts: number };
}

const STATUS_OPTIONS = [
  { value: "", label: "כל הסטטוסים" },
  { value: "AVAILABLE", label: "פנוי" },
  { value: "RENTED", label: "מושכר" },
  { value: "FOR_SALE", label: "למכירה" },
  { value: "MAINTENANCE", label: "תחזוקה" },
  { value: "SOLD", label: "נמכר" },
  { value: "RESERVED", label: "שמור" },
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "30" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(`/api/properties?${params}`);
    const data = await res.json();
    setProperties(data.properties ?? []);
    setTotal(data.total ?? 0);
    setPages(data.pages ?? 1);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  return (
    <div>
      <Topbar title="ניהול נכסים" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">נכסים</h2>
            <p className="text-sm text-gray-500">{total.toLocaleString("he-IL")} נכסים במערכת</p>
          </div>
          <Button size="md">
            <Plus className="w-4 h-4" />
            נכס חדש
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-4 flex flex-wrap gap-3 items-center">
            <div className="flex-1 min-w-48">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש לפי כתובת, עיר, קוד..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-gray-400" />
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">טוען...</div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Building2 className="w-8 h-8 mb-2 opacity-40" />
              <p>לא נמצאו נכסים</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">כתובת</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">סוג</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">חד׳ / מ״ר</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">מחיר</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">בעלים</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">שוכר</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">סטטוס</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{p.address}</p>
                          <p className="text-xs text-gray-500">{p.city}{p.neighborhood ? ` · ${p.neighborhood}` : ""}{p.floor != null ? ` · קומה ${p.floor}` : ""}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{PROPERTY_TYPE_LABELS[p.type] ?? p.type}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.rooms ? `${p.rooms}` : "—"}
                        {p.size ? ` / ${p.size}` : ""}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.rentPrice ? formatCurrency(p.rentPrice) : p.salePrice ? formatCurrency(p.salePrice) : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.owner.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.leases[0]?.tenant.name ?? <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PROPERTY_STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {PROPERTY_STATUS_LABELS[p.status] ?? p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/properties/${p.id}`}>
                          <Button variant="ghost" size="sm">
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                עמוד {page} מתוך {pages} ({total.toLocaleString("he-IL")} נכסים)
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
