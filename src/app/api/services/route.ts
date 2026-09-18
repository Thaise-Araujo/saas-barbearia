import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  durationMin: z.number().int().positive(),
});

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const services = await prisma.service.findMany({
    where: { barbershopId: session.barbershopId },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const service = await prisma.service.create({
    data: { ...parsed.data, barbershopId: session.barbershopId },
  });
  return NextResponse.json(service);
}
