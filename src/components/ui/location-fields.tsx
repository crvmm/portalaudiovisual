"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import {
  AUTONOMOUS_COMMUNITIES,
  getProvincesForCommunity,
  isProvinceInCommunity,
  normalizeAutonomousCommunity,
} from "@/lib/spain-territories";

const communityOptions: SelectOption[] = AUTONOMOUS_COMMUNITIES.map((name) => ({
  value: name,
  label: name,
}));

export interface LocationFieldValues {
  city: string;
  autonomousCommunity: string;
  province: string;
}

interface LocationFieldsProps {
  values: LocationFieldValues;
  onChange: (values: LocationFieldValues) => void;
  showCity?: boolean;
  cityId?: string;
  communityId?: string;
  provinceId?: string;
  communityName?: string;
  provinceName?: string;
  cityName?: string;
  className?: string;
}

export function LocationFields({
  values,
  onChange,
  showCity = true,
  cityId = "location_city",
  communityId = "location_region",
  provinceId = "location_province",
  communityName = "comunidad",
  provinceName = "provincia",
  cityName = "ciudad",
  className,
}: LocationFieldsProps) {
  const normalizedCommunity = normalizeAutonomousCommunity(values.autonomousCommunity);

  const provinceOptions = useMemo<SelectOption[]>(
    () =>
      getProvincesForCommunity(normalizedCommunity || values.autonomousCommunity).map(
        (name) => ({ value: name, label: name })
      ),
    [normalizedCommunity, values.autonomousCommunity]
  );

  function update(partial: Partial<LocationFieldValues>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className={className}>
      {showCity && (
        <Input
          id={cityId}
          name={cityName}
          label="Ciudad"
          placeholder="Madrid, Barcelona..."
          value={values.city}
          onChange={(e) => update({ city: e.target.value })}
        />
      )}

      <div className={`grid gap-4 sm:grid-cols-2 ${showCity ? "mt-4" : ""}`}>
        <Select
          id={communityId}
          name={communityName}
          label="Comunidad autónoma"
          placeholder="Seleccionar..."
          isClearable
          options={communityOptions}
          value={normalizedCommunity || values.autonomousCommunity}
          onChange={(autonomousCommunity) => {
            const nextProvince =
              values.province &&
              isProvinceInCommunity(values.province, autonomousCommunity)
                ? values.province
                : "";
            update({ autonomousCommunity, province: nextProvince });
          }}
        />
        <Select
          id={provinceId}
          name={provinceName}
          label="Provincia"
          placeholder={
            normalizedCommunity || values.autonomousCommunity
              ? "Seleccionar..."
              : "Elige primero una comunidad"
          }
          isClearable
          isDisabled={!normalizedCommunity && !values.autonomousCommunity}
          options={provinceOptions}
          value={values.province}
          onChange={(province) => update({ province })}
          noOptionsMessage="Sin provincias para esta comunidad"
        />
      </div>
    </div>
  );
}
