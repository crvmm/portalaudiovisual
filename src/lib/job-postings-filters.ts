export interface JobPostingsSearchParams {
  q?: string;
  ciudad?: string;
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
      params.region ||
      params.tipos ||
      params.contratos ||
      params.modalidades
  );
}
