import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Calendar, Briefcase } from "lucide-react";
import { JOB_POSTING_TYPE_LABELS, WORK_MODALITY_LABELS } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { JobPostingType, WorkModality } from "@/types";

export default async function JobPostingsPage() {
  const supabase = await createClient();

  const { data: postings } = await supabase
    .from("job_postings")
    .select(`
      *,
      profiles:author_id (display_name, profile_type)
    `)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ofertas y encargos</h1>
          <p className="mt-2 text-muted-foreground">
            Empleo, freelance, colaboraciones y encargos del sector audiovisual
          </p>
        </div>
        <Link
          href="/publicar"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Publicar oferta
        </Link>
      </div>

      {postings && postings.length > 0 ? (
        <div className="mt-8 space-y-4">
          {postings.map((posting) => (
            <Link
              key={posting.id}
              href={`/ofertas/${posting.id}`}
              className="block rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {JOB_POSTING_TYPE_LABELS[posting.posting_type as JobPostingType]}
                    </span>
                    <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
                      {WORK_MODALITY_LABELS[posting.work_modality as WorkModality]}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">{posting.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {posting.description}
                  </p>
                </div>
                {(posting.budget_max || posting.salary_max) && (
                  <div className="text-right text-sm">
                    <span className="text-muted-foreground">Presupuesto</span>
                    <p className="font-semibold">
                      {posting.budget_max
                        ? `hasta ${formatCurrency(posting.budget_max, posting.currency)}`
                        : posting.salary_max
                          ? `hasta ${formatCurrency(posting.salary_max, posting.currency)}`
                          : null}
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {posting.location_city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {posting.location_city}
                  </span>
                )}
                {posting.project_start_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(posting.project_start_date)}
                    {posting.project_end_date && ` — ${formatDate(posting.project_end_date)}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  {(posting.profiles as unknown as { display_name: string })?.display_name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">No hay ofertas publicadas todavía.</p>
          <Link href="/publicar" className="mt-4 inline-block text-sm text-primary hover:underline">
            Sé el primero en publicar →
          </Link>
        </div>
      )}
    </div>
  );
}
