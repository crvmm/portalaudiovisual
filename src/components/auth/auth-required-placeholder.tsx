export function AuthRequiredPlaceholder({ message }: { message?: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
      <p className="text-muted-foreground">{message ?? "Inicia sesión para continuar"}</p>
    </div>
  );
}
