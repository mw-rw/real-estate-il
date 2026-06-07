"use client";

import { useSession } from "next-auth/react";
import { Bell } from "lucide-react";
import { useEffect, useState } from "react";

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/scraper?unread=true")
      .then((r) => r.json())
      .then((data) => setUnreadCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, []);

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-4">
        {/* Alerts bell */}
        <a href="/alerts" className="relative text-gray-500 hover:text-gray-900 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </a>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
            {session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "?"}
          </div>
          <span className="text-sm text-gray-700 hidden sm:block">{session?.user?.name ?? session?.user?.email}</span>
        </div>
      </div>
    </header>
  );
}
