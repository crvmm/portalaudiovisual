import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Briefcase, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JOB_POSTING_TYPE_LABELS, type JobPostingType } from "@/types";
import { formatDate } from "@/lib/utils";
import { formatSpanishLocation } from "@/lib/spain-territories";

export default async function IndividualDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("profile_type", "individual")
    .single();

  if (!profile) notFound();

  const [{ data: individual }, { data: jobPostings }] = await Promise.all([
    supabase.from("individual_profiles").select("*").eq("id", id).single(),
    supabase
      .from("job_postings")
      .select("id, title, posting_type, created_at")
      .eq("author_id", id)
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Ofertas", href: "/ofertas" },
          { label: profile.display_name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-wrap items-start gap-6">
            <Avatar src={profile.avatar_url} name={profile.display_name} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{profile.display_name}</h1>
                {profile.is_verified && <Badge variant="primary">Verificado</Badge>}
                <Badge variant="muted">Particular</Badge>
              </div>
              {(individual?.location_city ||
                individual?.location_province ||
                individual?.location_region) && (
                <p className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {formatSpanishLocation({
                    city: individual?.location_city,
                    province: individual?.location_province,
                    autonomousCommunity: individual?.location_region,
                  })}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Link href={`/mensajes?contactar=${id}`}>
                <Button className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Contactar
                </Button>
              </Link>
            </CardContent>
          </Card>

          {jobPostings && jobPostings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Ofertas abiertas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobPostings.map((posting) => (
                  <Link
                    key={posting.id}
                    href={`/ofertas/${posting.id}`}
                    className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/50 hover:bg-accent/30"
                  >
                    <p className="font-medium">{posting.title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="muted">
                        {JOB_POSTING_TYPE_LABELS[posting.posting_type as JobPostingType]}
                      </Badge>
                      <span>{formatDate(posting.created_at)}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
