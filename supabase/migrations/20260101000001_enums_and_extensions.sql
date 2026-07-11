-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Profile types
CREATE TYPE profile_type AS ENUM ('professional', 'company', 'individual');

-- Work modality
CREATE TYPE work_modality AS ENUM ('on_site', 'remote', 'hybrid');

-- Professional job seeking preferences
CREATE TYPE job_seeking_type AS ENUM (
  'employment',
  'freelance',
  'collaboration',
  'internship',
  'production'
);

-- Availability status
CREATE TYPE availability_status AS ENUM (
  'available',
  'busy',
  'partial',
  'tentative',
  'vacation'
);

-- Job posting types
CREATE TYPE job_posting_type AS ENUM (
  'employment',
  'freelance',
  'internship',
  'collaboration',
  'production',
  'one_off',
  'event_service',
  'substitution',
  'day_rate',
  'remote_project'
);

-- Contract types
CREATE TYPE contract_type AS ENUM (
  'permanent',
  'temporary',
  'freelance',
  'internship',
  'collaboration',
  'project_based',
  'day_rate'
);

-- Pricing types for services
CREATE TYPE pricing_type AS ENUM ('fixed', 'hourly', 'estimate');

-- Application status
CREATE TYPE application_status AS ENUM (
  'pending',
  'reviewed',
  'shortlisted',
  'accepted',
  'rejected',
  'withdrawn'
);

-- Conversation participant roles
CREATE TYPE conversation_type AS ENUM (
  'direct',
  'job_related',
  'service_related',
  'project_related'
);

-- Notification channels
CREATE TYPE notification_channel AS ENUM ('in_app', 'email', 'push');

-- Category status for user-submitted categories
CREATE TYPE category_status AS ENUM ('active', 'pending', 'rejected');
