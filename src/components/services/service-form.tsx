"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, optionsFromRecord } from "@/components/ui/input";
import { LocationFields } from "@/components/ui/location-fields";
import {
  PRICING_TYPE_LABELS,
  WORK_MODALITY_LABELS,
  type Category,
  type PricingType,
  type WorkModality,
} from "@/types";

interface FormData {
  title: string;
  description: string;
  category_id: string;
  pricing_type: PricingType;
  price_amount: string;
  price_min: string;
  price_max: string;
  estimated_duration: string;
  work_modality: WorkModality;
  location_city: string;
  location_region: string;
  location_province: string;
  included_materials: string;
  terms: string;
}

const initialData: FormData = {
  title: "",
  description: "",
  category_id: "",
  pricing_type: "estimate",
  price_amount: "",
  price_min: "",
  price_max: "",
  estimated_duration: "",
  work_modality: "on_site",
  location_city: "",
  location_region: "",
  location_province: "",
  included_materials: "",
  terms: "",
};

export function ServiceForm() {
  const router = useRouter();
  const [data, setData] = useState<FormData>(initialData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name, slug, parent_id, description, icon, sort_order")
      .eq("status", "active")
      .order("sort_order")
      .then(({ data: cats }) => setCategories(cats ?? []));
  }, []);

  function update(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!data.title.trim() || !data.description.trim()) {
      setError("Título y descripción son obligatorios");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Debes iniciar sesión para publicar un servicio");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_type")
      .eq("id", user.id)
      .single();

    if (profile?.profile_type !== "professional") {
      setError("Solo los profesionales pueden publicar servicios");
      setLoading(false);
      return;
    }

    const { data: professional } = await supabase
      .from("professional_profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!professional) {
      setError("No encontramos tu perfil profesional. Completa tu perfil en el panel.");
      setLoading(false);
      return;
    }

    const priceAmount = data.price_amount ? Number(data.price_amount) : null;
    const priceMin = data.price_min ? Number(data.price_min) : null;
    const priceMax = data.price_max ? Number(data.price_max) : null;

    const { data: service, error: insertError } = await supabase
      .from("services")
      .insert({
        professional_id: user.id,
        title: data.title.trim(),
        description: data.description.trim(),
        category_id: data.category_id || null,
        pricing_type: data.pricing_type,
        price_amount: data.pricing_type === "estimate" ? null : priceAmount,
        price_min: data.pricing_type === "estimate" ? priceMin : null,
        price_max: data.pricing_type === "estimate" ? priceMax : null,
        estimated_duration: data.estimated_duration.trim() || null,
        work_modality: data.work_modality,
        location_city: data.location_city.trim() || null,
        location_region: data.location_region.trim() || null,
        location_province: data.location_province.trim() || null,
        included_materials: data.included_materials.trim() || null,
        terms: data.terms.trim() || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError || !service) {
      setError(insertError?.message ?? "No se pudo publicar el servicio");
      setLoading(false);
      return;
    }

    router.push(`/servicios/${service.id}`);
    router.refresh();
  }

  const categoryOptions = [
    { value: "", label: "Sin categoría" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="title"
        label="Título del servicio"
        placeholder="Ej. Grabación de evento corporativo"
        value={data.title}
        onChange={(e) => update("title", e.target.value)}
        required
      />

      <Textarea
        id="description"
        label="Descripción"
        placeholder="Qué incluye, para quién es y cómo trabajas"
        value={data.description}
        onChange={(e) => update("description", e.target.value)}
        required
        rows={5}
      />

      <Select
        id="category_id"
        label="Categoría"
        options={categoryOptions}
        value={data.category_id}
        onChange={(value) => update("category_id", value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="pricing_type"
          label="Tipo de precio"
          options={optionsFromRecord(PRICING_TYPE_LABELS)}
          value={data.pricing_type}
          onChange={(value) => update("pricing_type", value)}
        />
        <Select
          id="work_modality"
          label="Modalidad"
          options={optionsFromRecord(WORK_MODALITY_LABELS)}
          value={data.work_modality}
          onChange={(value) => update("work_modality", value)}
        />
      </div>

      {data.pricing_type === "estimate" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="price_min"
            label="Precio mínimo (€)"
            type="number"
            min="0"
            step="0.01"
            value={data.price_min}
            onChange={(e) => update("price_min", e.target.value)}
          />
          <Input
            id="price_max"
            label="Precio máximo (€)"
            type="number"
            min="0"
            step="0.01"
            value={data.price_max}
            onChange={(e) => update("price_max", e.target.value)}
          />
        </div>
      ) : (
        <Input
          id="price_amount"
          label={data.pricing_type === "hourly" ? "Tarifa por hora (€)" : "Precio (€)"}
          type="number"
          min="0"
          step="0.01"
          value={data.price_amount}
          onChange={(e) => update("price_amount", e.target.value)}
        />
      )}

      <Input
        id="estimated_duration"
        label="Duración estimada"
        placeholder="Ej. 1 día, 4 horas, 1 semana"
        value={data.estimated_duration}
        onChange={(e) => update("estimated_duration", e.target.value)}
      />

      <div>
        <p className="mb-1.5 text-sm font-medium">Ubicación</p>
        <LocationFields
          values={{
            city: data.location_city,
            autonomousCommunity: data.location_region,
            province: data.location_province,
          }}
          onChange={(values) =>
            setData((prev) => ({
              ...prev,
              location_city: values.city,
              location_region: values.autonomousCommunity,
              location_province: values.province,
            }))
          }
        />
      </div>

      <Textarea
        id="included_materials"
        label="Material incluido (opcional)"
        placeholder="Equipo, software, entregables…"
        value={data.included_materials}
        onChange={(e) => update("included_materials", e.target.value)}
        rows={3}
      />

      <Textarea
        id="terms"
        label="Condiciones (opcional)"
        placeholder="Anticipo, cancelaciones, desplazamientos…"
        value={data.terms}
        onChange={(e) => update("terms", e.target.value)}
        rows={3}
      />

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Publicando…" : "Publicar servicio"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/servicios")}
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
