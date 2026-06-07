import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const property = await prisma.property.findUnique({
    where: { id: params.id },
    include: {
      owner: true,
      building: true,
      leases: {
        include: { tenant: true, payments: { orderBy: { dueDate: "desc" }, take: 6 } },
        orderBy: { startDate: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      floorPlans: true,
      alerts: {
        include: { listing: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const property = await prisma.property.update({
    where: { id: params.id },
    data: body,
    include: { owner: true },
  });

  return NextResponse.json(property);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
