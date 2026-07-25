"use client";

import { Suspense, type ReactNode } from "react";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalProvider } from "@/components/auth/auth-modal-context";
import { UnreadMessagesProvider } from "@/hooks/use-unread-messages";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthModalProvider>
        <UnreadMessagesProvider>
          <Header />
          <main className="min-h-[calc(100vh-3.75rem)]">{children}</main>
          <Footer />
          <AuthModal />
        </UnreadMessagesProvider>
      </AuthModalProvider>
    </Suspense>
  );
}
