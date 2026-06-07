export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runDailyScrape, scrapeYad2 } from "@/lib/scraper";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await runDailyScrape();
  return NextResponse.json(result);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listings = await scrapeYad2("תל אביב");
  return NextResponse.json({ count: listings.length, sample: listings.slice(0, 3) });
}
