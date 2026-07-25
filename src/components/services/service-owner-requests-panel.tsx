import Link from "next/link";
import { MessageSquare, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SERVICE_REQUEST_STATUS_LABELS,
  type ServiceRequestStatus,
} from "@/types";
import { formatDateShort } from "@/lib/utils";

export interface ServiceRequestListItem {
  id: string;
  conversation_id: string | null;
  status: ServiceRequestStatus;
  date_start: string;
  date_end: string | null;
  requester: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  };
}

function statusBadgeVariant(
  status: ServiceRequestStatus
): "primary" | "signal" | "success" | "muted" | "danger" {
  switch (status) {
    case "new":
      return "primary";
    case "in_conversation":
      return "signal";
    case "reserved":
      return "success";
    case "discarded":
      return "muted";
    default:
      return "muted";
  }
}

function formatRequestDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return formatDateShort(isoDate);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(new Date(year, month - 1, day));
}

function formatRequestDates(start: string, end: string | null): string {
  if (end && end !== start) {
    return `${formatRequestDate(start)} — ${formatRequestDate(end)}`;
  }
  return formatRequestDate(start);
}

export function ServiceOwnerRequestsPanel({
  serviceId,
  requests,
}: {
  serviceId: string;
  requests: ServiceRequestListItem[];
}) {
  const openCount = requests.filter((r) => r.status !== "discarded").length;

  return (
    <div className="mt-5 space-y-3 border-t border-border pt-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Solicitudes
        </p>
        <p className="text-sm font-semibold tabular-nums">
          {openCount}
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            activas
          </span>
        </p>
      </div>

      <Link href={`/mensajes?servicio=${serviceId}`}>
        <Button variant="outline" className="w-full">
          <Users className="h-4 w-4" />
          Ver candidaturas
        </Button>
      </Link>

      {requests.length === 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          Aún no hay solicitudes
        </p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
          {requests.map((request) => {
            const chatHref = request.conversation_id
              ? `/mensajes?servicio=${serviceId}&conversacion=${request.conversation_id}`
              : `/mensajes?servicio=${serviceId}`;

            return (
              <li key={request.id}>
                <Link
                  href={chatHref}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-surface"
                >
                  <Avatar
                    src={request.requester.avatar_url}
                    name={request.requester.display_name}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {request.requester.display_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatRequestDates(request.date_start, request.date_end)}
                    </p>
                  </div>
                  <Badge variant={statusBadgeVariant(request.status)}>
                    {SERVICE_REQUEST_STATUS_LABELS[request.status]}
                  </Badge>
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
