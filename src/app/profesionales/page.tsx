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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-medium">Profesionales</h1>
      <p className="mt-2 max-w-xl text-muted-foreground">
        Talento por categoría, ciudad y disponibilidad
      </p>

      <div className="mt-10 flex flex-col gap-10 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <form className="space-y-4 border-t border-border pt-6">
            <div>
              <label htmlFor="q" className="mb-1.5 block text-sm font-medium">
                Buscar
              </label>
              <input
                id="q"
                name="q"
                defaultValue={params.q}
                placeholder="Nombre, especialidad..."
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
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
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
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
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-ring"
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
              className="w-full rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110"
            >
              Filtrar
            </button>
          </form>
        </aside>

        <div className="flex-1">
          {professionals && professionals.length > 0 ? (
            <ul className="divide-y divide-border">
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
                <li key={prof.id}>
                  <Link
                    href={`/profesionales/${prof.id}`}
                    className="group flex flex-col gap-2 py-5 transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between sm:px-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h2 className="font-medium group-hover:text-primary">
                        {prof.display_name}
                      </h2>
                      {prof.headline && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {prof.headline}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
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
                    </div>
                    {prof.avg_rating > 0 && (
                      <div className="flex shrink-0 items-center gap-1 text-sm text-primary">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {prof.avg_rating}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="border border-dashed border-border py-16 text-center">
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
