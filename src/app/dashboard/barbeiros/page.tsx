"use client";

import { useEffect, useState } from "react";

type Barber = { id: string; name: string; active: boolean };

export default function BarbeirosPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/barbers");
    setBarbers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await fetch("/api/barbers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    setName("");
    load();
  }

  async function toggleActive(b: Barber) {
    await fetch(`/api/barbers/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !b.active }),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Excluir este barbeiro?")) return;
    await fetch(`/api/barbers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Barbeiros</h1>
      <p className="mb-8 text-sm text-ink/60">
        Gerencie a equipe da sua barbearia.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-semibold">Novo barbeiro</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Nome</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do barbeiro"
              />
            </div>
            <button disabled={saving} className="btn-primary w-full">
              {saving ? "Salvando..." : "Adicionar barbeiro"}
            </button>
          </form>
        </div>

        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">Equipe</h2>
          {loading ? (
            <p className="text-sm text-ink/50">Carregando...</p>
          ) : barbers.length === 0 ? (
            <p className="text-sm text-ink/50">Nenhum barbeiro cadastrado ainda.</p>
          ) : (
            <div className="divide-y divide-ink/10">
              {barbers.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <p className="font-medium">{b.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(b)}
                      className={
                        "rounded-full px-3 py-1 text-xs font-semibold " +
                        (b.active
                          ? "bg-green-100 text-green-700"
                          : "bg-ink/10 text-ink/50")
                      }
                    >
                      {b.active ? "Ativo" : "Inativo"}
                    </button>
                    <button
                      onClick={() => remove(b.id)}
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
