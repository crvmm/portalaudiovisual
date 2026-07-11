import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";

interface SearchParams {
  categoria?: string;
  ciudad?: string;
  q?: string;
}

export default async function ProfessionalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let categoryId: string | undefined;
  if (params.categoria) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.categoria)
      .single();
    categoryId = cat?.id;
  }

  const { data: professionals } = await supabase.rpc("search_professionals", {
    p_query: params.q ?? null,
    p_category_id: categoryId ?? null,
    p_city: params.ciudad ?? null,
    p_limit: 24,
    p_offset: 0,
  });

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("status", "active")
    .is("parent_id", null)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Profesionales audiovisuales</h1>
      <p className="mt-2 text-muted-foreground">
        Encuentra talento especializado por categoría, ubicación y disponibilidad
      </p>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-64 shrink-0">
          <form className="space-y-4 rounded-xl border border-border bg-card p-5">
            <div>
              <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={params.q}
                placeholder="Nombre, especialidad..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="ciudad" className="mb-1.5 block text-sm font-medium">
                Ciudad
              </label>
              <input
                id="ciudad"
                name="ciudad"
                defaultValue={params.ciudad}
                placeholder="Madrid, Barcelona..."
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="categoria" className="mb-1.5 block text-sm font-medium">
                Categoría
              </label>
              <select
                id="categoria"
                name="categoria"
                defaultValue={params.categoria ?? ""}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">Todas</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Filtrar
            </button>
          </form>
        </aside>

        <div className="flex-1">
          {professionals && professionals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {professionals.map((prof: {
                id: string;
                display_name: string;
                headline: string | null;
                location_city: string | null;
                years_experience: number | null;
                hourly_rate_min: number | null;
                avg_rating: number;
                review_count: number;
              }) => (
                <Link
                  key={prof.id}
                  href={`/profesionales/${prof.id}`}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="font-semibold">{prof.display_name}</h2>
                      {prof.headline && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {prof.headline}
                        </p>
                      )}
                    </div>
                    {prof.avg_rating > 0 && (
                      <div className="flex items-center gap-1 text-sm text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
                        {prof.avg_rating}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {prof.location_city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {prof.location_city}
                      </span>
                    )}
                    {prof.years_experience && (
                      <span>{prof.years_experience} años exp.</span>
                    )}
                    {prof.hourly_rate_min && (
                      <span>desde {prof.hourly_rate_min}€/h</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                No hay profesionales que coincidan con los filtros.
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Configura Supabase local y crea perfiles de prueba para ver resultados.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
