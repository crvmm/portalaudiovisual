"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Bell, Check, Settings, Sparkles } from "lucide-react";
import type { Notification, Category } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export function NotificationsPanel() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [prefs, setPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    in_app_enabled: true,
    digest_frequency: "weekly" as string,
    min_budget: "",
    remote_only: false,
    exclude_internships: false,
    max_distance_km: "",
    category_ids: [] as string[],
  });

  const loadData = useCallback(async (uid: string) => {
    const supabase = createClient();

    const [
      { data: notifs },
      { data: preferences },
      { data: cats },
    ] = await Promise.all([
      supabase
        .from("notifications")
        .select("*")
        .eq("profile_id", uid)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("notification_preferences")
        .select("*")
        .eq("profile_id", uid)
        .maybeSingle(),
      supabase
        .from("categories")
        .select("*")
        .eq("status", "active")
        .is("parent_id", null)
        .order("sort_order"),
    ]);

    let categoryFilterIds: string[] = [];
    if (preferences) {
      const { data: filters } = await supabase
        .from("notification_category_filters")
        .select("category_id")
        .eq("preference_id", preferences.id);
      categoryFilterIds = filters?.map((f) => f.category_id) ?? [];
    }

    setNotifications(notifs ?? []);
    setCategories(cats ?? []);

    if (preferences) {
      setPrefs({
        email_enabled: preferences.email_enabled,
        push_enabled: preferences.push_enabled,
        in_app_enabled: preferences.in_app_enabled,
        digest_frequency: preferences.digest_frequency ?? "weekly",
        min_budget: preferences.min_budget?.toString() ?? "",
        remote_only: preferences.remote_only,
        exclude_internships: preferences.exclude_internships,
        max_distance_km: preferences.max_distance_km?.toString() ?? "",
        category_ids: categoryFilterIds,
      });
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login?redirect=/dashboard/notificaciones");
        return;
      }
      setUserId(user.id);
      loadData(user.id);
    });
  }, [router, loadData]);

  async function markAsRead(id: string) {
    const supabase = createClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAllRead() {
    if (!userId) return;
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("profile_id", userId)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }

  async function savePreferences() {
    if (!userId) return;
    const supabase = createClient();

    const { data: pref } = await supabase
      .from("notification_preferences")
      .upsert({
        profile_id: userId,
        email_enabled: prefs.email_enabled,
        push_enabled: prefs.push_enabled,
        in_app_enabled: prefs.in_app_enabled,
        digest_frequency: prefs.digest_frequency,
        min_budget: prefs.min_budget ? parseFloat(prefs.min_budget) : null,
        remote_only: prefs.remote_only,
        exclude_internships: prefs.exclude_internships,
        max_distance_km: prefs.max_distance_km ? parseInt(prefs.max_distance_km) : null,
      })
      .select("id")
      .single();

    if (pref) {
      await supabase
        .from("notification_category_filters")
        .delete()
        .eq("preference_id", pref.id);

      if (prefs.category_ids.length > 0) {
        await supabase.from("notification_category_filters").insert(
          prefs.category_ids.map((category_id) => ({
            preference_id: pref.id,
            category_id,
          }))
        );
      }
    }
  }

  function toggleCategory(id: string) {
    setPrefs((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  }

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Cargando...</p>;
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
            {unreadCount > 0 && (
              <Badge variant="primary">{unreadCount}</Badge>
            )}
          </h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              <Check className="h-4 w-4" />
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No tienes notificaciones todavía</p>
              <p className="text-sm mt-1">
                Recibirás alertas cuando haya ofertas compatibles con tu perfil
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notif) => (
            <Card
              key={notif.id}
              className={notif.is_read ? "opacity-60" : "border-primary/30"}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {notif.match_score && (
                        <Sparkles className="h-4 w-4 text-primary" />
                      )}
                      <p className="font-medium text-sm">{notif.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notif.body}</p>
                    {notif.match_score && (
                      <Badge variant="success" className="mt-2">
                        {Math.round(notif.match_score)}% compatibilidad
                      </Badge>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatRelativeTime(notif.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notif.is_read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notif.id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    {notif.link_url && (
                      <Link href={notif.link_url}>
                        <Button variant="outline" size="sm">Ver</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.in_app_enabled}
                onChange={(e) => setPrefs((p) => ({ ...p, in_app_enabled: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-sm">Notificaciones en la plataforma</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.email_enabled}
                onChange={(e) => setPrefs((p) => ({ ...p, email_enabled: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-sm">Notificaciones por email</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.push_enabled}
                onChange={(e) => setPrefs((p) => ({ ...p, push_enabled: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-sm">Notificaciones push (app móvil)</span>
            </label>

            <Select
              id="digest"
              label="Resumen periódico"
              value={prefs.digest_frequency}
              onChange={(value) => setPrefs((p) => ({ ...p, digest_frequency: value }))}
              options={[
                { value: "none", label: "Desactivado" },
                { value: "daily", label: "Diario" },
                { value: "weekly", label: "Semanal" },
              ]}
              placeholder="Seleccionar..."
            />

            <Input
              id="min_budget"
              label="Presupuesto mínimo (€)"
              type="number"
              value={prefs.min_budget}
              onChange={(e) => setPrefs((p) => ({ ...p, min_budget: e.target.value }))}
            />

            <Input
              id="max_distance"
              label="Distancia máxima (km)"
              type="number"
              value={prefs.max_distance_km}
              onChange={(e) => setPrefs((p) => ({ ...p, max_distance_km: e.target.value }))}
            />

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.remote_only}
                onChange={(e) => setPrefs((p) => ({ ...p, remote_only: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-sm">Solo trabajos remotos</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={prefs.exclude_internships}
                onChange={(e) => setPrefs((p) => ({ ...p, exclude_internships: e.target.checked }))}
                className="accent-primary"
              />
              <span className="text-sm">Excluir prácticas</span>
            </label>

            <div>
              <p className="mb-2 text-sm font-medium">Categorías de interés</p>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}>
                    <Badge
                      variant={prefs.category_ids.includes(cat.id) ? "primary" : "muted"}
                      className="cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={savePreferences} className="w-full">
              Guardar preferencias
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
