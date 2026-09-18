"use client";

import { useEffect, useMemo, useState } from "react";
import { classNames, formatCurrency } from "@/lib/utils";

type Service = { id: string; name: string; price: number; durationMin: number };
type Barber = { id: string; name: string };
type Busy = { barberId: string; date: string; durationMin: number };

type PublicData = {
  name: string;
  openTime: string;
  closeTime: string;
  services: Service[];
  barbers: Barber[];
  busy: Busy[];
};

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function nextDays(n: number) {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

function generateSlots(
  dateStr: string,
  openTime: string,
  closeTime: string,
  durationMin: number,
  busyForBarber: Busy[]
) {
  const [oh, om] = openTime.split(":").map(Number);
  const [ch, cm] = closeTime.split(":").map(Number);

  const dayClose = new Date(`${dateStr}T00:00:00`);
  dayClose.setHours(ch, cm, 0, 0);

  let cursor = new Date(`${dateStr}T00:00:00`);
  cursor.setHours(oh, om, 0, 0);

  const now = new Date();
  const slots: Date[] = [];
  const step = 15;

  while (cursor.getTime() + durationMin * 60000 <= dayClose.getTime()) {
    if (cursor.getTime() > now.getTime()) {
      const slotEnd = new Date(cursor.getTime() + durationMin * 60000);
      const conflict = busyForBarber.some((b) => {
        const bStart = new Date(b.date);
        const bEnd = new Date(bStart.getTime() + b.durationMin * 60000);
        return cursor < bEnd && slotEnd > bStart;
      });
      if (!conflict) slots.push(new Date(cursor));
    }
    cursor = new Date(cursor.getTime() + step * 60000);
  }
  return slots;
}

export default function BookingForm({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState(toInputDate(new Date()));
  const [time, setTime] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");

  const days = useMemo(() => nextDays(14), []);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/public/${slug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.services[0]) setServiceId(json.services[0].id);
        if (json.barbers[0]) setBarberId(json.barbers[0].id);
      } else {
        setError("Não foi possível carregar os dados da barbearia.");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const service = data?.services.find((s) => s.id === serviceId);

  const slots = useMemo(() => {
    if (!data || !service || !barberId) return [];
    const busyForBarber = data.busy.filter((b) => b.barberId === barberId);
    return generateSlots(date, data.openTime, data.closeTime, service.durationMin, busyForBarber);
  }, [data, service, barberId, date]);

  useEffect(() => {
    setTime("");
  }, [date, barberId, serviceId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!serviceId || !barberId || !time || !clientName || !clientPhone) {
      setError("Preencha todos os campos para continuar.");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/public/${slug}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientPhone,
        barberId,
        serviceId,
        date: time,
      }),
    });
    setSubmitting(false);
    const resData = await res.json();
    if (!res.ok) {
      setError(resData.error || "Erro ao agendar. Tente outro horário.");
      return;
    }
    setSuccess(true);
  }

  if (loading) {
    return <p className="text-center text-sm text-ink/50">Carregando...</p>;
  }

  if (!data) {
    return (
      <p className="text-center text-sm text-red-600">
        {error || "Barbearia não encontrada."}
      </p>
    );
  }

  if (success) {
    return (
      <div className="card text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h2 className="mb-1 text-xl font-semibold">Agendamento confirmado!</h2>
        <p className="text-sm text-ink/60">
          {clientName}, seu horário foi reservado com sucesso. Chegue com alguns
          minutos de antecedência.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label className="label">Serviço</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {data.services.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => setServiceId(s.id)}
              className={classNames(
                "rounded-lg border px-4 py-3 text-left text-sm transition",
                serviceId === s.id
                  ? "border-gold-500 bg-gold-50"
                  : "border-ink/15 hover:border-ink/30"
              )}
            >
              <p className="font-medium">{s.name}</p>
              <p className="text-ink/60">
                {formatCurrency(s.price)} · {s.durationMin} min
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Profissional</label>
        <div className="flex flex-wrap gap-2">
          {data.barbers.map((b) => (
            <button
              type="button"
              key={b.id}
              onClick={() => setBarberId(b.id)}
              className={classNames(
                "rounded-full border px-4 py-2 text-sm transition",
                barberId === b.id
                  ? "border-gold-500 bg-gold-50 font-semibold"
                  : "border-ink/15 hover:border-ink/30"
              )}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Dia</label>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((d) => {
            const iso = toInputDate(d);
            const isSelected = iso === date;
            return (
              <button
                type="button"
                key={iso}
                onClick={() => setDate(iso)}
                className={classNames(
                  "flex shrink-0 flex-col items-center rounded-lg border px-3 py-2 text-xs transition",
                  isSelected
                    ? "border-gold-500 bg-gold-50 font-semibold"
                    : "border-ink/15 hover:border-ink/30"
                )}
              >
                <span className="uppercase text-ink/50">
                  {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                <span className="text-sm">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="label">Horário</label>
        {slots.length === 0 ? (
          <p className="text-sm text-ink/50">
            Nenhum horário disponível neste dia. Escolha outra data.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {slots.map((s) => {
              const iso = s.toISOString();
              const label = s.toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              });
              return (
                <button
                  type="button"
                  key={iso}
                  onClick={() => setTime(iso)}
                  className={classNames(
                    "rounded-lg border px-3 py-2 text-sm transition",
                    time === iso
                      ? "border-gold-500 bg-gold-50 font-semibold"
                      : "border-ink/15 hover:border-ink/30"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Seu nome</label>
          <input
            className="input"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nome completo"
          />
        </div>
        <div>
          <label className="label">WhatsApp / Telefone</label>
          <input
            className="input"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="(11) 99999-0000"
          />
        </div>
      </div>

      <button disabled={submitting} className="btn-gold w-full">
        {submitting ? "Confirmando..." : "Confirmar agendamento"}
      </button>
    </form>
  );
}
