"use client";

import { useEffect, useMemo, useState } from "react";
import { formatCurrency, formatTime, classNames } from "@/lib/utils";

type Appointment = {
  id: string;
  date: string;
  status: string;
  client: { name: string; phone: string };
  service: { name: string; price: number };
  barber: { id: string; name: string };
};

type Barber = { id: string; name: string; active: boolean };
type Service = { id: string; name: string; price: number; durationMin: number; active: boolean };

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<string, string> = {
  agendado: "bg-blue-100 text-blue-700",
  concluido: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

export default function AgendaPage() {
  const [day, setDay] = useState(toInputDate(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    barberId: "",
    serviceId: "",
    time: "10:00",
  });

  async function load() {
    setLoading(true);
    const from = new Date(day + "T00:00:00");
    const to = new Date(from);
    to.setDate(to.getDate() + 1);

    const [apRes, bRes, sRes] = await Promise.all([
      fetch(`/api/appointments?from=${from.toISOString()}&to=${to.toISOString()}`),
      fetch("/api/barbers"),
      fetch("/api/services"),
    ]);
    setAppointments(await apRes.json());
    setBarbers(await bRes.json());
    setServices(await sRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const activeBarbers = useMemo(() => barbers.filter((b) => b.active), [barbers]);
  const activeServices = useMemo(() => services.filter((s) => s.active), [services]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.clientName || !form.clientPhone || !form.barberId || !form.serviceId) {
      setError("Preencha todos os campos");
      return;
    }
    setSaving(true);
    const date = new Date(`${day}T${form.time}:00`);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.clientName,
        clientPhone: form.clientPhone,
        barberId: form.barberId,
        serviceId: form.serviceId,
        date: date.toISOString(),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao agendar");
      return;
    }
    setForm({ clientName: "", clientPhone: "", barberId: "", serviceId: "", time: "10:00" });
    setShowForm(false);
    load();
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este agendamento?")) return;
    await fetch(`/api/appointments/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Agenda</h1>
          <p className="text-sm text-ink/60">Agendamentos do dia selecionado.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            className="input w-auto"
            value={day}
            onChange={(e) => setDay(e.target.value)}
          />
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancelar" : "+ Novo agendamento"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="mb-4 font-semibold">Novo agendamento — {day}</h2>
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="label">Cliente</label>
              <input
                className="input"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                placeholder="Nome"
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                className="input"
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                placeholder="(11) 99999-0000"
              />
            </div>
            <div>
              <label className="label">Barbeiro</label>
              <select
                className="input"
                value={form.barberId}
                onChange={(e) => setForm({ ...form, barberId: e.target.value })}
              >
                <option value="">Selecione</option>
                {activeBarbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Serviço</label>
              <select
                className="input"
                value={form.serviceId}
                onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              >
                <option value="">Selecione</option>
                {activeServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatCurrency(s.price)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Horário</label>
              <input
                type="time"
                className="input"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
              <button disabled={saving} className="btn-gold">
                {saving ? "Agendando..." : "Confirmar agendamento"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="text-sm text-ink/50">Carregando...</p>
        ) : appointments.length === 0 ? (
          <p className="text-sm text-ink/50">Nenhum agendamento para este dia.</p>
        ) : (
          <div className="divide-y divide-ink/10">
            {appointments.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="w-20 text-lg font-bold">{formatTime(a.date)}</div>
                <div className="flex-1">
                  <p className="font-medium">{a.client.name}</p>
                  <p className="text-sm text-ink/60">
                    {a.service.name} · {a.barber.name} · {formatCurrency(a.service.price)}
                  </p>
                </div>
                <span
                  className={classNames(
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    STATUS_COLOR[a.status]
                  )}
                >
                  {STATUS_LABEL[a.status]}
                </span>
                <div className="flex items-center gap-2">
                  {a.status !== "concluido" && (
                    <button
                      onClick={() => updateStatus(a.id, "concluido")}
                      className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
                    >
                      Concluir
                    </button>
                  )}
                  {a.status !== "cancelado" && (
                    <button
                      onClick={() => updateStatus(a.id, "cancelado")}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    onClick={() => remove(a.id)}
                    className="rounded-full px-3 py-1 text-xs font-semibold text-ink/50 hover:bg-ink/5"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
