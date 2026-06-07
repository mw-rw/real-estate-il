import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "נדל\"ן IL - מערכת ניהול נכסים",
  description: "פלטפורמת ניהול נדל\"ן מקצועית",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={rubik.variable}>
      <body className="bg-gray-50 text-gray-900 font-[family-name:var(--font-rubik)] h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
