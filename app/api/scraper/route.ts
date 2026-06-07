export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runDailyScrape } from "@/lib/scraper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Allow cron secret or authenticated user
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDailyScrape();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const alerts = await prisma.scraperAlert.findMany({
    where: unreadOnly ? { isRead: false } : undefined,
    include: {
      listing: true,
      property: { select: { id: true, address: true, city: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(alerts);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { ids } = await req.json();
  await prisma.scraperAlert.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true });
}
