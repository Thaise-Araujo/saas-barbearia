import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  clientName: z.string().min(2),
  clientPhone: z.string().min(8),
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
  });
  if (!barbershop) {
    return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Preencha todos os campos corretamente" }, { status: 400 });
  }

  const { clientName, clientPhone, barberId, serviceId, date } = parsed.data;
  const barbershopId = barbershop.id;

  const service = await prisma.service.findFirst({
    where: { id: serviceId, barbershopId, active: true },
  });
  if (!service) {
    return NextResponse.json({ error: "Serviço inválido" }, { status: 400 });
  }

  const barber = await prisma.barber.findFirst({
    where: { id: barberId, barbershopId, active: true },
  });
  if (!barber) {
    return NextResponse.json({ error: "Profissional inválido" }, { status: 400 });
  }

  const requestedStart = new Date(date);
  if (isNaN(requestedStart.getTime()) || requestedStart < new Date()) {
    return NextResponse.json({ error: "Horário inválido" }, { status: 400 });
  }
  const requestedEnd = new Date(
    requestedStart.getTime() + service.durationMin * 60000
  );

  const dayStart = new Date(requestedStart);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const conflicting = await prisma.appointment.findMany({
    where: {
      barbershopId,
      barberId,
      status: { not: "cancelado" },
      date: { gte: dayStart, lt: dayEnd },
    },
    include: { service: { select: { durationMin: true } } },
  });

  const hasConflict = conflicting.some((a) => {
    const existingStart = new Date(a.date);
    const existingEnd = new Date(existingStart.getTime() + a.service.durationMin * 60000);
    return requestedStart < existingEnd && requestedEnd > existingStart;
  });

  if (hasConflict) {
    return NextResponse.json(
      { error: "Este horário acabou de ser reservado. Escolha outro." },
      { status: 409 }
    );
  }

  const client = await prisma.client.upsert({
    where: { barbershopId_phone: { barbershopId, phone: clientPhone } },
    update: { name: clientName },
    create: { name: clientName, phone: clientPhone, barbershopId },
  });

  const appointment = await prisma.appointment.create({
    data: {
      date: requestedStart,
      barbershopId,
      barberId,
      serviceId,
      clientId: client.id,
    },
  });

  return NextResponse.json({ ok: true, appointmentId: appointment.id });
}
