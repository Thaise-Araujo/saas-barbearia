import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
    include: {
      barbers: { where: { active: true }, orderBy: { createdAt: "asc" } },
      services: { where: { active: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!barbershop) {
    return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 });
  }

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

  const busyAppointments = await prisma.appointment.findMany({
    where: {
      barbershopId: barbershop.id,
      date: { gte: now, lte: in14Days },
      status: { not: "cancelado" },
    },
    select: { id: true, date: true, barberId: true, service: { select: { durationMin: true } } },
  });

  return NextResponse.json({
    id: barbershop.id,
    name: barbershop.name,
    slug: barbershop.slug,
    phone: barbershop.phone,
    address: barbershop.address,
    openTime: barbershop.openTime,
    closeTime: barbershop.closeTime,
    barbers: barbershop.barbers,
    services: barbershop.services,
    busy: busyAppointments.map((a) => ({
      barberId: a.barberId,
      date: a.date,
      durationMin: a.service.durationMin,
    })),
  });
}
