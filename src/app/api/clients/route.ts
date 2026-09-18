import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  phone: z.string().min(8),
});

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { barbershopId: session.barbershopId },
    include: { _count: { select: { appointments: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const client = await prisma.client.create({
      data: { ...parsed.data, barbershopId: session.barbershopId },
    });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json(
      { error: "Já existe um cliente com este telefone" },
      { status: 409 }
    );
  }
}
