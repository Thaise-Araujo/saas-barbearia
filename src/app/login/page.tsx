"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao entrar");
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
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ee] px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="font-display text-2xl font-bold">
            <span className="text-gold-500">✂</span> BarberSaaS
          </Link>
        </div>
        <div className="card">
          <h1 className="mb-1 text-xl font-semibold">Entrar</h1>
          <p className="mb-6 text-sm text-ink/60">
            Acesse o painel da sua barbearia.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                required
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <input
                type="password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-ink/60">
            Não tem conta?{" "}
            <Link href="/cadastro" className="font-semibold text-gold-600">
              Criar barbearia
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-ink/40">
            Demo: admin@barbearia.com / 123456
          </p>
        </div>
      </div>
    </main>
  );
}
