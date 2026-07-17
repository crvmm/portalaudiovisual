"use client";

import { usePathname } from "next/navigation";
import { useAuthModal } from "@/components/auth/auth-modal-context";

export function AuthRequiredPlaceholder({ message }: { message?: string }) {
  const pathname = usePathname();
  const { openAuth } = useAuthModal();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <p className="text-muted-foreground">
        {message ?? "Inicia sesión para continuar"}
      </p>
      <button
        type="button"
        onClick={() => openAuth({ mode: "login", redirect: pathname })}
        className="btn-primary-glow mt-4 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-105"
      >
        Iniciar sesión
      </button>
    </div>
  );
}
