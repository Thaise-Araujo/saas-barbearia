import Link from "next/link";

const features = [
  {
    title: "Agenda online 24h",
    desc: "Seus clientes marcam horário sozinhos, a qualquer hora, sem precisar ligar.",
  },
  {
    title: "Gestão de barbeiros",
    desc: "Cadastre sua equipe e organize os atendimentos de cada profissional.",
  },
  {
    title: "Catálogo de serviços",
    desc: "Defina preços e durações para corte, barba, sobrancelha e combos.",
  },
  {
    title: "Histórico de clientes",
    desc: "Tenha o cadastro completo de quem já passou pela sua barbearia.",
  },
  {
    title: "Painel de resultados",
    desc: "Acompanhe faturamento, atendimentos do dia e próximos horários.",
  },
  {
    title: "Página pública própria",
    desc: "Sua barbearia ganha um link exclusivo para divulgar e receber agendamentos.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f4ee]">
      <header className="border-b border-ink/10 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <span className="text-gold-500">✂</span> BarberSaaS
          </div>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-outline">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary">
              Criar minha barbearia
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <p className="mb-3 inline-block rounded-full bg-gold-100 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gold-600">
          Feito para barbearias
        </p>
        <h1 className="mx-auto max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          O sistema completo para agendar, organizar e crescer sua barbearia
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-ink/70">
          Agenda online, controle de barbeiros, serviços, clientes e faturamento —
          tudo em um painel simples, feito para o dia a dia da barbearia.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/cadastro" className="btn-gold">
            Começar gratuitamente
          </Link>
          <Link href="/b/barbearia-modelo" className="btn-outline">
            Ver página de agendamento
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card">
              <h3 className="mb-2 font-semibold text-ink">{f.title}</h3>
              <p className="text-sm text-ink/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/50">
        © {new Date().getFullYear()} BarberSaaS. Todos os direitos reservados.
      </footer>
    </main>
  );
}
