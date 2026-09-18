import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

export default async function DashboardHome() {
  const session = getSession()!;
  const barbershopId = session.barbershopId;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [todayAppointments, monthAppointments, clientCount, barberCount, upcoming] =
    await Promise.all([
      prisma.appointment.count({
        where: {
          barbershopId,
          date: { gte: startOfDay, lt: endOfDay },
          status: { not: "cancelado" },
        },
      }),
      prisma.appointment.findMany({
        where: {
          barbershopId,
          date: { gte: startOfMonth, lt: endOfMonth },
          status: { not: "cancelado" },
        },
        include: { service: true },
      }),
      prisma.client.count({ where: { barbershopId } }),
      prisma.barber.count({ where: { barbershopId, active: true } }),
      prisma.appointment.findMany({
        where: {
          barbershopId,
          date: { gte: now },
          status: { not: "cancelado" },
        },
        include: { client: true, service: true, barber: true },
        orderBy: { date: "asc" },
        take: 6,
      }),
    ]);

  const monthRevenue = monthAppointments.reduce(
    (sum, a) => sum + a.service.price,
    0
  );

  const stats = [
    { label: "Agendamentos hoje", value: todayAppointments },
    { label: "Faturamento do mês", value: formatCurrency(monthRevenue) },
    { label: "Clientes cadastrados", value: clientCount },
    { label: "Barbeiros ativos", value: barberCount },
  ];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Visão geral</h1>
      <p className="mb-8 text-sm text-ink/60">
        Resumo da sua barbearia hoje, {formatDate(now)}.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className="text-sm text-ink/60">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="mb-4 text-lg font-semibold">Próximos agendamentos</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink/50">Nenhum agendamento futuro.</p>
        ) : (
          <div className="divide-y divide-ink/10">
            {upcoming.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{a.client.name}</p>
                  <p className="text-sm text-ink/60">
                    {a.service.name} · {a.barber.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatDateTime(a.date)}</p>
                  <p className="text-xs text-ink/50">{formatCurrency(a.service.price)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
