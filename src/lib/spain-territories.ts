/**
 * Comunidades autónomas y provincias según el nomenclátor del INE (España).
 * @see https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254734710990
 */

export const AUTONOMOUS_COMMUNITIES = [
  "Andalucía",
  "Aragón",
  "Principado de Asturias",
  "Illes Balears",
  "Canarias",
  "Cantabria",
  "Castilla y León",
  "Castilla-La Mancha",
  "Cataluña",
  "Comunitat Valenciana",
  "Extremadura",
  "Galicia",
  "Comunidad de Madrid",
  "Región de Murcia",
  "Comunidad Foral de Navarra",
  "País Vasco",
  "La Rioja",
  "Ciudad Autónoma de Ceuta",
  "Ciudad Autónoma de Melilla",
] as const;

export type AutonomousCommunity = (typeof AUTONOMOUS_COMMUNITIES)[number];

/** Provincias por comunidad autónoma (nombres oficiales INE). */
export const PROVINCES_BY_COMMUNITY: Record<AutonomousCommunity, readonly string[]> = {
  Andalucía: [
    "Almería",
    "Cádiz",
    "Córdoba",
    "Granada",
    "Huelva",
    "Jaén",
    "Málaga",
    "Sevilla",
  ],
  Aragón: ["Huesca", "Teruel", "Zaragoza"],
  "Principado de Asturias": ["Asturias"],
  "Illes Balears": ["Illes Balears"],
  Canarias: ["Las Palmas", "Santa Cruz de Tenerife"],
  Cantabria: ["Cantabria"],
  "Castilla y León": [
    "Ávila",
    "Burgos",
    "León",
    "Palencia",
    "Salamanca",
    "Segovia",
    "Soria",
    "Valladolid",
    "Zamora",
  ],
  "Castilla-La Mancha": ["Albacete", "Ciudad Real", "Cuenca", "Guadalajara", "Toledo"],
  Cataluña: ["Barcelona", "Girona", "Lleida", "Tarragona"],
  "Comunitat Valenciana": ["Alicante", "Castellón", "Valencia"],
  Extremadura: ["Badajoz", "Cáceres"],
  Galicia: ["A Coruña", "Lugo", "Ourense", "Pontevedra"],
  "Comunidad de Madrid": ["Madrid"],
  "Región de Murcia": ["Murcia"],
  "Comunidad Foral de Navarra": ["Navarra"],
  "País Vasco": ["Álava", "Bizkaia", "Gipuzkoa"],
  "La Rioja": ["La Rioja"],
  "Ciudad Autónoma de Ceuta": ["Ceuta"],
  "Ciudad Autónoma de Melilla": ["Melilla"],
};

/** Variantes históricas o coloquiales → nombre oficial INE. */
const COMMUNITY_ALIASES: Record<string, AutonomousCommunity> = {
  "Comunidad Valenciana": "Comunitat Valenciana",
  Valencia: "Comunitat Valenciana",
  "Islas Baleares": "Illes Balears",
  Baleares: "Illes Balears",
  Asturias: "Principado de Asturias",
  Navarra: "Comunidad Foral de Navarra",
  "País Vasco / Euskadi": "País Vasco",
  Euskadi: "País Vasco",
  Ceuta: "Ciudad Autónoma de Ceuta",
  Melilla: "Ciudad Autónoma de Melilla",
};

const provinceToCommunity = new Map<string, AutonomousCommunity>();

for (const community of AUTONOMOUS_COMMUNITIES) {
  for (const province of PROVINCES_BY_COMMUNITY[community]) {
    provinceToCommunity.set(province, community);
  }
}

export function normalizeAutonomousCommunity(
  value: string | null | undefined
): AutonomousCommunity | "" {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if ((AUTONOMOUS_COMMUNITIES as readonly string[]).includes(trimmed)) {
    return trimmed as AutonomousCommunity;
  }
  return COMMUNITY_ALIASES[trimmed] ?? "";
}

export function getProvincesForCommunity(
  community: string | null | undefined
): string[] {
  const normalized = normalizeAutonomousCommunity(community);
  if (!normalized) return [];
  return [...PROVINCES_BY_COMMUNITY[normalized]];
}

export function getCommunityForProvince(
  province: string | null | undefined
): AutonomousCommunity | "" {
  if (!province?.trim()) return "";
  return provinceToCommunity.get(province.trim()) ?? "";
}

export function isProvinceInCommunity(
  province: string,
  community: string
): boolean {
  return getProvincesForCommunity(community).includes(province);
}

export function formatSpanishLocation(parts: {
  city?: string | null;
  province?: string | null;
  autonomousCommunity?: string | null;
}): string {
  const segments: string[] = [];
  const city = parts.city?.trim();
  const province = parts.province?.trim();
  const community =
    normalizeAutonomousCommunity(parts.autonomousCommunity) ||
    parts.autonomousCommunity?.trim() ||
    "";

  if (city) segments.push(city);
  if (province && province !== city) segments.push(province);
  if (community) segments.push(community);

  return segments.join(", ");
}
