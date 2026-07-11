"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { ProfileType } from "@/types";
import { PROFILE_TYPE_LABELS } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("professional");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
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
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        profile_type: profileType,
        display_name: displayName,
        email,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      if (profileType === "professional") {
        await supabase.from("professional_profiles").insert({ id: authData.user.id });
        await supabase.from("notification_preferences").insert({
          profile_id: authData.user.id,
        });
      } else if (profileType === "company") {
        await supabase.from("company_profiles").insert({
          id: authData.user.id,
          company_name: displayName,
        });
      } else {
        await supabase.from("individual_profiles").insert({ id: authData.user.id });
      }

      router.push("/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Crear cuenta</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Únete a Portal Audiovisual
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Tipo de perfil</label>
          <div className="grid gap-2">
            {(Object.keys(PROFILE_TYPE_LABELS) as ProfileType[]).map((type) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  profileType === type
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
              >
                <input
                  type="radio"
                  name="profileType"
                  value={type}
                  checked={profileType === type}
                  onChange={() => setProfileType(type)}
                  className="accent-primary"
                />
                <span className="text-sm">{PROFILE_TYPE_LABELS[type]}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="displayName" className="mb-1.5 block text-sm font-medium">
            {profileType === "company" ? "Nombre de la empresa" : "Nombre"}
          </label>
          <input
            id="displayName"
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
