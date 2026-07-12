"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Camera, User, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatSupabaseError } from "@/lib/supabase/errors";
import type { ProfileType } from "@/types";
import { useAuthModal } from "./auth-modal-context";
import type { SupabaseClient } from "@supabase/supabase-js";

const PROFILE_OPTIONS: {
  type: ProfileType;
  label: string;
  Icon: typeof Camera;
}[] = [
  { type: "professional", label: "Profesional", Icon: Camera },
  { type: "company", label: "Empresa", Icon: Building2 },
  { type: "individual", label: "Particular", Icon: User },
];

export function AuthModal() {
  const router = useRouter();
  const {
    isOpen,
    mode,
    profileType,
    redirectTo,
    closeAuth,
    setMode,
    setProfileType,
  } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(formatSupabaseError(authError));
      setLoading(false);
      return;
    }

    closeAuth();
    router.push(redirectTo ?? "/dashboard");
    router.refresh();
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { profile_type: profileType, display_name: displayName },
      },
    });

    if (authError) {
      setError(formatSupabaseError(authError));
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError(
        "No se pudo crear la cuenta. Si ya estás registrada, inicia sesión. Si no, revisa tu email por si hace falta confirmarla."
      );
      setLoading(false);
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(
        "Cuenta creada. Revisa tu email para confirmarla y después inicia sesión."
      );
      setLoading(false);
      return;
    }

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        profile_type: profileType,
        display_name: displayName,
        email,
      });

      if (profileError) {
        setError(formatSupabaseError(profileError));
        setLoading(false);
        return;
      }

      const subtypeError = await ensureProfileSubtype(
        supabase,
        authData.user.id,
        profileType,
        displayName
      );

      if (subtypeError) {
        setError(formatSupabaseError(subtypeError));
        setLoading(false);
        return;
      }
    }

    closeAuth();
    router.push(redirectTo ?? "/dashboard");
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[3px]"
        aria-label="Cerrar"
        onClick={closeAuth}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-md rounded-lg border border-border bg-card shadow-[0_24px_64px_oklch(0.26_0.04_290/0.16)]"
      >
        <button
          type="button"
          onClick={closeAuth}
          className="absolute right-3 top-3 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Cerrar ventana"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 sm:p-7">
          <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-stage">
            Portal Audiovisual
          </p>
          <h2 id="auth-modal-title" className="mt-2 font-display text-2xl font-medium">
            {mode === "login" ? "Accede a tu cuenta" : "Crea tu cuenta"}
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-surface p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                mode === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrarse
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <Field label="Email" id="auth-email" type="email" value={email} onChange={setEmail} />
              <Field
                label="Contraseña"
                id="auth-password"
                type="password"
                value={password}
                onChange={setPassword}
              />
              {error && <ErrorMessage message={error} />}
              <SubmitButton loading={loading} loadingLabel="Entrando..." label="Iniciar sesión" />
            </form>
          ) : (
            <form onSubmit={handleRegister} className="mt-6 space-y-4">
              <div>
                <p className="mb-2 text-sm font-medium">Tipo de usuario</p>
                <div className="grid grid-cols-3 gap-2">
                  {PROFILE_OPTIONS.map(({ type, label, Icon }) => {
                    const selected = profileType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setProfileType(type)}
                        className={`flex flex-col items-center gap-2 rounded-md border px-2 py-3 text-center transition-[border-color,background-color,color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          selected
                            ? "border-primary bg-primary/6 text-primary"
                            : "border-border bg-surface text-muted-foreground hover:border-stage/35 hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                        <span className="text-xs font-medium leading-tight">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field
                label={profileType === "company" ? "Nombre de la empresa" : "Nombre completo"}
                id="auth-name"
                type="text"
                value={displayName}
                onChange={setDisplayName}
                placeholder={profileType === "company" ? "Tu empresa" : "Tu nombre"}
              />
              <Field
                label="Email"
                id="auth-register-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="tu@email.com"
              />
              <Field
                label="Contraseña"
                id="auth-register-password"
                type="password"
                value={password}
                onChange={setPassword}
                minLength={8}
              />
              {error && <ErrorMessage message={error} />}
              <SubmitButton loading={loading} loadingLabel="Creando cuenta..." label="Crear cuenta" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  id,
  type,
  value,
  onChange,
  placeholder,
  minLength,
}: {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-md border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-red-600/10 px-3 py-2.5 text-sm text-red-700">{message}</p>
  );
}

function SubmitButton({
  loading,
  loadingLabel,
  label,
}: {
  loading: boolean;
  loadingLabel: string;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="btn-primary-glow w-full rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-105 disabled:opacity-50"
    >
      {loading ? loadingLabel : label}
    </button>
  );
}

async function ensureProfileSubtype(
  supabase: SupabaseClient,
  userId: string,
  profileType: ProfileType,
  displayName: string
) {
  if (profileType === "professional") {
    const { error: professionalError } = await supabase
      .from("professional_profiles")
      .insert({ id: userId });

    if (professionalError) return professionalError;

    const { error: preferencesError } = await supabase
      .from("notification_preferences")
      .insert({ profile_id: userId });

    return preferencesError;
  }

  if (profileType === "company") {
    const { error } = await supabase.from("company_profiles").insert({
      id: userId,
      company_name: displayName,
    });

    return error;
  }

  const { error } = await supabase.from("individual_profiles").insert({ id: userId });
  return error;
}
