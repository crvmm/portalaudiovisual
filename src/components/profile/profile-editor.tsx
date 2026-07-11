"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, optionsWithEmpty } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Plus, Trash2, Save, Upload } from "lucide-react";
import {
  WORK_MODALITY_LABELS,
  JOB_SEEKING_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  type WorkModality,
  type JobSeekingType,
  type ExperienceLevel,
  type Category,
  type PortfolioItem,
} from "@/types";

interface ProfileData {
  display_name: string;
  headline: string;
  bio: string;
  location_city: string;
  location_region: string;
  years_experience: string;
  experience_level: ExperienceLevel | "";
  hourly_rate_min: string;
  hourly_rate_max: string;
  daily_rate_min: string;
  daily_rate_max: string;
  website_url: string;
  work_modality: WorkModality[];
  is_available: boolean;
  seeking_types: JobSeekingType[];
  category_ids: string[];
}

export function ProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [data, setData] = useState<ProfileData>({
    display_name: "",
    headline: "",
    bio: "",
    location_city: "",
    location_region: "",
    years_experience: "",
    experience_level: "",
    hourly_rate_min: "",
    hourly_rate_max: "",
    daily_rate_min: "",
    daily_rate_max: "",
    website_url: "",
    work_modality: ["on_site", "remote", "hybrid"],
    is_available: true,
    seeking_types: [],
    category_ids: [],
  });

  const [newPortfolio, setNewPortfolio] = useState({
    title: "",
    description: "",
    media_type: "image",
    media_url: "",
  });

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login?redirect=/dashboard/perfil");
      return;
    }
    setUserId(user.id);

    const [
      { data: profile },
      { data: professional },
      { data: cats },
      { data: seeking },
      { data: profCats },
      { data: portfolioItems },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("professional_profiles").select("*").eq("id", user.id).single(),
      supabase.from("categories").select("*").eq("status", "active").order("sort_order"),
      supabase.from("professional_job_seeking").select("seeking_type").eq("professional_id", user.id),
      supabase.from("professional_categories").select("category_id").eq("professional_id", user.id),
      supabase.from("portfolio_items").select("*").eq("professional_id", user.id).order("sort_order"),
    ]);

    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setData((prev) => ({
        ...prev,
        display_name: profile.display_name,
      }));
    }

    if (professional) {
      setData((prev) => ({
        ...prev,
        headline: professional.headline ?? "",
        bio: professional.bio ?? "",
        location_city: professional.location_city ?? "",
        location_region: professional.location_region ?? "",
        years_experience: professional.years_experience?.toString() ?? "",
        experience_level: professional.experience_level ?? "",
        hourly_rate_min: professional.hourly_rate_min?.toString() ?? "",
        hourly_rate_max: professional.hourly_rate_max?.toString() ?? "",
        daily_rate_min: professional.daily_rate_min?.toString() ?? "",
        daily_rate_max: professional.daily_rate_max?.toString() ?? "",
        website_url: professional.website_url ?? "",
        work_modality: professional.work_modality ?? ["on_site", "remote", "hybrid"],
        is_available: professional.is_available,
        seeking_types: seeking?.map((s) => s.seeking_type as JobSeekingType) ?? [],
        category_ids: profCats?.map((c) => c.category_id) ?? [],
      }));
    }

    setCategories(cats ?? []);
    setPortfolio(portfolioItems ?? []);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function update(field: keyof ProfileData, value: string | boolean | WorkModality[] | JobSeekingType[] | string[]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleModality(modality: WorkModality) {
    setData((prev) => ({
      ...prev,
      work_modality: prev.work_modality.includes(modality)
        ? prev.work_modality.filter((m) => m !== modality)
        : [...prev.work_modality, modality],
    }));
  }

  function toggleSeeking(type: JobSeekingType) {
    setData((prev) => ({
      ...prev,
      seeking_types: prev.seeking_types.includes(type)
        ? prev.seeking_types.filter((t) => t !== type)
        : [...prev.seeking_types, type],
    }));
  }

  function toggleCategory(id: string) {
    setData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    setAvatarUrl(publicUrl);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    await supabase.from("profiles").update({
      display_name: data.display_name,
    }).eq("id", userId);

    await supabase.from("professional_profiles").upsert({
      id: userId,
      headline: data.headline || null,
      bio: data.bio || null,
      location_city: data.location_city || null,
      location_region: data.location_region || null,
      years_experience: data.years_experience ? parseInt(data.years_experience) : null,
      experience_level: data.experience_level || null,
      hourly_rate_min: data.hourly_rate_min ? parseFloat(data.hourly_rate_min) : null,
      hourly_rate_max: data.hourly_rate_max ? parseFloat(data.hourly_rate_max) : null,
      daily_rate_min: data.daily_rate_min ? parseFloat(data.daily_rate_min) : null,
      daily_rate_max: data.daily_rate_max ? parseFloat(data.daily_rate_max) : null,
      website_url: data.website_url || null,
      work_modality: data.work_modality,
      is_available: data.is_available,
    });

    await supabase.from("professional_job_seeking").delete().eq("professional_id", userId);
    if (data.seeking_types.length > 0) {
      await supabase.from("professional_job_seeking").insert(
        data.seeking_types.map((seeking_type) => ({
          professional_id: userId,
          seeking_type,
        }))
      );
    }

    await supabase.from("professional_categories").delete().eq("professional_id", userId);
    if (data.category_ids.length > 0) {
      await supabase.from("professional_categories").insert(
        data.category_ids.map((category_id) => ({
          professional_id: userId,
          category_id,
        }))
      );
    }

    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  async function handleAddPortfolio() {
    if (!userId || !newPortfolio.title) return;
    const supabase = createClient();

    const { data: item, error: insertError } = await supabase
      .from("portfolio_items")
      .insert({
        professional_id: userId,
        title: newPortfolio.title,
        description: newPortfolio.description || null,
        media_type: newPortfolio.media_type,
        media_url: newPortfolio.media_url || null,
        sort_order: portfolio.length,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return;
    }

    if (item) {
      setPortfolio((prev) => [...prev, item]);
      setNewPortfolio({ title: "", description: "", media_type: "image", media_url: "" });
    }
  }

  async function handleDeletePortfolio(id: string) {
    const supabase = createClient();
    await supabase.from("portfolio_items").delete().eq("id", id);
    setPortfolio((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Cargando perfil...</p>;
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <Card>
        <CardContent className="flex items-center gap-6 pt-6">
          <Avatar src={avatarUrl} name={data.display_name} size="xl" />
          <div>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              <span className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-accent">
                <Upload className="h-4 w-4" />
                Cambiar foto
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle>Información básica</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="display_name"
            label="Nombre profesional"
            value={data.display_name}
            onChange={(e) => update("display_name", e.target.value)}
          />
          <Input
            id="headline"
            label="Titular"
            placeholder="Ej: Director de fotografía · Madrid"
            value={data.headline}
            onChange={(e) => update("headline", e.target.value)}
          />
          <Textarea
            id="bio"
            label="Presentación"
            value={data.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={5}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="location_city"
              label="Ciudad"
              value={data.location_city}
              onChange={(e) => update("location_city", e.target.value)}
            />
            <Input
              id="location_region"
              label="Provincia"
              value={data.location_region}
              onChange={(e) => update("location_region", e.target.value)}
            />
          </div>
          <Input
            id="website_url"
            label="Página web"
            type="url"
            value={data.website_url}
            onChange={(e) => update("website_url", e.target.value)}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_available}
              onChange={(e) => update("is_available", e.target.checked)}
              className="accent-primary"
            />
            <span className="text-sm">Disponible para nuevos proyectos</span>
          </label>
        </CardContent>
      </Card>

      {/* Experience & rates */}
      <Card>
        <CardHeader><CardTitle>Experiencia y tarifas</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="years_experience"
              label="Años de experiencia"
              type="number"
              min="0"
              value={data.years_experience}
              onChange={(e) => update("years_experience", e.target.value)}
            />
            <Select
              id="experience_level"
              label="Nivel"
              value={data.experience_level}
              onChange={(value) => update("experience_level", value)}
              options={optionsWithEmpty(EXPERIENCE_LEVEL_LABELS, "Seleccionar...")}
              isClearable
              placeholder="Seleccionar..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input id="hourly_rate_min" label="Tarifa/hora mín (€)" type="number" value={data.hourly_rate_min} onChange={(e) => update("hourly_rate_min", e.target.value)} />
            <Input id="hourly_rate_max" label="Tarifa/hora máx (€)" type="number" value={data.hourly_rate_max} onChange={(e) => update("hourly_rate_max", e.target.value)} />
            <Input id="daily_rate_min" label="Tarifa/día mín (€)" type="number" value={data.daily_rate_min} onChange={(e) => update("daily_rate_min", e.target.value)} />
            <Input id="daily_rate_max" label="Tarifa/día máx (€)" type="number" value={data.daily_rate_max} onChange={(e) => update("daily_rate_max", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Work preferences */}
      <Card>
        <CardHeader><CardTitle>Preferencias de trabajo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium">Modalidad</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WORK_MODALITY_LABELS) as WorkModality[]).map((m) => (
                <button key={m} type="button" onClick={() => toggleModality(m)}>
                  <Badge variant={data.work_modality.includes(m) ? "primary" : "muted"} className="cursor-pointer">
                    {WORK_MODALITY_LABELS[m]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Busco</p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(JOB_SEEKING_LABELS) as JobSeekingType[]).map((t) => (
                <button key={t} type="button" onClick={() => toggleSeeking(t)}>
                  <Badge variant={data.seeking_types.includes(t) ? "primary" : "muted"} className="cursor-pointer">
                    {JOB_SEEKING_LABELS[t]}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Especialidades</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}>
                  <Badge variant={data.category_ids.includes(cat.id) ? "primary" : "muted"} className="cursor-pointer">
                    {cat.name}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card>
        <CardHeader><CardTitle>Portfolio</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {portfolio.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {portfolio.map((item) => (
                <div key={item.id} className="relative rounded-lg border border-border p-3">
                  <button
                    type="button"
                    onClick={() => handleDeletePortfolio(item.id)}
                    className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:bg-accent hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {item.media_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.media_url} alt={item.title} className="mb-2 aspect-video w-full rounded object-cover" />
                  )}
                  <p className="font-medium text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
            <p className="text-sm font-medium">Añadir trabajo</p>
            <Input
              id="portfolio_title"
              label="Título"
              value={newPortfolio.title}
              onChange={(e) => setNewPortfolio((p) => ({ ...p, title: e.target.value }))}
            />
            <Textarea
              id="portfolio_desc"
              label="Descripción"
              value={newPortfolio.description}
              onChange={(e) => setNewPortfolio((p) => ({ ...p, description: e.target.value }))}
              rows={2}
            />
            <Input
              id="portfolio_url"
              label="URL de imagen/vídeo"
              value={newPortfolio.media_url}
              onChange={(e) => setNewPortfolio((p) => ({ ...p, media_url: e.target.value }))}
            />
            <Button variant="outline" size="sm" onClick={handleAddPortfolio}>
              <Plus className="h-4 w-4" />
              Añadir al portfolio
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {success && <p className="text-sm text-green-400">Perfil guardado correctamente</p>}

      <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        {saving ? "Guardando..." : "Guardar perfil"}
      </Button>
    </div>
  );
}
