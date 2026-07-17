import Link from "next/link";
import { HeaderAuth } from "@/components/layout/header-auth";
import { BrandLogo } from "@/components/layout/brand-logo";

const navItems = [
  { href: "/profesionales", label: "Profesionales" },
  { href: "/ofertas", label: "Ofertas" },
  { href: "/servicios", label: "Servicios" },
  { href: "/mensajes", label: "Mensajes" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-sm">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <BrandLogo size="sm" href="/" />

        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3.5 py-2 text-[0.9375rem] text-muted-foreground transition-[color,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        <HeaderAuth />
      </div>
    </header>
  );
}
