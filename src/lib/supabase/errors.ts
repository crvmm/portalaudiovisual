type SupabaseLikeError = {
  message?: string;
  code?: string;
  error_description?: string;
  details?: string;
  hint?: string;
};

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "No se pudo completar la operación. Inténtalo de nuevo.";
  }

  const record = error as SupabaseLikeError;
  const message = record.message?.trim();

  if (message && message !== "{}") {
    return message;
  }

  if (record.error_description?.trim()) {
    return record.error_description;
  }

  if (record.details?.trim()) {
    return record.details;
  }

  switch (record.code) {
    case "23505":
      return "Ya existe una cuenta con este email.";
    case "42501":
      return "No se pudo crear el perfil. Si te llegó un email de confirmación, confírmalo e inicia sesión.";
    case "user_already_exists":
    case "email_exists":
      return "Ya existe una cuenta con este email. Inicia sesión.";
    case "weak_password":
      return "La contraseña es demasiado débil. Usa al menos 8 caracteres.";
    case "invalid_credentials":
      return "Email o contraseña incorrectos.";
    default:
      break;
  }

  if (record.code) {
    return `Error al registrarse (${record.code}).`;
  }

  return "No se pudo completar la operación. Inténtalo de nuevo.";
}
