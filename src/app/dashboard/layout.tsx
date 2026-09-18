import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = getSession();
  if (!session) redirect("/login");

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: session.barbershopId },
  });
  if (!barbershop) redirect("/login");

  return (
    <DashboardShell
      barbershopName={barbershop.name}
      slug={barbershop.slug}
      userName={session.name}
    >
      {children}
    </DashboardShell>
  );
}
