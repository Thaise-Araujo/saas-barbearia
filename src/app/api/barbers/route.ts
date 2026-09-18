import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({ name: z.string().min(1) });

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const barbers = await prisma.barber.findMany({
    where: { barbershopId: session.barbershopId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(barbers);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const barber = await prisma.barber.create({
    data: { ...parsed.data, barbershopId: session.barbershopId },
  });
  return NextResponse.json(barber);
}
