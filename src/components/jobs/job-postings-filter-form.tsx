"use client";

import { useState } from "react";
import {
  MultiSelect,
  Select,
  optionsFromRecord,
  type SelectOption,
} from "@/components/ui/select";
import {
  AUTONOMOUS_COMMUNITIES,
  getProvincesForCommunity,
  isProvinceInCommunity,
  normalizeAutonomousCommunity,
} from "@/lib/spain-territories";
import {
  CONTRACT_TYPE_LABELS,
  JOB_POSTING_TYPE_LABELS,
  WORK_MODALITY_LABELS,
} from "@/types";

const communityOptions: SelectOption[] = AUTONOMOUS_COMMUNITIES.map((name) => ({
  value: name,
  label: name,
}));

interface JobPostingsFilterFormProps {
  initialQuery?: string;
  initialCity?: string;
  initialCommunity?: string;
  initialProvince?: string;
  initialPostingTypes?: string[];
  initialContractTypes?: string[];
  initialModalities?: string[];
}

export function JobPostingsFilterForm({
  initialQuery = "",
  initialCity = "",
  initialCommunity = "",
  initialProvince = "",
  initialPostingTypes = [],
  initialContractTypes = [],
  initialModalities = [],
}: JobPostingsFilterFormProps) {
  const [postingTypes, setPostingTypes] = useState(initialPostingTypes);
  const [contractTypes, setContractTypes] = useState(initialContractTypes);
  const [modalities, setModalities] = useState(initialModalities);
  const [community, setCommunity] = useState(
    normalizeAutonomousCommunity(initialCommunity) || initialCommunity
  );
  const [province, setProvince] = useState(initialProvince);

  const provinceOptions: SelectOption[] = getProvincesForCommunity(community).map(
    (name) => ({ value: name, label: name })
  );

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

      <Select
        id="comunidad"
        name="comunidad"
        label="Comunidad autónoma"
        value={community}
        onChange={(nextCommunity) => {
          setCommunity(nextCommunity);
          if (province && !isProvinceInCommunity(province, nextCommunity)) {
            setProvince("");
          }
        }}
        placeholder="Todas"
        isClearable
        options={communityOptions}
      />

      <Select
        id="provincia"
        name="provincia"
        label="Provincia"
        value={province}
        onChange={setProvince}
        placeholder={community ? "Todas" : "Elige primero una comunidad"}
        isClearable
        isDisabled={!community}
        options={provinceOptions}
        noOptionsMessage="Sin provincias para esta comunidad"
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
