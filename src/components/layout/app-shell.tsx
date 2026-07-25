"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { UnreadMessagesProvider } from "@/hooks/use-unread-messages";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname.startsWith("/mensajes");

  return (
    <AuthModalProvider>
      <UnreadMessagesProvider>
        <Header />
        <main
          className={
            hideFooter
              ? "h-[calc(100dvh-3.75rem)] overflow-hidden"
              : "min-h-[calc(100vh-3.75rem)]"
          }
        >
          {children}
        </main>
        {!hideFooter && <Footer />}
        <AuthModal />
      </UnreadMessagesProvider>
    </AuthModalProvider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}
