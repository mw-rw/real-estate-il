"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/utils";
import { Plus, Sparkles, Send, X, ChevronDown, ChevronUp, User, Phone, MapPin, Home } from "lucide-react";

interface Lead {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  city?: string;
  neighborhood?: string;
  minRooms?: number;
  maxRooms?: number;
  minBudget?: number;
  maxBudget?: number;
  propertyType?: string;
  requireParking?: boolean;
  requireElevator?: boolean;
  source: string;
  status: string;
  aiSummary?: string;
  aiQuestions: string[];
  rawText: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "warning",
  CONTACTED: "info",
  QUALIFIED: "success",
  MATCHED: "success",
  CLOSED: "gray",
  REJECTED: "danger",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/leads?limit=30");
    const data = await res.json();
    setLeads(data.leads ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const submitLead = async () => {
    if (!rawText.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText }),
    });
    if (res.ok) {
      setRawText("");
      setShowNewForm(false);
      fetchLeads();
    }
    setSubmitting(false);
  };

  return (
    <div>
      <Topbar title="ניהול לידים" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">לידים</h2>
            <p className="text-sm text-gray-500">{total} לידים במערכת</p>
          </div>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="w-4 h-4" />
            ליד חדש
          </Button>
        </div>

        {/* New Lead Form */}
        {showNewForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">קליטת ליד חדש עם AI</h3>
                </div>
                <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                הדבק כאן טקסט חופשי מוואטסאפ, אימייל או שיחת טלפון. ה-AI יחלץ אוטומטית את הפרטים ויציע שאלות השלמה.
              </p>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="לדוגמה: שלום, אני מחפש דירת 3 חדרים בתל אביב אזור הצפון, תקציב עד 8,000 ש״ח לחודש, צריך חניה..."
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none"
                dir="rtl"
              />
              <div className="flex gap-2 mt-3 justify-end">
                <Button variant="secondary" onClick={() => setShowNewForm(false)}>ביטול</Button>
                <Button onClick={submitLead} disabled={submitting || !rawText.trim()}>
                  <Send className="w-4 h-4" />
                  {submitting ? "מעבד..." : "שלח לעיבוד AI"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leads list */}
        <div className="space-y-3">
          {loading ? (
            <Card>
              <CardContent>
                <p className="text-gray-400 text-center py-8">טוען לידים...</p>
              </CardContent>
            </Card>
          ) : leads.length === 0 ? (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <User className="w-10 h-10 mb-3 opacity-30" />
                  <p>אין לידים עדיין</p>
                  <p className="text-sm mt-1">לחץ על &quot;ליד חדש&quot; כדי להוסיף</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            leads.map((lead) => (
              <Card key={lead.id} className="overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900">{lead.name ?? "ליד ללא שם"}</h3>
                        <Badge variant={STATUS_COLORS[lead.status] as never}>
                          {LEAD_STATUS_LABELS[lead.status]}
                        </Badge>
                        <Badge variant="gray">{LEAD_SOURCE_LABELS[lead.source]}</Badge>
                      </div>

                      {/* Quick info */}
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {lead.city}{lead.neighborhood ? ` · ${lead.neighborhood}` : ""}
                          </span>
                        )}
                        {(lead.minRooms || lead.maxRooms) && (
                          <span className="flex items-center gap-1">
                            <Home className="w-3.5 h-3.5" />
                            {lead.minRooms ?? "?"} - {lead.maxRooms ?? "?"} חד׳
                          </span>
                        )}
                        {lead.maxBudget && (
                          <span>עד {formatCurrency(lead.maxBudget)}</span>
                        )}
                      </div>

                      {/* AI Summary */}
                      {lead.aiSummary && (
                        <p className="text-sm text-gray-500 mt-2 bg-blue-50 rounded px-3 py-2 border-r-2 border-blue-300">
                          <Sparkles className="w-3.5 h-3.5 inline ml-1 text-blue-400" />
                          {lead.aiSummary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">
                        {new Date(lead.createdAt).toLocaleDateString("he-IL")}
                      </span>
                      {expanded === lead.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded */}
                {expanded === lead.id && (
                  <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                    {/* AI Questions */}
                    {lead.aiQuestions?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-blue-400" />
                          שאלות השלמה מה-AI
                        </h4>
                        <ul className="space-y-1">
                          {lead.aiQuestions.map((q, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-blue-400 font-medium mt-0.5">{i + 1}.</span>
                              {q}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Raw text */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">טקסט מקורי</h4>
                      <p className="text-sm text-gray-500 bg-gray-50 rounded p-3 whitespace-pre-wrap">{lead.rawText}</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {lead.propertyType && (
                        <div>
                          <span className="text-gray-400 block text-xs">סוג נכס</span>
                          <span className="font-medium">{PROPERTY_TYPE_LABELS[lead.propertyType] ?? lead.propertyType}</span>
                        </div>
                      )}
                      {lead.requireParking != null && (
                        <div>
                          <span className="text-gray-400 block text-xs">חניה</span>
                          <span className="font-medium">{lead.requireParking ? "נדרשת" : "לא נדרשת"}</span>
                        </div>
                      )}
                      {lead.requireElevator != null && (
                        <div>
                          <span className="text-gray-400 block text-xs">מעלית</span>
                          <span className="font-medium">{lead.requireElevator ? "נדרשת" : "לא נדרשת"}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary">עדכן סטטוס</Button>
                      <Button size="sm" variant="secondary">התאם נכסים</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
