import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(date));
}

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  APARTMENT: "דירה",
  PENTHOUSE: "פנטהאוס",
  GARDEN_APARTMENT: "דירת גן",
  STUDIO: "סטודיו",
  DUPLEX: "דופלקס",
  COMMERCIAL: "מסחרי",
  OFFICE: "משרד",
  WAREHOUSE: "מחסן",
  PARKING: "חניה",
  OTHER: "אחר",
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "פנוי",
  RENTED: "מושכר",
  FOR_SALE: "למכירה",
  SOLD: "נמכר",
  MAINTENANCE: "תחזוקה",
  RESERVED: "שמור",
};

export const PROPERTY_STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RENTED: "bg-blue-100 text-blue-800",
  FOR_SALE: "bg-purple-100 text-purple-800",
  SOLD: "bg-gray-100 text-gray-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RESERVED: "bg-orange-100 text-orange-800",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "חדש",
  CONTACTED: "נוצר קשר",
  QUALIFIED: "מאושר",
  MATCHED: "הותאם",
  CLOSED: "סגור",
  REJECTED: "נדחה",
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  MANUAL: "ידני",
  YAD2: "יד2",
  MADLAN: "מדלן",
  PHONE: "טלפון",
  WHATSAPP: "וואטסאפ",
  EMAIL: "אימייל",
  WEBSITE: "אתר",
};
