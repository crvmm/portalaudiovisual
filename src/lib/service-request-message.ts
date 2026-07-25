export const SERVICE_REQUEST_MARKER = "SERVICE_REQUEST_V1";

export interface ParsedServiceRequest {
  title: string;
  dates: string;
  location: string | null;
  comments: string | null;
}

export function buildServiceRequestMessagePayload({
  serviceTitle,
  dateStart,
  dateEnd,
  location,
  comments,
}: {
  serviceTitle: string;
  dateStart: string;
  dateEnd: string;
  location: string;
  comments: string;
}): string {
  const dates =
    dateEnd && dateEnd !== dateStart
      ? `${formatIsoDateLabel(dateStart)} – ${formatIsoDateLabel(dateEnd)}`
      : formatIsoDateLabel(dateStart);

  const payload: ParsedServiceRequest = {
    title: serviceTitle,
    dates,
    location: location.trim() || null,
    comments: comments.trim() || null,
  };

  return `${SERVICE_REQUEST_MARKER}\n${JSON.stringify(payload)}`;
}

export function parseServiceRequestMessage(
  content: string | null | undefined
): ParsedServiceRequest | null {
  if (!content) return null;

  const trimmed = content.trim();

  if (trimmed.startsWith(SERVICE_REQUEST_MARKER)) {
    const jsonPart = trimmed.slice(SERVICE_REQUEST_MARKER.length).trim();
    try {
      const data = JSON.parse(jsonPart) as Partial<ParsedServiceRequest>;
      if (!data.title || !data.dates) return null;
      return {
        title: data.title,
        dates: data.dates,
        location: data.location ?? null,
        comments: data.comments ?? null,
      };
    } catch {
      return null;
    }
  }

  // Legacy plain-text format from earlier builds
  if (!trimmed.startsWith("Solicitud de servicio:")) return null;

  const lines = trimmed.split("\n");
  const title = lines[0]?.replace(/^Solicitud de servicio:\s*/, "").trim();
  if (!title) return null;

  let dates = "";
  let location: string | null = null;
  let comments: string | null = null;
  let inComments = false;
  const commentLines: string[] = [];

  for (const line of lines.slice(1)) {
    if (inComments) {
      commentLines.push(line);
      continue;
    }
    if (line.startsWith("Fechas de interés:")) {
      dates = line.replace(/^Fechas de interés:\s*/, "").trim();
      continue;
    }
    if (line.startsWith("Ubicación:")) {
      location = line.replace(/^Ubicación:\s*/, "").trim() || null;
      continue;
    }
    if (line.trim() === "Comentarios:") {
      inComments = true;
    }
  }

  if (commentLines.length) {
    comments = commentLines.join("\n").trim() || null;
  }

  if (!dates) return null;

  return { title, dates, location, comments };
}

export function serviceRequestPreviewText(content: string | null | undefined): string {
  const parsed = parseServiceRequestMessage(content);
  if (!parsed) return content ?? "";
  return `Solicitud: ${parsed.title}`;
}

function formatIsoDateLabel(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
