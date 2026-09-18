import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  status: z.enum(["agendado", "concluido", "cancelado"]).optional(),
  date: z.string().optional(),
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

  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, barbershopId: session.barbershopId },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  const updated = await prisma.appointment.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.date ? { date: new Date(parsed.data.date) } : {}),
    },
    include: { client: true, service: true, barber: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const existing = await prisma.appointment.findFirst({
    where: { id: params.id, barbershopId: session.barbershopId },
  });
  if (!existing) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
