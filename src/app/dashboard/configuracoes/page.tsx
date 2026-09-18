"use client";

import { useEffect, useState } from "react";

export default function ConfiguracoesPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    openTime: "",
    closeTime: "",
  });
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadBarbershop() {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setForm({
          name: data.name || "",
          phone: data.phone || "",
          address: data.address || "",
          openTime: data.openTime || "09:00",
          closeTime: data.closeTime || "19:00",
        });
        setSlug(data.slug || "");
      }
      setLoading(false);
    }
    loadBarbershop();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/barbershop", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Configurações</h1>
      <p className="mb-8 text-sm text-ink/60">
        Informações da sua barbearia exibidas na página pública.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          {loading ? (
            <p className="text-sm text-ink/50">Carregando...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nome da barbearia</label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
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
              <div>
                <label className="label">Endereço</label>
                <input
                  className="input"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rua, número - Bairro"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Abre às</label>
                  <input
                    type="time"
                    className="input"
                    value={form.openTime}
                    onChange={(e) => setForm({ ...form, openTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Fecha às</label>
                  <input
                    type="time"
                    className="input"
                    value={form.closeTime}
                    onChange={(e) => setForm({ ...form, closeTime: e.target.value })}
                  />
                </div>
              </div>
              <button disabled={saving} className="btn-primary">
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              {saved && (
                <span className="ml-3 text-sm font-medium text-green-600">
                  Salvo com sucesso!
                </span>
              )}
            </form>
          )}
        </div>

        <div className="card">
          <h2 className="mb-2 font-semibold">Sua página pública</h2>
          <p className="mb-3 text-sm text-ink/60">
            Compartilhe este link com seus clientes para que eles agendem online.
          </p>
          {slug && (
            <a
              href={`/b/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="break-all text-sm font-medium text-gold-600 hover:underline"
            >
              {typeof window !== "undefined" ? window.location.origin : ""}/b/{slug}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
