"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ProfileType } from "@/types";

export type AuthMode = "login" | "register";

interface OpenAuthOptions {
  mode?: AuthMode;
  profileType?: ProfileType;
  redirect?: string;
}

interface AuthModalContextValue {
  isOpen: boolean;
  mode: AuthMode;
  profileType: ProfileType;
  redirectTo: string | null;
  openAuth: (options?: OpenAuthOptions) => void;
  closeAuth: () => void;
  setMode: (mode: AuthMode) => void;
  setProfileType: (type: ProfileType) => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

function parseProfileType(value: string | null): ProfileType {
  if (value === "company" || value === "individual") return value;
  return "professional";
}

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [profileType, setProfileType] = useState<ProfileType>("professional");
  const [redirectTo, setRedirectTo] = useState<string | null>(null);

  const buildUrl = useCallback(
    (next: {
      open: boolean;
      authMode: AuthMode;
      tipo?: ProfileType;
      redirect?: string | null;
    }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (next.open) {
        params.set("auth", next.authMode);
        if (next.tipo) params.set("tipo", next.tipo);
        if (next.redirect) params.set("redirect", next.redirect);
        else params.delete("redirect");
      } else {
        params.delete("auth");
        params.delete("tipo");
        params.delete("redirect");
      }

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams]
  );

  const openAuth = useCallback(
    (options?: OpenAuthOptions) => {
      const nextMode = options?.mode ?? "login";
      const nextType = options?.profileType ?? profileType;
      const nextRedirect = options?.redirect ?? redirectTo;

      setMode(nextMode);
      setProfileType(nextType);
      setRedirectTo(nextRedirect);
      setIsOpen(true);

      router.replace(
        buildUrl({
          open: true,
          authMode: nextMode,
          tipo: nextType,
          redirect: nextRedirect,
        }),
        { scroll: false }
      );
    },
    [buildUrl, profileType, redirectTo, router]
  );

  const closeAuth = useCallback(() => {
    setIsOpen(false);
    router.replace(buildUrl({ open: false, authMode: mode }), { scroll: false });
  }, [buildUrl, mode, router]);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "register") {
      setIsOpen(true);
      setMode(authParam);
      setProfileType(parseProfileType(searchParams.get("tipo")));
      setRedirectTo(searchParams.get("redirect"));
      return;
    }

    setIsOpen(false);
  }, [searchParams]);

  useEffect(() => {
    if (!isOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeAuth();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeAuth, isOpen]);

  const value = useMemo(
    () => ({
      isOpen,
      mode,
      profileType,
      redirectTo,
      openAuth,
      closeAuth,
      setMode: (nextMode: AuthMode) => {
        setMode(nextMode);
        router.replace(
          buildUrl({
            open: true,
            authMode: nextMode,
            tipo: profileType,
            redirect: redirectTo,
          }),
          { scroll: false }
        );
      },
      setProfileType: (nextType: ProfileType) => {
        setProfileType(nextType);
        if (isOpen && mode === "register") {
          router.replace(
            buildUrl({
              open: true,
              authMode: "register",
              tipo: nextType,
              redirect: redirectTo,
            }),
            { scroll: false }
          );
        }
      },
    }),
    [buildUrl, closeAuth, isOpen, mode, openAuth, profileType, redirectTo, router]
  );

  return (
    <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}
