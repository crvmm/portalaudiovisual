export interface JobPostingsSearchParams {
  q?: string;
  ciudad?: string;
  comunidad?: string;
  provincia?: string;
  /** @deprecated Usar `comunidad` */
  region?: string;
  tipos?: string;
  contratos?: string;
  modalidades?: string;
}

export function parseListParam(param?: string): string[] {
  if (!param) return [];
  return param.split(",").map((value) => value.trim()).filter(Boolean);
}

export function hasJobPostingFilters(params: JobPostingsSearchParams): boolean {
  return Boolean(
    params.q ||
      params.ciudad ||
      params.comunidad ||
      params.provincia ||
      params.region ||
      params.tipos ||
      params.contratos ||
      params.modalidades
  );
}
