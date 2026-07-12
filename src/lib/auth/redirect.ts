export function isAuthModalOpen(
  searchParams: URLSearchParams | { get(name: string): string | null }
): boolean {
  const auth = searchParams.get("auth");
  return auth === "login" || auth === "register";
}

export function isAuthModalOpenFromParams(
  params: Record<string, string | string[] | undefined>
): boolean {
  const auth = params.auth;
  return auth === "login" || auth === "register";
}

export function authModalLoginUrl(pathname: string): string {
  const params = new URLSearchParams();
  params.set("auth", "login");
  params.set("redirect", pathname);
  return `${pathname}?${params.toString()}`;
}
