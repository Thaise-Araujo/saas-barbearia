import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BarberSaaS — Sistema de Agendamento para Barbearias",
  description:
    "Gerencie sua barbearia: agenda online, barbeiros, serviços e clientes em um só lugar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
