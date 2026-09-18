import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  durationMin: z.number().int().positive().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const existing = await prisma.service.findFirst({
    where: { id: params.id, barbershopId: session.barbershopId },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.service.update({
    where: { id: params.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const existing = await prisma.service.findFirst({
    where: { id: params.id, barbershopId: session.barbershopId },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.service.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
