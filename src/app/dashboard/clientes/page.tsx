"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

type ClientRow = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  _count: { appointments: number };
};

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/clients");
    setClients(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.phone) return;
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao salvar");
      return;
    }
    setForm({ name: "", phone: "" });
    load();
  }

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Clientes</h1>
      <p className="mb-8 text-sm text-ink/60">
        Base de clientes cadastrados na sua barbearia.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-semibold">Novo cliente</h2>
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
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="label">Telefone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-0000"
              />
            </div>
            <button disabled={saving} className="btn-primary w-full">
              {saving ? "Salvando..." : "Adicionar cliente"}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="font-semibold">Todos os clientes</h2>
            <input
              className="input max-w-xs"
              placeholder="Buscar por nome ou telefone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <p className="text-sm text-ink/50">Carregando...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhum cliente encontrado.</p>
          ) : (
            <div className="divide-y divide-ink/10">
              {filtered.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-sm text-ink/60">{c.phone}</p>
                  </div>
                  <div className="text-right text-sm text-ink/50">
                    <p>{c._count.appointments} agendamento(s)</p>
                    <p className="text-xs">Desde {formatDate(c.createdAt)}</p>
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
