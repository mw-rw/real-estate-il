"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, RefreshCw, ExternalLink, AlertTriangle, TrendingDown, TrendingUp, RotateCcw } from "lucide-react";

interface Alert {
  id: string;
  alertType: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  listing: {
    source: string;
    url: string;
    title: string;
    price?: number;
    city?: string;
    address?: string;
  };
  property?: {
    id: string;
    address: string;
    city: string;
  };
}

const ALERT_ICONS: Record<string, React.ReactNode> = {
  LISTING_DOWN: <TrendingDown className="w-4 h-4 text-red-500" />,
  PRICE_CHANGE: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  NEW_LISTING: <TrendingUp className="w-4 h-4 text-green-500" />,
  RELISTED: <RotateCcw className="w-4 h-4 text-blue-500" />,
};

const ALERT_LABELS: Record<string, string> = {
  LISTING_DOWN: "מודעה ירדה",
  PRICE_CHANGE: "שינוי מחיר",
  NEW_LISTING: "מודעה חדשה",
  RELISTED: "פורסם מחדש",
};

const ALERT_BADGE: Record<string, "danger" | "warning" | "success" | "info"> = {
  LISTING_DOWN: "danger",
  PRICE_CHANGE: "warning",
  NEW_LISTING: "success",
  RELISTED: "info",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/scraper${showUnreadOnly ? "?unread=true" : ""}`);
    const data = await res.json();
    setAlerts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [showUnreadOnly]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const markAllRead = async () => {
    const unread = alerts.filter((a) => !a.isRead).map((a) => a.id);
    if (!unread.length) return;
    await fetch("/api/scraper", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unread }),
    });
    fetchAlerts();
  };

  const runScrape = async () => {
    setScraping(true);
    await fetch("/api/scraper", { method: "POST" });
    fetchAlerts();
    setScraping(false);
  };

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  return (
    <div>
      <Topbar title="התראות סריקה" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">התראות יד2 ומדלן</h2>
            <p className="text-sm text-gray-500">
              {unreadCount > 0 ? <span className="text-red-600 font-medium">{unreadCount} התראות חדשות</span> : "אין התראות חדשות"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
              {showUnreadOnly ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              {showUnreadOnly ? "הצג הכל" : "לא נקראו"}
            </Button>
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={markAllRead}>
                סמן הכל כנקרא
              </Button>
            )}
            <Button size="sm" onClick={runScrape} disabled={scraping}>
              <RefreshCw className={`w-4 h-4 ${scraping ? "animate-spin" : ""}`} />
              {scraping ? "סורק..." : "הפעל סריקה"}
            </Button>
          </div>
        </div>

        {/* Info card */}
        <Card>
          <CardContent className="py-3">
            <p className="text-sm text-gray-600">
              המערכת סורקת אוטומטית את יד2 ומדלן פעם ביום לפי ערי הנכסים שלך. כשמודעה יורדת מהאוויר — תקבל התראה מיידית.
            </p>
          </CardContent>
        </Card>

        {/* Alerts list */}
        <div className="space-y-2">
          {loading ? (
            <Card><CardContent><p className="text-center text-gray-400 py-8">טוען...</p></CardContent></Card>
          ) : alerts.length === 0 ? (
            <Card>
              <CardContent>
                <div className="flex flex-col items-center py-12 text-gray-400">
                  <Bell className="w-10 h-10 mb-3 opacity-30" />
                  <p>אין התראות</p>
                  <p className="text-sm mt-1">הפעל סריקה כדי לחפש שינויים</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border ${alert.isRead ? "border-gray-200" : "border-blue-300 shadow-sm"} p-4`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{ALERT_ICONS[alert.alertType]}</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={ALERT_BADGE[alert.alertType] ?? "default"}>
                          {ALERT_LABELS[alert.alertType] ?? alert.alertType}
                        </Badge>
                        <Badge variant="gray">{alert.listing.source}</Badge>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {alert.listing.title}
                        {alert.listing.city ? ` · ${alert.listing.city}` : ""}
                        {alert.listing.price ? ` · ₪${alert.listing.price.toLocaleString("he-IL")}` : ""}
                      </p>
                      {alert.property && (
                        <p className="text-xs text-blue-600 mt-1">
                          קשור לנכס: {alert.property.address}, {alert.property.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-400">
                      {new Date(alert.createdAt).toLocaleDateString("he-IL")}
                    </span>
                    <a
                      href={alert.listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
