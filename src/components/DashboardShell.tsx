"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { classNames } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Visão geral", icon: "📊" },
  { href: "/dashboard/agenda", label: "Agenda", icon: "🗓" },
  { href: "/dashboard/servicos", label: "Serviços", icon: "💈" },
  { href: "/dashboard/barbeiros", label: "Barbeiros", icon: "✂️" },
  { href: "/dashboard/clientes", label: "Clientes", icon: "👥" },
  { href: "/dashboard/configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function DashboardShell({
  children,
  barbershopName,
  slug,
  userName,
}: {
  children: React.ReactNode;
  barbershopName: string;
  slug: string;
  userName: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#f7f4ee]">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="border-b border-ink/10 px-5 py-5">
          <div className="font-display text-lg font-bold">
            <span className="text-gold-500">✂</span> BarberSaaS
          </div>
          <p className="mt-1 truncate text-sm text-ink/60">{barbershopName}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-ink text-white"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                )}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink/10 p-4">
          <a
            href={`/b/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="mb-3 block truncate text-xs font-medium text-gold-600 hover:underline"
          >
            Ver página pública →
          </a>
          <div className="mb-2 truncate text-sm text-ink/70">Olá, {userName}</div>
          <button onClick={handleLogout} className="btn-outline w-full text-xs">
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-8">{children}</main>
    </div>
  );
}
