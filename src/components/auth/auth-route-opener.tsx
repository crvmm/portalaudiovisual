"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AuthMode } from "./auth-modal-context";

function parseProfileType(value: string | null) {
  if (value === "company" || value === "individual") return value;
  return "professional";
}

export function AuthRouteOpener({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    const tipo = searchParams.get("tipo");
    const target = redirect && redirect.startsWith("/") ? redirect.split("?")[0] : "/";

    const params = new URLSearchParams();
    params.set("auth", mode);
    if (redirect) params.set("redirect", redirect);
    if (tipo) params.set("tipo", parseProfileType(tipo));

    router.replace(`${target}?${params.toString()}`);
  }, [mode, router, searchParams]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center px-4">
      <p className="text-sm text-muted-foreground">Abriendo acceso…</p>
    </div>
  );
}
