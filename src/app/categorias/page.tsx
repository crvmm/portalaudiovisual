import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select(`
      id, name, slug, description, sort_order,
      children:categories!parent_id (id, name, slug, sort_order)
    `)
    .eq("status", "active")
    .is("parent_id", null)
    .order("sort_order");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold">Categorías audiovisuales</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Sistema de clasificación especializado. Si no encuentras tu especialidad,
        podrás proponer nuevas categorías.
      </p>

      <div className="mt-10 space-y-8">
        {categories?.map((category) => {
          const children = (category.children as { id: string; name: string; slug: string }[]) ?? [];
          return (
            <section key={category.id} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">{category.name}</h2>
              {category.description && (
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
              )}
              {children.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {children
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((child) => (
                      <Link
                        key={child.id}
                        href={`/profesionales?categoria=${child.slug}`}
                        className="rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:border-primary/50 hover:text-primary"
                      >
                        {child.name}
                      </Link>
                    ))}
                </div>
              )}
              <Link
                href={`/profesionales?categoria=${category.slug}`}
                className="mt-4 inline-block text-sm text-primary hover:underline"
              >
                Ver profesionales en {category.name} →
              </Link>
            </section>
          );
        })}
      </div>
    </div>
  );
}
