"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, optionsFromRecord } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationFields } from "@/components/ui/location-fields";
import { normalizeAutonomousCommunity } from "@/lib/spain-territories";
import { TEAM_SIZE_LABELS } from "@/types";
import { Save } from "lucide-react";

interface CompanyProfileData {
  company_name: string;
  description: string;
  sector: string;
  website_url: string;
  contact_email: string;
  contact_phone: string;
  location_city: string;
  location_region: string;
  location_province: string;
  team_size: string;
  is_audiovisual_sector: boolean;
}

export function CompanyProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<CompanyProfileData>({
    company_name: "",
    description: "",
    sector: "",
    website_url: "",
    contact_email: "",
    contact_phone: "",
    location_city: "",
    location_region: "",
    location_province: "",
    team_size: "",
    is_audiovisual_sector: true,
  });

  const loadProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const [{ data: profile }, { data: company }] = await Promise.all([
      supabase.from("profiles").select("display_name, email, phone").eq("id", user.id).single(),
      supabase.from("company_profiles").select("*").eq("id", user.id).single(),
    ]);

    setData({
      company_name: company?.company_name ?? profile?.display_name ?? "",
      description: company?.description ?? "",
      sector: company?.sector ?? "",
      website_url: company?.website_url ?? "",
      contact_email: company?.contact_email ?? profile?.email ?? "",
      contact_phone: company?.contact_phone ?? profile?.phone ?? "",
      location_city: company?.location_city ?? "",
      location_region:
        normalizeAutonomousCommunity(company?.location_region) ||
        company?.location_region ||
        "",
      location_province: company?.location_province ?? "",
      team_size: company?.team_size ?? "",
      is_audiovisual_sector: company?.is_audiovisual_sector ?? true,
    });

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function update<K extends keyof CompanyProfileData>(field: K, value: CompanyProfileData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        display_name: data.company_name.trim(),
        phone: data.contact_phone.trim() || null,
      })
      .eq("id", userId);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const { error: companyError } = await supabase.from("company_profiles").upsert({
      id: userId,
      company_name: data.company_name.trim(),
      description: data.description.trim() || null,
      sector: data.sector.trim() || null,
      website_url: data.website_url.trim() || null,
      contact_email: data.contact_email.trim() || null,
      contact_phone: data.contact_phone.trim() || null,
      location_city: data.location_city.trim() || null,
      location_region: data.location_region.trim() || null,
      location_province: data.location_province.trim() || null,
      team_size: data.team_size || null,
      is_audiovisual_sector: data.is_audiovisual_sector,
    });

    if (companyError) {
      setError(companyError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess(true);
    router.refresh();
  }

  if (loading) {
    return <p className="py-16 text-center text-muted-foreground">Cargando perfil...</p>;
  }

  return (
    <div className="space-y-6">
      {(error || success) && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            error ? "bg-red-600/10 text-red-700" : "bg-primary/10 text-primary"
          }`}
        >
          {error ?? "Perfil de empresa guardado correctamente."}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="company_name"
            label="Nombre de la empresa"
            value={data.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            required
          />
          <Textarea
            id="description"
            label="Descripción"
            value={data.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="Qué hace vuestra empresa, tipos de proyectos, clientes..."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="sector"
              label="Sector"
              value={data.sector}
              onChange={(e) => update("sector", e.target.value)}
              placeholder="Producción, postproducción, agencia..."
            />
            <Select
              id="team_size"
              label="Tamaño del equipo"
              value={data.team_size}
              onChange={(value) => update("team_size", value)}
              placeholder="Seleccionar..."
              isClearable
              options={optionsFromRecord(TEAM_SIZE_LABELS)}
            />
          </div>
          <Input
            id="website_url"
            label="Web"
            type="url"
            value={data.website_url}
            onChange={(e) => update("website_url", e.target.value)}
            placeholder="https://"
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.is_audiovisual_sector}
              onChange={(e) => update("is_audiovisual_sector", e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <span className="text-sm">Empresa del sector audiovisual</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto y ubicación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="contact_email"
              label="Email de contacto"
              type="email"
              value={data.contact_email}
              onChange={(e) => update("contact_email", e.target.value)}
            />
            <Input
              id="contact_phone"
              label="Teléfono de contacto"
              type="tel"
              value={data.contact_phone}
              onChange={(e) => update("contact_phone", e.target.value)}
            />
          </div>
          <LocationFields
            values={{
              city: data.location_city,
              autonomousCommunity: data.location_region,
              province: data.location_province,
            }}
            onChange={({ city, autonomousCommunity, province }) =>
              setData((prev) => ({
                ...prev,
                location_city: city,
                location_region: autonomousCommunity,
                location_province: province,
              }))
            }
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving || !data.company_name.trim()}>
        <Save className="h-4 w-4" />
        {saving ? "Guardando..." : "Guardar perfil"}
      </Button>
    </div>
  );
}
