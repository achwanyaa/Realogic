-- LuxuryBoma platform: core schema (v1)
-- One database for every client. Every table that holds client data carries
-- client_id, and child rows are tied to their property's client by a composite
-- foreign key, so a row can never point at another client's property.

create schema if not exists private;

-- ---------------------------------------------------------------------------
-- Enumerations
-- ---------------------------------------------------------------------------
create type public.staff_role as enum ('lb_admin', 'lb_editor', 'lb_reviewer', 'client_staff');
create type public.property_status as enum ('draft', 'in_review', 'live', 'paused', 'sold_or_leased');
create type public.provenance_label as enum (
  'measured', 'from_drawings', 'declared', 'indicative', 'not_found', 'not_yet_checked'
);
create type public.spec_value_type as enum ('number', 'boolean', 'text');
create type public.space_kind as enum ('hall', 'mezzanine', 'yard', 'office', 'other');
create type public.media_kind as enum ('tour', 'photo', 'scan');
create type public.document_visibility as enum ('public', 'signed_in', 'staff');
create type public.deal_type as enum ('lease', 'sale');
create type public.listing_status as enum ('draft', 'active', 'paused', 'closed');
create type public.requirement_rule as enum ('minimum', 'maximum', 'must_have');
create type public.fit_verdict as enum ('fits', 'fits_with_changes', 'does_not_fit', 'not_enough_data');
create type public.booking_status as enum ('requested', 'confirmed', 'visited', 'cancelled', 'no_show');
create type public.booking_purpose as enum (
  'first_look', 'technical_inspection', 'with_engineer_or_contractor', 'fit_out_quote'
);
create type public.day_part as enum ('morning', 'afternoon');
create type public.lead_stage as enum ('new', 'visit_booked', 'visited', 'offer', 'won', 'lost');
create type public.correction_status as enum ('open', 'accepted', 'declined');
create type public.event_type as enum (
  'dossier_view', 'tour_open', 'spec_sheet_download', 'fit_check', 'fact_source_open', 'sign_up'
);

-- ---------------------------------------------------------------------------
-- Clients and staff
-- ---------------------------------------------------------------------------
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  legal_name text,
  domain text unique,
  logo_path text,
  phone text,
  whatsapp text,
  email text,
  postal_address text,
  briefing_recipients text[] not null default '{}',
  licence_status text not null default 'pending'
    check (licence_status in ('pending', 'active', 'suspended', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- LuxuryBoma staff have no client; client staff belong to exactly one client per row.
create table public.staff_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  role public.staff_role not null,
  display_name text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint staff_role_matches_client check ((role = 'client_staff') = (client_id is not null)),
  constraint staff_one_row_per_client unique nulls not distinct (user_id, client_id)
);

-- ---------------------------------------------------------------------------
-- The Building Record (owned by LuxuryBoma)
-- ---------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete restrict,
  reference text not null,
  slug text not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null,
  property_type text not null default 'godown',
  address text,
  area_label text,
  near text,
  latitude double precision,
  longitude double precision,
  designed_by text,
  developed_by text,
  status public.property_status not null default 'draft',
  site_visited_on date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, reference),
  unique (client_id, slug),
  unique (id, client_id),
  -- Independence rule: a property goes live only after a LuxuryBoma site visit.
  constraint live_needs_site_visit check (status <> 'live' or site_visited_on is not null)
);
create index properties_client_status_idx on public.properties (client_id, status);

create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  name text not null,
  kind public.space_kind not null default 'hall',
  area_m2 numeric check (area_m2 is null or area_m2 >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (id, property_id),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index spaces_property_idx on public.spaces (property_id);

-- Shared catalogue of the facts a property can have.
create table public.spec_definitions (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  name text not null,
  spec_group text not null check (spec_group in ('structure', 'access', 'power', 'legal', 'location')),
  value_type public.spec_value_type not null default 'number',
  unit text,
  property_type text not null default 'godown',
  required_to_publish boolean not null default false,
  in_headline boolean not null default false,
  headline_label text,
  recheck_days integer check (recheck_days is null or recheck_days > 0),
  sort_order integer not null default 0
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  title text not null,
  number text,
  revision text,
  document_date date,
  author text not null,
  file_path text,
  visibility public.document_visibility not null default 'signed_in',
  note text,
  created_at timestamptz not null default now(),
  unique (id, property_id),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index documents_property_idx on public.documents (property_id);

-- One fact: value, unit, provenance label, source, date, checked by.
create table public.spec_values (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  space_id uuid,
  spec_key text not null references public.spec_definitions (key) on update cascade,
  value_number numeric,
  value_boolean boolean,
  value_text text,
  display_value text not null,
  unit text,
  label public.provenance_label not null default 'not_yet_checked',
  method text,
  source text,
  document_id uuid,
  checked_on date,
  checked_by uuid references auth.users (id) on delete set null,
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade,
  foreign key (space_id, property_id) references public.spaces (id, property_id) on delete cascade,
  foreign key (document_id, property_id) references public.documents (id, property_id),
  constraint one_value_per_spec unique nulls not distinct (property_id, space_id, spec_key),
  -- Independence rule: every "From drawings" fact names its drawing and author.
  constraint drawings_name_their_author check (label <> 'from_drawings' or nullif(btrim(source), '') is not null),
  constraint measured_has_a_date check (label <> 'measured' or checked_on is not null),
  constraint unchecked_has_no_value check (
    label <> 'not_yet_checked'
    or (value_number is null and value_boolean is null and value_text is null)
  )
);
create index spec_values_property_idx on public.spec_values (property_id);

-- Every earlier version of a fact. Rows are written by a trigger and never changed.
create table public.spec_value_history (
  id bigint generated always as identity primary key,
  client_id uuid not null references public.clients (id) on delete restrict,
  property_id uuid not null,
  spec_value_id uuid not null,
  spec_key text not null,
  operation text not null check (operation in ('UPDATE', 'DELETE')),
  old_row jsonb not null,
  changed_by uuid,
  changed_at timestamptz not null default now()
);
create index spec_value_history_value_idx on public.spec_value_history (spec_value_id, changed_at desc);
create index spec_value_history_property_idx on public.spec_value_history (property_id);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  kind public.media_kind not null,
  url text,
  file_path text,
  caption text,
  sort_order integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade,
  constraint media_has_a_location check (url is not null or file_path is not null)
);
create index media_property_idx on public.media (property_id, sort_order);
create unique index media_one_main_photo_idx on public.media (property_id) where is_main;

-- ---------------------------------------------------------------------------
-- Commercial side (owned by the client)
-- ---------------------------------------------------------------------------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  deal public.deal_type not null,
  price numeric check (price is null or price >= 0),
  currency text not null default 'KES',
  price_period text check (price_period in ('month', 'year', 'total')),
  price_on_request boolean not null default true,
  available_from date,
  availability_note text,
  description text,
  status public.listing_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, deal),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index listings_client_status_idx on public.listings (client_id, status);

-- ---------------------------------------------------------------------------
-- Fit check catalogue (shared, owned by LuxuryBoma)
-- ---------------------------------------------------------------------------
create table public.industries (
  key text primary key check (key ~ '^[a-z0-9_]+$'),
  name text not null,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table public.industry_requirements (
  id uuid primary key default gen_random_uuid(),
  industry_key text not null references public.industries (key) on update cascade on delete cascade,
  spec_key text not null references public.spec_definitions (key) on update cascade,
  need_text text not null,
  rule public.requirement_rule not null,
  threshold numeric,
  fixable boolean not null default false,
  fix_note text,
  reasoning text,
  sort_order integer not null default 0,
  unique (industry_key, spec_key),
  constraint threshold_matches_rule check ((rule = 'must_have') = (threshold is null))
);

-- ---------------------------------------------------------------------------
-- Buyers, leads and bookings (personal data: Data Protection Act 2019)
-- ---------------------------------------------------------------------------
create table public.buyer_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  company text,
  role_title text,
  phone text,
  email text,
  industry_key text references public.industries (key) on update cascade on delete set null,
  needs jsonb not null default '{}',
  consent_at timestamptz not null,
  consent_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A buyer becomes a client's lead when they sign up on that client's portal.
-- This link is what lets that client's staff (and nobody else's) see the buyer.
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  buyer_id uuid not null references public.buyer_profiles (user_id) on delete cascade,
  stage public.lead_stage not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, buyer_id)
);

create table public.saved_properties (
  buyer_id uuid not null references public.buyer_profiles (user_id) on delete cascade,
  client_id uuid not null,
  property_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (buyer_id, property_id),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index saved_properties_client_idx on public.saved_properties (client_id);

create table public.fit_results (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  buyer_id uuid not null references public.buyer_profiles (user_id) on delete cascade,
  industry_key text not null references public.industries (key) on update cascade,
  verdict public.fit_verdict not null,
  result_rows jsonb not null default '[]',
  created_at timestamptz not null default now(),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index fit_results_client_idx on public.fit_results (client_id, created_at desc);
create index fit_results_buyer_idx on public.fit_results (buyer_id);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  buyer_id uuid not null references public.buyer_profiles (user_id) on delete cascade,
  preferred_day date not null,
  preferred_time public.day_part not null,
  attendees integer not null default 1 check (attendees between 1 and 20),
  purpose public.booking_purpose not null default 'first_look',
  questions text,
  status public.booking_status not null default 'requested',
  staff_notes text,
  confirmed_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index bookings_client_status_idx on public.bookings (client_id, status);
create index bookings_buyer_idx on public.bookings (buyer_id);

-- ---------------------------------------------------------------------------
-- Correction requests, events and the audit log
-- ---------------------------------------------------------------------------
-- Independence rule: the client cannot change a fact, but can ask LuxuryBoma to.
create table public.correction_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  property_id uuid not null,
  spec_value_id uuid references public.spec_values (id) on delete set null,
  requested_by uuid not null references auth.users (id),
  message text not null check (length(btrim(message)) > 0),
  status public.correction_status not null default 'open',
  resolved_by uuid references auth.users (id),
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade
);
create index correction_requests_client_idx on public.correction_requests (client_id, status);

create table public.events (
  id bigint generated always as identity primary key,
  client_id uuid not null,
  property_id uuid,
  buyer_id uuid references auth.users (id) on delete set null,
  type public.event_type not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  foreign key (property_id, client_id) references public.properties (id, client_id) on delete cascade,
  foreign key (client_id) references public.clients (id) on delete cascade
);
create index events_client_time_idx on public.events (client_id, created_at desc);

-- No foreign keys on purpose: the log must outlive the rows it describes.
create table public.audit_log (
  id bigint generated always as identity primary key,
  client_id uuid,
  actor uuid,
  table_name text not null,
  row_id text,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_row jsonb,
  new_row jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_client_time_idx on public.audit_log (client_id, created_at desc);
create index audit_log_row_idx on public.audit_log (table_name, row_id);
