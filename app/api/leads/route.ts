export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { processLeadWithAI } from "@/lib/ai-lead";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ leads, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { rawText, source, sourceUrl } = body;

  if (!rawText) return NextResponse.json({ error: "rawText is required" }, { status: 400 });

  // Process with AI
  const parsed = await processLeadWithAI(rawText);

  const lead = await prisma.lead.create({
    data: {
      rawText,
      source: source ?? "MANUAL",
      sourceUrl,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      city: parsed.city,
      neighborhood: parsed.neighborhood,
      minRooms: parsed.minRooms,
      maxRooms: parsed.maxRooms,
      minBudget: parsed.minBudget,
      maxBudget: parsed.maxBudget,
      propertyType: parsed.propertyType as never,
      requireParking: parsed.requireParking,
      requireElevator: parsed.requireElevator,
      aiSummary: parsed.aiSummary,
      aiQuestions: parsed.aiQuestions,
    },
  });

  return NextResponse.json(lead, { status: 201 });
}
