#!/usr/bin/env node
/**
 * Crea perfiles de demostración en Supabase (Mac Mini / producción).
 * Requiere SUPABASE_SERVICE_ROLE_KEY en .env.deploy o en el entorno.
 *
 * Uso: node scripts/seed-demo-data.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvDeploy() {
  const path = resolve(root, ".env.deploy");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const value = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvDeploy();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("❌ Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.deploy");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_PASSWORD = "Demo1234!";

const professionals = [
  {
    email: "laura.mendez@demo.portalaudiovisual.dev",
    displayName: "Laura Méndez",
    headline: "Fotógrafa editorial y de producto",
    city: "Madrid",
    region: "Comunidad de Madrid",
    years: 8,
    level: "senior",
    hourlyMin: 45,
    categories: ["fotografia"],
    seeking: ["freelance", "employment"],
  },
  {
    email: "marco.ruiz@demo.portalaudiovisual.dev",
    displayName: "Marco Ruiz",
    headline: "Operador de cámara y editor de vídeo",
    city: "Barcelona",
    region: "Cataluña",
    years: 6,
    level: "mid",
    hourlyMin: 38,
    categories: ["video", "edicion-video"],
    seeking: ["freelance", "collaboration"],
  },
  {
    email: "elena.vidal@demo.portalaudiovisual.dev",
    displayName: "Elena Vidal",
    headline: "Técnica de sonido directo y postproducción",
    city: "Valencia",
    region: "Comunidad Valenciana",
    years: 10,
    level: "senior",
    hourlyMin: 42,
    categories: ["sonido", "postproduccion"],
    seeking: ["freelance", "production"],
  },
  {
    email: "pablo.ortega@demo.portalaudiovisual.dev",
    displayName: "Pablo Ortega",
    headline: "Jefe de producción freelance",
    city: "Sevilla",
    region: "Andalucía",
    years: 12,
    level: "expert",
    hourlyMin: 55,
    categories: ["produccion"],
    seeking: ["freelance", "collaboration"],
  },
];

const company = {
  email: "estudio.norte@demo.portalaudiovisual.dev",
  displayName: "Estudio Norte",
  city: "Madrid",
  description: "Productora audiovisual especializada en campañas y contenido digital.",
};

const jobPostings = [
  {
    title: "Director/a de fotografía para spot de marca",
    description:
      "Buscamos DOP con experiencia en publicidad para rodaje de 2 días en Madrid. Entregables en 4K, equipo propio valorado.",
    posting_type: "freelance",
    work_modality: "on_site",
    city: "Madrid",
    budget_min: 1800,
    budget_max: 2800,
    categories: ["direccion", "fotografia"],
  },
  {
    title: "Editor/a de vídeo — contenido corporativo",
    description:
      "Incorporación para proyecto de 3 meses. Premiere y DaVinci. Modalidad híbrida con 2 días/semana en oficina.",
    posting_type: "employment",
    contract_type: "temporary",
    work_modality: "hybrid",
    city: "Barcelona",
    salary_min: 2200,
    salary_max: 2800,
    categories: ["edicion-video"],
  },
];

const services = [
  {
    professionalEmail: "laura.mendez@demo.portalaudiovisual.dev",
    title: "Sesión de fotografía de producto",
    description: "Pack de 20 fotos editadas para e-commerce o catálogo. Estudio o location en Madrid.",
    category: "fotografia",
    pricing_type: "fixed",
    price_amount: 450,
    duration: "Medio día",
    modality: "on_site",
    city: "Madrid",
  },
  {
    professionalEmail: "marco.ruiz@demo.portalaudiovisual.dev",
    title: "Edición de vídeo corporativo",
    description: "Montaje, color básico y subtítulos. Hasta 3 minutos de pieza final.",
    category: "edicion-video",
    pricing_type: "fixed",
    price_amount: 320,
    duration: "3-5 días",
    modality: "remote",
    city: "Barcelona",
  },
];

async function getCategoryMap() {
  const { data, error } = await admin.from("categories").select("id, slug");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((c) => [c.slug, c.id]));
}

async function ensureUser({ email, displayName, profileType, companyName }) {
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingProfile?.id) {
    return existingProfile.id;
  }

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: {
      profile_type: profileType,
      display_name: displayName,
    },
  });

  if (error) throw new Error(`${email}: ${error.message}`);

  const userId = created.user.id;

  const { error: profileError } = await admin.from("profiles").insert({
    id: userId,
    profile_type: profileType,
    display_name: displayName,
    email,
    is_active: true,
  });

  if (profileError) throw profileError;

  if (profileType === "professional") {
    await admin.from("professional_profiles").insert({ id: userId });
    await admin.from("notification_preferences").insert({ profile_id: userId });
  } else if (profileType === "company") {
    await admin.from("company_profiles").insert({
      id: userId,
      company_name: companyName ?? displayName,
    });
  }

  return userId;
}

async function seedProfessionals(categoryMap) {
  for (const prof of professionals) {
    const userId = await ensureUser({
      email: prof.email,
      displayName: prof.displayName,
      profileType: "professional",
    });

    await admin.from("professional_profiles").upsert({
      id: userId,
      headline: prof.headline,
      bio: `${prof.displayName} trabaja en el sector audiovisual con foco en ${prof.headline.toLowerCase()}.`,
      location_city: prof.city,
      location_region: prof.region,
      years_experience: prof.years,
      experience_level: prof.level,
      hourly_rate_min: prof.hourlyMin,
      is_available: true,
      work_modality: ["on_site", "remote", "hybrid"],
    });

    await admin.from("professional_job_seeking").delete().eq("professional_id", userId);
    await admin.from("professional_job_seeking").insert(
      prof.seeking.map((seeking_type) => ({ professional_id: userId, seeking_type }))
    );

    await admin.from("professional_categories").delete().eq("professional_id", userId);
    const categoryRows = prof.categories
      .map((slug) => categoryMap[slug])
      .filter(Boolean)
      .map((category_id) => ({ professional_id: userId, category_id }));
    if (categoryRows.length) {
      await admin.from("professional_categories").insert(categoryRows);
    }

    console.log(`✓ Profesional: ${prof.displayName}`);
  }
}

async function seedCompanyAndJobs(categoryMap) {
  const companyId = await ensureUser({
    email: company.email,
    displayName: company.displayName,
    profileType: "company",
    companyName: company.displayName,
  });

  await admin.from("company_profiles").upsert({
    id: companyId,
    company_name: company.displayName,
    description: company.description,
    location_city: company.city,
    is_audiovisual_sector: true,
  });

  for (const job of jobPostings) {
    const { data: existing } = await admin
      .from("job_postings")
      .select("id")
      .eq("author_id", companyId)
      .eq("title", job.title)
      .maybeSingle();

    if (existing?.id) {
      console.log(`· Oferta ya existe: ${job.title}`);
      continue;
    }

    const { data: posting, error } = await admin
      .from("job_postings")
      .insert({
        author_id: companyId,
        author_type: "company",
        title: job.title,
        description: job.description,
        posting_type: job.posting_type,
        contract_type: job.contract_type ?? null,
        work_modality: job.work_modality,
        location_city: job.city,
        budget_min: job.budget_min ?? null,
        budget_max: job.budget_max ?? null,
        salary_min: job.salary_min ?? null,
        salary_max: job.salary_max ?? null,
        status: "open",
      })
      .select("id")
      .single();

    if (error) throw error;

    const categoryRows = job.categories
      .map((slug) => categoryMap[slug])
      .filter(Boolean)
      .map((category_id) => ({ job_posting_id: posting.id, category_id }));

    if (categoryRows.length) {
      await admin.from("job_posting_categories").insert(categoryRows);
    }

    console.log(`✓ Oferta: ${job.title}`);
  }
}

async function seedServices(categoryMap) {
  for (const service of services) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", service.professionalEmail)
      .single();

    if (!profile) continue;

    const { data: existing } = await admin
      .from("services")
      .select("id")
      .eq("professional_id", profile.id)
      .eq("title", service.title)
      .maybeSingle();

    if (existing?.id) {
      console.log(`· Servicio ya existe: ${service.title}`);
      continue;
    }

    const { error } = await admin.from("services").insert({
      professional_id: profile.id,
      title: service.title,
      description: service.description,
      category_id: categoryMap[service.category] ?? null,
      pricing_type: service.pricing_type,
      price_amount: service.price_amount,
      estimated_duration: service.duration,
      work_modality: service.modality,
      location_city: service.city,
      is_active: true,
    });

    if (error) throw error;
    console.log(`✓ Servicio: ${service.title}`);
  }
}

async function main() {
  console.log(`==> Sembrando datos demo en ${url}\n`);

  const categoryMap = await getCategoryMap();
  if (!Object.keys(categoryMap).length) {
    console.error("❌ No hay categorías. Ejecuta las migraciones + seed.sql en el Mac Mini primero.");
    process.exit(1);
  }

  await seedProfessionals(categoryMap);
  await seedCompanyAndJobs(categoryMap);
  await seedServices(categoryMap);

  const { data: count } = await admin.rpc("search_professionals", {
    p_limit: 1,
    p_offset: 0,
  });

  console.log("\n✅ Datos demo listos.");
  console.log(`   Profesionales visibles: ${Array.isArray(count) ? "consulta /profesionales" : "ok"}`);
  console.log(`   Cuentas demo — contraseña: ${DEMO_PASSWORD}`);
}

main().catch((err) => {
  console.error("❌", err.message ?? err);
  process.exit(1);
});
