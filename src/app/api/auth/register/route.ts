import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const schema = z.object({
  ownerName: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
  barbershopName: z.string().min(2, "Informe o nome da barbearia"),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Dados inválidos" },
      { status: 400 }
    );
  }

  const { ownerName, email, password, barbershopName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Já existe uma conta com este e-mail" },
      { status: 409 }
    );
  }

  let baseSlug = slugify(barbershopName) || "barbearia";
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.barbershop.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const barbershop = await prisma.barbershop.create({
    data: {
      name: barbershopName,
      slug,
      users: {
        create: {
          name: ownerName,
          email,
          password: passwordHash,
        },
      },
      barbers: {
        create: [{ name: ownerName }],
      },
      services: {
        create: [
          { name: "Corte de Cabelo", price: 40, durationMin: 30 },
          { name: "Barba", price: 25, durationMin: 20 },
        ],
      },
    },
    include: { users: true },
  });

  const user = barbershop.users[0];
  const token = signSession({
    userId: user.id,
    barbershopId: barbershop.id,
    name: user.name,
    email: user.email,
  });
  setSessionCookie(token);

  return NextResponse.json({ ok: true, slug: barbershop.slug });
}
