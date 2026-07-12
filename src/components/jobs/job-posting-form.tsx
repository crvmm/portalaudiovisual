"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, optionsFromRecord, optionsWithEmpty } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import {
  JOB_POSTING_TYPE_LABELS,
  WORK_MODALITY_LABELS,
  CONTRACT_TYPE_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  type JobPostingType,
  type WorkModality,
  type ContractType,
  type ExperienceLevel,
  type Category,
} from "@/types";

const STEPS = ["Básico", "Detalles", "Requisitos", "Revisar"];

interface FormData {
  title: string;
  description: string;
  posting_type: JobPostingType;
  contract_type: ContractType | "";
  work_modality: WorkModality;
  location_city: string;
  location_region: string;
  project_start_date: string;
  project_end_date: string;
  schedule: string;
  duration: string;
  experience_required: ExperienceLevel | "";
  budget_min: string;
  budget_max: string;
  salary_min: string;
  salary_max: string;
  positions_count: string;
  requires_own_equipment: boolean;
  requires_vehicle: boolean;
  application_deadline: string;
  category_ids: string[];
}

const initialData: FormData = {
  title: "",
  description: "",
  posting_type: "freelance",
  contract_type: "",
  work_modality: "on_site",
  location_city: "",
  location_region: "",
  project_start_date: "",
  project_end_date: "",
  schedule: "",
  duration: "",
  experience_required: "",
  budget_min: "",
  budget_max: "",
  salary_min: "",
  salary_max: "",
  positions_count: "1",
  requires_own_equipment: false,
  requires_vehicle: false,
  application_deadline: "",
  category_ids: [],
};

export function JobPostingForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
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

  function update(field: keyof FormData, value: string | boolean | string[]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCategory(id: string) {
    setData((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  }

  async function handlePublish() {
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Debes iniciar sesión para publicar");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("profile_type")
      .eq("id", user.id)
      .single();

    if (!profile || profile.profile_type === "professional") {
      setError("Solo empresas y particulares pueden publicar ofertas");
      setLoading(false);
      return;
    }

    const { data: posting, error: insertError } = await supabase
      .from("job_postings")
      .insert({
        author_id: user.id,
        author_type: profile.profile_type,
        title: data.title,
        description: data.description,
        posting_type: data.posting_type,
        contract_type: data.contract_type || null,
        work_modality: data.work_modality,
        location_city: data.location_city || null,
        location_region: data.location_region || null,
        project_start_date: data.project_start_date || null,
        project_end_date: data.project_end_date || null,
        schedule: data.schedule || null,
        duration: data.duration || null,
        experience_required: data.experience_required || null,
        budget_min: data.budget_min ? parseFloat(data.budget_min) : null,
        budget_max: data.budget_max ? parseFloat(data.budget_max) : null,
        salary_min: data.salary_min ? parseFloat(data.salary_min) : null,
        salary_max: data.salary_max ? parseFloat(data.salary_max) : null,
        positions_count: parseInt(data.positions_count) || 1,
        requires_own_equipment: data.requires_own_equipment,
        requires_vehicle: data.requires_vehicle,
        application_deadline: data.application_deadline || null,
        status: "open",
      })
      .select("id")
      .single();

    if (insertError || !posting) {
      setError(insertError?.message ?? "Error al publicar");
      setLoading(false);
      return;
    }

    if (data.category_ids.length > 0) {
      await supabase.from("job_posting_categories").insert(
        data.category_ids.map((category_id) => ({
          job_posting_id: posting.id,
          category_id,
        }))
      );
    }

    router.push(`/ofertas/${posting.id}`);
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-8 bg-border" />}
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "border-2 border-primary text-primary"
                    : "border border-border text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${i === step ? "font-medium" : "text-muted-foreground"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Información básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              id="title"
              label="Título de la oferta *"
              placeholder="Ej: Fotógrafo de producto para campaña de verano"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
            <Textarea
              id="description"
              label="Descripción *"
              placeholder="Describe el proyecto, responsabilidades, entregables..."
              value={data.description}
              onChange={(e) => update("description", e.target.value)}
              rows={6}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="posting_type"
                label="Tipo de oportunidad *"
                value={data.posting_type}
                onChange={(value) => update("posting_type", value)}
                options={optionsFromRecord(JOB_POSTING_TYPE_LABELS)}
                placeholder="Seleccionar..."
              />
              <Select
                id="work_modality"
                label="Modalidad *"
                value={data.work_modality}
                onChange={(value) => update("work_modality", value)}
                options={optionsFromRecord(WORK_MODALITY_LABELS)}
                placeholder="Seleccionar..."
              />
            </div>
            <Select
              id="contract_type"
              label="Tipo de contrato"
              value={data.contract_type}
              onChange={(value) => update("contract_type", value)}
              options={optionsWithEmpty(CONTRACT_TYPE_LABELS, "Seleccionar...")}
              isClearable
              placeholder="Seleccionar..."
            />
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Detalles del proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="location_city"
                label="Ciudad"
                value={data.location_city}
                onChange={(e) => update("location_city", e.target.value)}
              />
              <Input
                id="location_region"
                label="Provincia / Región"
                value={data.location_region}
                onChange={(e) => update("location_region", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="project_start_date"
                label="Fecha inicio"
                type="date"
                value={data.project_start_date}
                onChange={(e) => update("project_start_date", e.target.value)}
              />
              <Input
                id="project_end_date"
                label="Fecha fin"
                type="date"
                value={data.project_end_date}
                onChange={(e) => update("project_end_date", e.target.value)}
              />
            </div>
            <Input
              id="schedule"
              label="Horario"
              placeholder="Ej: Lunes a viernes, 9:00-18:00"
              value={data.schedule}
              onChange={(e) => update("schedule", e.target.value)}
            />
            <Input
              id="duration"
              label="Duración estimada"
              placeholder="Ej: 3 días, 2 semanas"
              value={data.duration}
              onChange={(e) => update("duration", e.target.value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="budget_min"
                label="Presupuesto mínimo (€)"
                type="number"
                min="0"
                value={data.budget_min}
                onChange={(e) => update("budget_min", e.target.value)}
              />
              <Input
                id="budget_max"
                label="Presupuesto máximo (€)"
                type="number"
                min="0"
                value={data.budget_max}
                onChange={(e) => update("budget_max", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="salary_min"
                label="Salario mínimo (€)"
                type="number"
                min="0"
                value={data.salary_min}
                onChange={(e) => update("salary_min", e.target.value)}
              />
              <Input
                id="salary_max"
                label="Salario máximo (€)"
                type="number"
                min="0"
                value={data.salary_max}
                onChange={(e) => update("salary_max", e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                id="experience_required"
                label="Experiencia requerida"
                value={data.experience_required}
                onChange={(value) => update("experience_required", value)}
                options={optionsWithEmpty(EXPERIENCE_LEVEL_LABELS, "Cualquiera")}
                isClearable
                placeholder="Cualquiera"
              />
              <Input
                id="positions_count"
                label="Número de plazas"
                type="number"
                min="1"
                value={data.positions_count}
                onChange={(e) => update("positions_count", e.target.value)}
              />
            </div>
            <Input
              id="application_deadline"
              label="Fecha límite de candidaturas"
              type="date"
              value={data.application_deadline}
              onChange={(e) => update("application_deadline", e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Requisitos y categorías</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="mb-3 text-sm font-medium">Categorías necesarias *</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className="focus:outline-none"
                  >
                    <Badge
                      variant={data.category_ids.includes(cat.id) ? "signal" : "muted"}
                      className="cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.requires_own_equipment}
                  onChange={(e) => update("requires_own_equipment", e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm">Se requiere equipo propio</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.requires_vehicle}
                  onChange={(e) => update("requires_vehicle", e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-sm">Se requiere vehículo propio</span>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revisar y publicar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="text-muted-foreground">Título</p>
              <p className="font-medium">{data.title}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <p>{JOB_POSTING_TYPE_LABELS[data.posting_type]} · {WORK_MODALITY_LABELS[data.work_modality]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Descripción</p>
              <p className="whitespace-pre-wrap">{data.description}</p>
            </div>
            {data.location_city && (
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p>{data.location_city}{data.location_region && `, ${data.location_region}`}</p>
              </div>
            )}
            {data.category_ids.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-2">Categorías</p>
                <div className="flex flex-wrap gap-1">
                  {data.category_ids.map((id) => {
                    const cat = categories.find((c) => c.id === id);
                    return cat ? <Badge key={id} variant="signal">{cat.name}</Badge> : null;
                  })}
                </div>
              </div>
            )}
            {error && <p className="text-red-700">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && (!data.title || !data.description)}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handlePublish} disabled={loading}>
            {loading ? "Publicando..." : "Publicar oferta"}
          </Button>
        )}
      </div>
    </div>
  );
}
