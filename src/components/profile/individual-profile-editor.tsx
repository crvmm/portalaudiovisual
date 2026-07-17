"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationFields } from "@/components/ui/location-fields";
import { normalizeAutonomousCommunity } from "@/lib/spain-territories";
import { Save } from "lucide-react";

interface IndividualProfileData {
  display_name: string;
  location_city: string;
  location_region: string;
  location_province: string;
}

export function IndividualProfileEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [data, setData] = useState<IndividualProfileData>({
    display_name: "",
    location_city: "",
    location_region: "",
    location_province: "",
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

    const [{ data: profile }, { data: individual }] = await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).single(),
      supabase.from("individual_profiles").select("*").eq("id", user.id).single(),
    ]);

    setData({
      display_name: profile?.display_name ?? "",
      location_city: individual?.location_city ?? "",
      location_region:
        normalizeAutonomousCommunity(individual?.location_region) ||
        individual?.location_region ||
        "",
      location_province: individual?.location_province ?? "",
    });

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();

    const { error: profileError } = await supabase
      .from("profiles")
      .update({ display_name: data.display_name.trim() })
      .eq("id", userId);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    const { error: individualError } = await supabase.from("individual_profiles").upsert({
      id: userId,
      location_city: data.location_city.trim() || null,
      location_region: data.location_region.trim() || null,
      location_province: data.location_province.trim() || null,
    });

    if (individualError) {
      setError(individualError.message);
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
          {error ?? "Perfil guardado correctamente."}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tu perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            id="display_name"
            label="Nombre visible"
            value={data.display_name}
            onChange={(e) => setData((prev) => ({ ...prev, display_name: e.target.value }))}
            required
          />
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

      <Button onClick={handleSave} disabled={saving || !data.display_name.trim()}>
        <Save className="h-4 w-4" />
        {saving ? "Guardando..." : "Guardar perfil"}
      </Button>
    </div>
  );
}
