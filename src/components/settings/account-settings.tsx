"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { formatSupabaseError } from "@/lib/supabase/errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PROFILE_TYPE_LABELS, type ProfileType } from "@/types";

export function AccountSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [profileType, setProfileType] = useState<ProfileType>("professional");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login?redirect=/dashboard/configuracion");
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, phone, profile_type")
        .eq("id", user.id)
        .single();

      if (profile) {
        setDisplayName(profile.display_name ?? "");
        setPhone(profile.phone ?? "");
        setProfileType(profile.profile_type as ProfileType);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim(),
        phone: phone.trim() || null,
      })
      .eq("id", user.id);

    if (updateError) {
      setError(formatSupabaseError(updateError));
    } else {
      setMessage("Datos de cuenta actualizados.");
    }

    setSavingProfile(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setSavingPassword(true);
    setError(null);
    setMessage(null);

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      setSavingPassword(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setSavingPassword(false);
      return;
    }

    const supabase = createClient();
    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (passwordError) {
      setError(formatSupabaseError(passwordError));
    } else {
      setMessage("Contraseña actualizada correctamente.");
      setNewPassword("");
      setConfirmPassword("");
    }

    setSavingPassword(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Cargando configuración...</p>;
  }

  return (
    <div className="space-y-6">
      {(message || error) && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            error ? "bg-red-600/10 text-red-700" : "bg-primary/10 text-primary"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="settings-display-name"
                label="Nombre visible"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium">Tipo de cuenta</label>
                <p className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-muted-foreground">
                  {PROFILE_TYPE_LABELS[profileType]}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>
                <p className="rounded-md border border-border bg-surface px-4 py-2.5 text-sm text-muted-foreground">
                  {email}
                </p>
              </div>
              <Input
                id="settings-phone"
                label="Teléfono"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+34 600 000 000"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "Guardando..." : "Guardar cambios"}
              </Button>
              {profileType === "professional" && (
                <Link href="/dashboard/perfil">
                  <Button type="button" variant="outline">
                    Editar perfil profesional
                  </Button>
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="settings-new-password"
                label="Nueva contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
              />
              <Input
                id="settings-confirm-password"
                label="Confirmar contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" variant="outline" disabled={savingPassword || !newPassword}>
              {savingPassword ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesión</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Cierra sesión en este dispositivo.
          </p>
          <Button
            type="button"
            variant="danger"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Cerrando..." : "Cerrar sesión"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
