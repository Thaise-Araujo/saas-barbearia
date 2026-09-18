"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  active: boolean;
};

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", price: "", durationMin: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/services");
    setServices(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.price || !form.durationMin) return;
    setSaving(true);
    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: parseFloat(form.price),
        durationMin: parseInt(form.durationMin, 10),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar");
      return;
    }
    setForm({ name: "", price: "", durationMin: "" });
    load();
  }

  async function toggleActive(s: Service) {
    await fetch(`/api/services/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !s.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este serviço?")) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Serviços</h1>
      <p className="mb-8 text-sm text-ink/60">
        Cadastre os serviços oferecidos pela sua barbearia.
      </p>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-semibold">Novo serviço</h2>
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nome</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Corte de Cabelo"
              />
            </div>
            <div>
              <label className="label">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="40.00"
              />
            </div>
            <div>
              <label className="label">Duração (minutos)</label>
              <input
                type="number"
                min="1"
                className="input"
                value={form.durationMin}
                onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                placeholder="30"
              />
            </div>
            <button disabled={saving} className="btn-primary w-full">
              {saving ? "Salvando..." : "Adicionar serviço"}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Serviços cadastrados</h2>
          {loading ? (
            <p className="text-sm text-ink/50">Carregando...</p>
          ) : services.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhum serviço cadastrado ainda.</p>
          ) : (
            <div className="divide-y divide-ink/10">
              {services.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-ink/60">
                      {formatCurrency(s.price)} · {s.durationMin} min
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(s)}
                      className={
                        "rounded-full px-3 py-1 text-xs font-semibold " +
                        (s.active
                          ? "bg-green-100 text-green-700"
                          : "bg-ink/10 text-ink/50")
                      }
                    >
                      {s.active ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
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
    </div>
  );
}
