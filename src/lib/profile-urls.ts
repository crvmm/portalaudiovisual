import type { ProfileType } from "@/types";

export function getPublicProfileUrl(
  profileType: ProfileType | string,
  id: string
): string {
  switch (profileType) {
    case "company":
      return `/empresas/${id}`;
    case "individual":
      return `/particulares/${id}`;
    default:
      return `/profesionales/${id}`;
  }
}
