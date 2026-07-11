import { Suspense } from "react";
import { AuthRouteOpener } from "@/components/auth/auth-route-opener";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <AuthRouteOpener mode="register" />
    </Suspense>
  );
}
