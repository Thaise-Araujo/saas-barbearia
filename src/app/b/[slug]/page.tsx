import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import BookingForm from "@/components/BookingForm";

export default async function PublicBookingPage({
  params,
}: {
  params: { slug: string };
}) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { slug: params.slug },
  });

  if (!barbershop) notFound();

  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-8 text-center">
          <h1 className="font-display text-3xl font-bold">{barbershop.name}</h1>
          <p className="mt-2 text-sm text-ink/60">
            {barbershop.address && <span>{barbershop.address} · </span>}
            {barbershop.phone && <span>{barbershop.phone}</span>}
          </p>
          <p className="mt-1 text-xs text-ink/40">
            Aberto das {barbershop.openTime} às {barbershop.closeTime}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <BookingForm slug={params.slug} />
      </div>

      <footer className="py-8 text-center text-xs text-ink/40">
        Agendamento online via BarberSaaS
      </footer>
    </main>
  );
}
