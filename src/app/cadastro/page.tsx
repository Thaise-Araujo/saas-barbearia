"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    ownerName: "",
    barbershopName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold">
            <span className="text-gold-500">✂</span> BarberSaaS
          </Link>
        </div>
        <div className="card">
          <h1 className="mb-1 text-xl font-semibold">Criar minha barbearia</h1>
          <p className="mb-6 text-sm text-ink/60">
            Comece a receber agendamentos em minutos.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome da barbearia</label>
              <input
                required
                className="input"
                value={form.barbershopName}
                onChange={(e) => update("barbershopName", e.target.value)}
                placeholder="Barbearia do João"
              />
            </div>
            <div>
              <label className="label">Seu nome</label>
              <input
                required
                className="input"
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                placeholder="João Silva"
              />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                required
                className="input"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                required
                minLength={6}
                className="input"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full">
              {loading ? "Criando..." : "Criar minha barbearia"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink/60">
            Já tem conta?{" "}
            <Link href="/login" className="font-semibold text-gold-600">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
