import type { Metadata } from "next";
import { DM_Mono, Fraunces, Instrument_Sans } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Portal Audiovisual — Plataforma profesional audiovisual",
  description:
    "Conecta profesionales, empresas y particulares del sector audiovisual. Empleo, proyectos, portfolios, servicios y coincidencias inteligentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${instrumentSans.variable} ${fraunces.variable} ${dmMono.variable} min-h-screen antialiased`}
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
