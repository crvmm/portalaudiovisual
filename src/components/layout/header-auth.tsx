"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthModal } from "@/components/auth/auth-modal-context";

export function HeaderAuth() {
  const { openAuth } = useAuthModal();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(Boolean(user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="btn-primary-glow rounded-md bg-primary px-4 py-2 text-[0.9375rem] font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105"
      >
        Mi panel
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => openAuth({ mode: "login" })}
        className="rounded-md px-3.5 py-2 text-[0.9375rem] text-muted-foreground transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground"
      >
        Entrar
      </button>
      <button
        type="button"
        onClick={() => openAuth({ mode: "register" })}
        className="btn-primary-glow rounded-md bg-primary px-4 py-2 text-[0.9375rem] font-medium text-primary-foreground transition-[filter,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-105"
      >
        Crear cuenta
      </button>
    </div>
  );
}
