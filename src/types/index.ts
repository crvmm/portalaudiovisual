export type ProfileType = "professional" | "company" | "individual";

export type WorkModality = "on_site" | "remote" | "hybrid";

export type JobSeekingType =
  | "employment"
  | "freelance"
  | "collaboration"
  | "internship"
  | "production";

export type AvailabilityStatus =
  | "available"
  | "busy"
  | "partial"
  | "tentative"
  | "vacation";

export type JobPostingType =
  | "employment"
  | "freelance"
  | "internship"
  | "collaboration"
  | "production"
  | "one_off"
  | "event_service"
  | "substitution"
  | "day_rate"
  | "remote_project";

export type ContractType =
  | "permanent"
  | "temporary"
  | "freelance"
  | "internship"
  | "collaboration"
  | "project_based"
  | "day_rate";

export type PricingType = "fixed" | "hourly" | "estimate";

export type ApplicationStatus =
  | "pending"
  | "reviewed"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "withdrawn";

export type ExperienceLevel = "junior" | "mid" | "senior" | "expert";

export interface Profile {
  id: string;
  profile_type: ProfileType;
  display_name: string;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProfile {
  id: string;
  headline: string | null;
  bio: string | null;
  cv_url: string | null;
  location_city: string | null;
  location_region: string | null;
  location_province: string | null;
  location_country: string;
  years_experience: number | null;
  experience_level: ExperienceLevel | null;
  is_available: boolean;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  daily_rate_min: number | null;
  daily_rate_max: number | null;
  currency: string;
  website_url: string | null;
  work_modality: WorkModality[];
}

export interface CompanyProfile {
  id: string;
  company_name: string;
  logo_url: string | null;
  description: string | null;
  sector: string | null;
  website_url: string | null;
  location_city: string | null;
  location_region: string | null;
  location_province: string | null;
  team_size: string | null;
  is_audiovisual_sector: boolean;
}

export interface Category {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface Service {
  id: string;
  professional_id: string;
  title: string;
  description: string;
  category_id: string | null;
  pricing_type: PricingType;
  price_amount: number | null;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  estimated_duration: string | null;
  work_modality: WorkModality;
  location_city: string | null;
  is_active: boolean;
}

export interface JobPosting {
  id: string;
  author_id: string;
  author_type: ProfileType;
  title: string;
  description: string;
  posting_type: JobPostingType;
  contract_type: ContractType | null;
  work_modality: WorkModality;
  location_city: string | null;
  location_region: string | null;
  location_province: string | null;
  project_start_date: string | null;
  project_end_date: string | null;
  experience_required: ExperienceLevel | null;
  budget_min: number | null;
  budget_max: number | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  status: string;
  created_at: string;
}

export interface JobMatch {
  id: string;
  job_posting_id: string;
  professional_id: string;
  match_score: number;
  match_explanation: MatchExplanation[];
  is_notified: boolean;
}

export interface MatchExplanation {
  type: string;
  message: string;
  positive: boolean;
}

export interface AvailabilitySlot {
  id: string;
  professional_id: string;
  date: string;
  status: AvailabilityStatus;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  city?: string;
  modality?: WorkModality;
  availableDate?: string;
  maxHourlyRate?: number;
  experienceLevel?: ExperienceLevel;
}

export const PROFILE_TYPE_LABELS: Record<ProfileType, string> = {
  professional: "Profesional audiovisual",
  company: "Empresa",
  individual: "Particular",
};

export const WORK_MODALITY_LABELS: Record<WorkModality, string> = {
  on_site: "Presencial",
  remote: "Remoto",
  hybrid: "Híbrido",
};

export const JOB_POSTING_TYPE_LABELS: Record<JobPostingType, string> = {
  employment: "Empleo",
  freelance: "Freelance",
  internship: "Prácticas",
  collaboration: "Colaboración",
  production: "Producción",
  one_off: "Encargo puntual",
  event_service: "Servicio para eventos",
  substitution: "Sustitución",
  day_rate: "Por días",
  remote_project: "Proyecto remoto",
};

export const AVAILABILITY_STATUS_LABELS: Record<AvailabilityStatus, string> = {
  available: "Disponible",
  busy: "Ocupado",
  partial: "Parcialmente disponible",
  tentative: "Reserva provisional",
  vacation: "Vacaciones",
};

export const AVAILABILITY_STATUS_COLORS: Record<AvailabilityStatus, string> = {
  available: "bg-green-500",
  busy: "bg-red-500",
  partial: "bg-amber-500",
  tentative: "bg-blue-500",
  vacation: "bg-purple-500",
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  permanent: "Indefinido",
  temporary: "Temporal",
  freelance: "Freelance",
  internship: "Prácticas",
  collaboration: "Colaboración",
  project_based: "Por proyecto",
  day_rate: "Por días",
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  junior: "Junior",
  mid: "Intermedio",
  senior: "Senior",
  expert: "Experto",
};

export const JOB_SEEKING_LABELS: Record<JobSeekingType, string> = {
  employment: "Empleo por cuenta ajena",
  freelance: "Proyectos como autónomo",
  collaboration: "Colaboraciones puntuales",
  internship: "Prácticas",
  production: "Producciones audiovisuales",
};

export const PRICING_TYPE_LABELS: Record<PricingType, string> = {
  fixed: "Precio fijo",
  hourly: "Por hora",
  estimate: "Presupuesto orientativo",
};

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  link_url: string | null;
  is_system: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  conversation_type: string;
  job_posting_id: string | null;
  service_id: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  profile_id: string;
  channel: string;
  title: string;
  body: string;
  link_url: string | null;
  job_posting_id: string | null;
  match_score: number | null;
  match_explanation: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PortfolioItem {
  id: string;
  professional_id: string;
  title: string;
  description: string | null;
  media_type: string;
  media_url: string | null;
  thumbnail_url: string | null;
  external_url: string | null;
  is_featured: boolean;
  sort_order: number;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  overall_rating: number;
  quality_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  professionalism_rating: number | null;
  comment: string | null;
  created_at: string;
}
