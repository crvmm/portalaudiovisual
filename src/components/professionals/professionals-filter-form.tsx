"use client";

import { useState } from "react";
import { Select, type SelectOption } from "@/components/ui/select";

interface ProfessionalsFilterFormProps {
  initialQuery?: string;
  initialCity?: string;
  initialCategory?: string;
  categories: SelectOption[];
}

export function ProfessionalsFilterForm({
  initialQuery = "",
  initialCity = "",
  initialCategory = "",
  categories,
}: ProfessionalsFilterFormProps) {
  const [category, setCategory] = useState(initialCategory);

  return (
    <form className="space-y-4 border-t border-border pt-6">
      <div>
        <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
          Buscar
        </label>
        <input
          id="q"
          name="q"
          defaultValue={initialQuery}
          placeholder="Nombre, especialidad..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
        />
      </div>
      <div>
        <label htmlFor="ciudad" className="mb-1.5 block text-sm font-medium">
          Ciudad
        </label>
        <input
          id="ciudad"
          name="ciudad"
          defaultValue={initialCity}
          placeholder="Madrid, Barcelona..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
        />
      </div>
      <Select
        id="categoria"
        name="categoria"
        label="Categoría"
        value={category}
        onChange={setCategory}
        placeholder="Todas"
        isClearable
        options={[{ value: "", label: "Todas" }, ...categories]}
      />
      <button
        type="submit"
        className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110"
      >
        Filtrar
      </button>
    </form>
  );
}
