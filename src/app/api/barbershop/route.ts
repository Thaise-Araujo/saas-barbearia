import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const updated = await prisma.barbershop.update({
    where: { id: session.barbershopId },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}
