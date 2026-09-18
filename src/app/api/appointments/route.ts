import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  clientName: z.string().min(1),
  clientPhone: z.string().min(8),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const appointments = await prisma.appointment.findMany({
    where: {
      barbershopId: session.barbershopId,
      ...(from && to
        ? { date: { gte: new Date(from), lt: new Date(to) } }
        : {}),
    },
    include: { client: true, service: true, barber: true },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { clientName, clientPhone, barberId, serviceId, date, notes } = parsed.data;
  const barbershopId = session.barbershopId;

  const client = await prisma.client.upsert({
    where: { barbershopId_phone: { barbershopId, phone: clientPhone } },
    update: { name: clientName },
    create: { name: clientName, phone: clientPhone, barbershopId },
  });

  const appointment = await prisma.appointment.create({
    data: {
      date: new Date(date),
      barbershopId,
      barberId,
      serviceId,
      clientId: client.id,
      notes,
    },
    include: { client: true, service: true, barber: true },
  });

  return NextResponse.json(appointment);
}
