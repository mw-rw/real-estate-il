export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runDailyScrape } from "@/lib/scraper";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
  const alerts = await prisma.scraperAlert.findMany({
    where: unreadOnly ? { isRead: false } : {},
    include: { listing: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(alerts);
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runDailyScrape();
  return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  await prisma.scraperAlert.updateMany({ where: { id: { in: ids } }, data: { isRead: true } });
  return NextResponse.json({ success: true });
}
