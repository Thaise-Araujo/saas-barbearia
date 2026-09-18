import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: session.barbershopId },
  });
  if (!barbershop) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

  return NextResponse.json(barbershop);
}
