type SupabaseLikeError = {
  message?: string;
  msg?: string;
  code?: string;
  error_code?: string;
  error_description?: string;
  details?: string;
  hint?: string;
};

function readErrorMessage(error: SupabaseLikeError): string | undefined {
  const candidates = [error.message, error.msg, error.error_description, error.details];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim() && candidate.trim() !== "{}") {
      return candidate.trim();
    }
  }

  return undefined;
}

export function formatSupabaseError(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "No se pudo completar la operación. Inténtalo de nuevo.";
  }

  const record = error as SupabaseLikeError;
  const message = readErrorMessage(record);

  if (message === "Error sending confirmation email") {
    return "No se pudo enviar el email de confirmación. El administrador debe activar ENABLE_EMAIL_AUTOCONFIRM=true en Supabase o configurar SMTP.";
  }

  if (message) {
    return message;
  }

  switch (record.code ?? record.error_code) {
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
