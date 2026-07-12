"use client";

import { useState } from "react";
import {
  MultiSelect,
  optionsFromRecord,
} from "@/components/ui/select";
import {
  CONTRACT_TYPE_LABELS,
  JOB_POSTING_TYPE_LABELS,
  WORK_MODALITY_LABELS,
} from "@/types";

interface JobPostingsFilterFormProps {
  initialQuery?: string;
  initialCity?: string;
  initialRegion?: string;
  initialPostingTypes?: string[];
  initialContractTypes?: string[];
  initialModalities?: string[];
}

export function JobPostingsFilterForm({
  initialQuery = "",
  initialCity = "",
  initialRegion = "",
  initialPostingTypes = [],
  initialContractTypes = [],
  initialModalities = [],
}: JobPostingsFilterFormProps) {
  const [postingTypes, setPostingTypes] = useState(initialPostingTypes);
  const [contractTypes, setContractTypes] = useState(initialContractTypes);
  const [modalities, setModalities] = useState(initialModalities);

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
          placeholder="Título, descripción..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
        />
      </div>

      <MultiSelect
        id="tipos"
        name="tipos"
        label="Tipo de oferta"
        value={postingTypes}
        onChange={setPostingTypes}
        placeholder="Todas"
        options={optionsFromRecord(JOB_POSTING_TYPE_LABELS)}
      />

      <MultiSelect
        id="contratos"
        name="contratos"
        label="Tipo de contrato"
        value={contractTypes}
        onChange={setContractTypes}
        placeholder="Todos"
        options={optionsFromRecord(CONTRACT_TYPE_LABELS)}
      />

      <MultiSelect
        id="modalidades"
        name="modalidades"
        label="Modalidad"
        value={modalities}
        onChange={setModalities}
        placeholder="Todas"
        options={optionsFromRecord(WORK_MODALITY_LABELS)}
      />

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

      <div>
        <label htmlFor="region" className="mb-1.5 block text-sm font-medium">
          Provincia / región
        </label>
        <input
          id="region"
          name="region"
          defaultValue={initialRegion}
          placeholder="Cataluña, Madrid..."
          className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110"
      >
        Filtrar
      </button>
    </form>
  );
}
