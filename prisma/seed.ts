import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const barbershop = await prisma.barbershop.upsert({
    where: { slug: "barbearia-modelo" },
    update: {},
    create: {
      name: "Barbearia Modelo",
      slug: "barbearia-modelo",
      phone: "(11) 99999-0000",
      address: "Rua das Tesouras, 123 - Centro",
      openTime: "09:00",
      closeTime: "19:00",
      users: {
        create: {
          name: "Administrador",
          email: "admin@barbearia.com",
          password: passwordHash,
        },
      },
      barbers: {
        create: [{ name: "João Silva" }, { name: "Carlos Souza" }],
      },
      services: {
        create: [
          { name: "Corte de Cabelo", price: 40, durationMin: 30 },
          { name: "Barba", price: 25, durationMin: 20 },
          { name: "Corte + Barba", price: 60, durationMin: 50 },
          { name: "Sobrancelha", price: 15, durationMin: 10 },
        ],
      },
    },
  });

  console.log("Seed concluído. Barbearia:", barbershop.slug);
  console.log("Login: admin@barbearia.com / senha: 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
