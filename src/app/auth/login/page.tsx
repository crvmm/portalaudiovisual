import { Suspense } from "react";
import { AuthRouteOpener } from "@/components/auth/auth-route-opener";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthRouteOpener mode="login" />
    </Suspense>
  );
}
