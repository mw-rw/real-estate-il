"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Upload, FileText, Image, File, Search } from "lucide-react";

const DOC_TYPE_LABELS: Record<string, string> = {
  CONTRACT: "חוזה",
  FLOOR_PLAN: "תוכנית קומה",
  PERMIT: "היתר בנייה",
  INVOICE: "חשבונית",
  IDENTITY: "תעודת זהות",
  TABU: "נסח טאבו",
  OTHER: "אחר",
};

const FILE_ICONS: Record<string, React.ReactNode> = {
  "application/pdf": <FileText className="w-5 h-5 text-red-500" />,
  "image/jpeg": <Image className="w-5 h-5 text-blue-500" />,
  "image/png": <Image className="w-5 h-5 text-blue-500" />,
};

export default function DocumentsPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <Topbar title="מסמכים ותוכניות" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">מסמכים ותוכניות קומה</h2>
            <p className="text-sm text-gray-500">אחסון מאובטח של כל מסמכי הנכסים</p>
          </div>
          <Button>
            <Upload className="w-4 h-4" />
            העלאת מסמך
          </Button>
        </div>

        {/* Search */}
        <Card>
          <div className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="חיפוש מסמכים..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-9 pl-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        </Card>

        {/* Category cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.entries(DOC_TYPE_LABELS).map(([type, label]) => (
            <Card key={type} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="py-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">0 קבצים</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload zone */}
        <Card>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">גרור קבצים לכאן</p>
              <p className="text-sm text-gray-400 mt-1">PDF, תמונות, Word – עד 50MB</p>
              <Button variant="secondary" size="sm" className="mt-4">
                בחר קבצים
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent documents placeholder */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">מסמכים אחרונים</h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center py-10 text-gray-400">
              <File className="w-10 h-10 mb-3 opacity-30" />
              <p>אין מסמכים עדיין</p>
              <p className="text-sm mt-1">העלה את המסמך הראשון שלך</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
