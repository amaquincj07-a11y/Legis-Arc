-- ============================================================
-- Script 1: Extensions + custom types
-- Run this first in SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";

-- Company vs LGU portal (matches your AccountPortal type)
create type public.account_type as enum ('company', 'lgu');

-- LGU staff roles (matches your UserRole type)
create type public.user_role as enum (
  'sys_admin',
  'sb_secretary',
  'sb_member',
  'digitization_assistant'
);

-- LGU subscription / account status
create type public.lgu_status as enum (
  'trial',
  'active',
  'paid',
  'pending',
  'suspended',
  'expired'
);

-----------------------------------------------------------------------------

-- ============================================================
-- Script 2: lgus table (one row = one municipality client)
-- ============================================================

create table public.lgus (
  id uuid primary key default gen_random_uuid(),

  -- Match your place filter keys (BOHOL / PANGLAO style)
  province text not null,
  municipality text not null,

  status public.lgu_status not null default 'trial',

  subscription_amount numeric(12, 2) not null default 100000,
  subscription_start_date timestamptz not null default now(),
  subscription_end_date timestamptz not null,

  street_address text,
  support_plan text check (support_plan in ('monthly', 'annual')),

  document_count integer not null default 0,

  -- Primary LGU contact (from super-admin create form)
  admin_full_name text not null,
  admin_position text not null,
  admin_office_email text not null,
  admin_mobile_number text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lgus_province_municipality_unique unique (province, municipality)
);

create index lgus_status_idx on public.lgus (status);
create index lgus_location_idx on public.lgus (province, municipality);

comment on table public.lgus is 'LGU tenant accounts managed by company super-admin';




--------------------------------------------------------------------


-- ============================================================
-- Script 3: profiles table (extends Supabase Auth users)
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  account_type public.account_type not null,
  role public.user_role,  -- null for company admins

  lgu_id uuid references public.lgus (id) on delete set null,

  full_name text not null,
  email text not null,
  position text,
  mobile text,

  is_active boolean not null default true,

  module_access text[] default '{}',
  allowed_categories text[] default '{}',

  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- LGU users must belong to a tenant; company admins must not
  constraint profiles_lgu_account_requires_lgu_id check (
    (account_type = 'lgu' and lgu_id is not null)
    or (account_type = 'company' and lgu_id is null)
  ),

  -- Only LGU accounts have a staff role
  constraint profiles_role_matches_account_type check (
    (account_type = 'lgu' and role is not null)
    or (account_type = 'company' and role is null)
  )
);

create index profiles_lgu_id_idx on public.profiles (lgu_id);
create index profiles_account_type_idx on public.profiles (account_type);
create unique index profiles_email_lower_idx on public.profiles (lower(email));

comment on table public.profiles is 'App user profile linked 1:1 with auth.users';




--------------------------------------------------------------------------


-- ============================================================
-- Script 4: auto-update updated_at on row changes
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger lgus_set_updated_at
before update on public.lgus
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();


---------------------------------------------------------------------------


-- ============================================================
-- Script 5: helper functions used by Row Level Security
-- ============================================================

create or replace function public.is_company_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_type = 'company'
      and p.is_active = true
  );
$$;

create or replace function public.current_lgu_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.lgu_id
  from public.profiles p
  where p.id = auth.uid()
    and p.account_type = 'lgu'
    and p.is_active = true
  limit 1;
$$;

revoke all on function public.is_company_admin() from public;
revoke all on function public.current_lgu_id() from public;
grant execute on function public.is_company_admin() to authenticated;
grant execute on function public.current_lgu_id() to authenticated;


-----------------------------------------------------------------------


-- ============================================================
-- Script 6: enable RLS + policies
-- ============================================================

alter table public.lgus enable row level security;
alter table public.profiles enable row level security;

-- ----- LGUS -----

-- Company admin: full access to all LGUs
create policy "company_admin_all_lgus"
on public.lgus
for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

-- LGU staff: read only their own tenant
create policy "lgu_users_read_own_lgu"
on public.lgus
for select
to authenticated
using (id = public.current_lgu_id());

-- ----- PROFILES -----

-- Everyone can read their own profile
create policy "users_read_own_profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

-- Company admin can read all profiles
create policy "company_admin_read_profiles"
on public.profiles
for select
to authenticated
using (public.is_company_admin());

-- Users can update their own profile (name, mobile, etc. — not role/lgu_id)
create policy "users_update_own_profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Company admin can manage profiles (create LGU users later)
create policy "company_admin_manage_profiles"
on public.profiles
for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());


----------------------------------------------------------


-- ============================================================
-- Script 7: seed first tenant — Panglao, Bohol
-- ============================================================

insert into public.lgus (
  province,
  municipality,
  status,
  subscription_amount,
  subscription_start_date,
  subscription_end_date,
  street_address,
  support_plan,
  document_count,
  admin_full_name,
  admin_position,
  admin_office_email,
  admin_mobile_number
)
values (
  'BOHOL',
  'PANGLAO',
  'paid',
  125000,
  '2025-07-01'::timestamptz,
  '2026-07-01'::timestamptz,
  'Municipal Hall, Panglao, Bohol 6340',
  'annual',
  0,
  'Maria Santos Cruz',
  'Municipal Secretary',
  'sbpanglao@gmail.com',
  '09171234567'
);



------------------------------------------------------

select id, province, municipality, status
from public.lgus
where province = 'BOHOL' and municipality = 'PANGLAO';


---------------------------------------------------------



-- ============================================================
-- Script 8: link auth users to profiles
-- REPLACE the UUID placeholders before running
-- ============================================================

-- 1) Company admin profile
insert into public.profiles (
  id,
  account_type,
  role,
  lgu_id,
  full_name,
  email,
  position,
  mobile,
  is_active
)
values (
  '8d39206c-d4c0-48ce-8c04-e80c407c5246'::uuid,
  'company',
  null,
  null,
  'LegisDoc Admin',
  'legisdoc@gmail.com',
  null,
  null,
  true
);

-- 2) Panglao LGU user profile
insert into public.profiles (
  id,
  account_type,
  role,
  lgu_id,
  full_name,
  email,
  position,
  mobile,
  is_active,
  module_access
)
values (
  'd9011263-2e42-4855-a0ea-4218c981e48b'::uuid,
  'lgu',
  'sb_secretary',
  '467dffd3-b716-492e-8d16-c78cd85a025a'::uuid,
  'Maria Santos Cruz',
  'sbpanglao@gmail.com',
  'Municipal Secretary',
  '09171234567',
  true,
  array['ordinances', 'resolutions', 'minutes', 'categories']
);


----------------------------------------------------------

-- Should return 1 Panglao row
select id, province, municipality, status from public.lgus;

-- Should return 2 rows (company + lgu)
select id, account_type, role, email, lgu_id from public.profiles;


-----------------------------------------------------

-- ============================================================
-- Enhance LGUs + profiles for super-admin UI
-- Run in Supabase SQL Editor if you already applied the base schema
-- ============================================================

-- Primary administrator flag (shown in Profile Information tab)
alter table public.profiles
  add column if not exists is_primary_admin boolean not null default false;

create index if not exists profiles_primary_admin_idx
  on public.profiles (lgu_id)
  where is_primary_admin = true;

-- Department profile fields (billing / address — shown in LGU admin billing)
alter table public.lgus
  add column if not exists street_address text,
  add column if not exists support_plan text check (support_plan in ('monthly', 'annual'));

-- Mark existing Panglao primary admin (if profile exists)
update public.profiles p
set is_primary_admin = true
from public.lgus l
where p.lgu_id = l.id
  and l.province = 'BOHOL'
  and l.municipality = 'PANGLAO'
  and p.account_type = 'lgu'
  and p.is_primary_admin = false
  and not exists (
    select 1
    from public.profiles existing
    where existing.lgu_id = l.id
      and existing.is_primary_admin = true
  );

-- Backfill street_address / support_plan for Panglao seed row
update public.lgus
set
  street_address = coalesce(street_address, 'Municipal Hall, Panglao, Bohol 6340'),
  support_plan = coalesce(support_plan, 'annual')
where province = 'BOHOL' and municipality = 'PANGLAO';

-- Company admin can update LGU rows (subscription actions)
drop policy if exists "company_admin_all_lgus" on public.lgus;
create policy "company_admin_all_lgus"
on public.lgus
for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

-- Company admin can update primary admin profiles
drop policy if exists "company_admin_manage_profiles" on public.profiles;
create policy "company_admin_manage_profiles"
on public.profiles
for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

-- Convenience view for super-admin listing (optional — app queries tables directly)
create or replace view public.lgus_listing as
select
  l.id,
  l.province,
  l.municipality,
  l.status,
  l.subscription_amount,
  l.subscription_start_date,
  l.subscription_end_date,
  l.street_address,
  l.support_plan,
  l.document_count,
  l.admin_full_name,
  l.admin_position,
  l.admin_office_email,
  l.admin_mobile_number,
  l.created_at,
  l.updated_at,
  p.id as primary_admin_profile_id,
  p.full_name as primary_admin_full_name,
  p.email as primary_admin_email,
  p.position as primary_admin_position,
  p.mobile as primary_admin_mobile
from public.lgus l
left join public.profiles p
  on p.lgu_id = l.id
  and p.is_primary_admin = true;

grant select on public.lgus_listing to authenticated;


------------------------------------------------------------------

-- Update Panglao LGU subscription period: Jul 3, 2026 → Jul 3, 2027
update public.lgus
set
  subscription_start_date = '2026-07-03T00:00:00+08:00'::timestamptz,
  subscription_end_date = '2027-07-03T00:00:00+08:00'::timestamptz,
  updated_at = now()
where province = 'BOHOL'
  and municipality = 'PANGLAO';


---------------------------------------------------------------------------



-- ============================================================
-- Ordinances table + PDF storage for LGU admin uploads
-- ============================================================

create or replace function public.get_user_lgu_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select lgu_id
  from public.profiles
  where id = auth.uid()
    and account_type = 'lgu'
    and is_active = true
  limit 1;
$$;

create table if not exists public.ordinances (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  ordinance_number text not null,
  series_year integer not null,
  title text not null,
  author_sponsor text not null default '',
  category text not null,
  ordinance_kind text not null default 'municipal'
    check (ordinance_kind in ('municipal', 'appropriation')),
  pdf_storage_path text not null,
  status text not null default 'published'
    check (status in ('draft', 'approved', 'published', 'archived')),
  is_public boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lgu_id, series_year, ordinance_number)
);

create index if not exists ordinances_lgu_id_idx on public.ordinances (lgu_id);
create index if not exists ordinances_series_year_idx on public.ordinances (series_year desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ordinances_updated_at on public.ordinances;
create trigger ordinances_updated_at
before update on public.ordinances
for each row execute function public.set_updated_at();

alter table public.ordinances enable row level security;

drop policy if exists "lgu_users_select_own_ordinances" on public.ordinances;
create policy "lgu_users_select_own_ordinances"
on public.ordinances for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_ordinances" on public.ordinances;
create policy "lgu_users_insert_own_ordinances"
on public.ordinances for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_ordinances" on public.ordinances;
create policy "lgu_users_update_own_ordinances"
on public.ordinances for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_ordinances" on public.ordinances;
create policy "lgu_users_delete_own_ordinances"
on public.ordinances for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_ordinances" on public.ordinances;
create policy "company_admin_all_ordinances"
on public.ordinances for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_published_ordinances" on public.ordinances;
create policy "public_read_published_ordinances"
on public.ordinances for select
to anon
using (is_public = true and status = 'published');

-- PDF storage bucket (private — signed URLs for access)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ordinance-pdfs',
  'ordinance-pdfs',
  false,
  26214400,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lgu_users_upload_ordinance_pdfs" on storage.objects;
create policy "lgu_users_upload_ordinance_pdfs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'ordinance-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_read_ordinance_pdfs" on storage.objects;
create policy "lgu_users_read_ordinance_pdfs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'ordinance-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_update_ordinance_pdfs" on storage.objects;
create policy "lgu_users_update_ordinance_pdfs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'ordinance-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_delete_ordinance_pdfs" on storage.objects;
create policy "lgu_users_delete_ordinance_pdfs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'ordinance-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);



----------------------------------------------------------------------

-- ============================================================
-- Resolutions table + PDF storage for LGU admin uploads
-- ============================================================

create table if not exists public.resolutions (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  resolution_number text not null default '',
  series_year integer not null,
  title text not null,
  author_sponsor text not null default '',
  category text not null,
  pdf_storage_path text not null,
  status text not null default 'published'
    check (status in ('draft', 'approved', 'published', 'archived')),
  is_public boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists resolutions_lgu_id_idx on public.resolutions (lgu_id);
create index if not exists resolutions_series_year_idx on public.resolutions (series_year desc);

create unique index if not exists resolutions_lgu_year_number_unique
  on public.resolutions (lgu_id, series_year, resolution_number)
  where resolution_number <> '';

drop trigger if exists resolutions_updated_at on public.resolutions;
create trigger resolutions_updated_at
before update on public.resolutions
for each row execute function public.set_updated_at();

alter table public.resolutions enable row level security;

drop policy if exists "lgu_users_select_own_resolutions" on public.resolutions;
create policy "lgu_users_select_own_resolutions"
on public.resolutions for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_resolutions" on public.resolutions;
create policy "lgu_users_insert_own_resolutions"
on public.resolutions for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_resolutions" on public.resolutions;
create policy "lgu_users_update_own_resolutions"
on public.resolutions for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_resolutions" on public.resolutions;
create policy "lgu_users_delete_own_resolutions"
on public.resolutions for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_resolutions" on public.resolutions;
create policy "company_admin_all_resolutions"
on public.resolutions for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_published_resolutions" on public.resolutions;
create policy "public_read_published_resolutions"
on public.resolutions for select
to anon
using (is_public = true and status = 'published');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resolution-pdfs',
  'resolution-pdfs',
  false,
  26214400,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lgu_users_upload_resolution_pdfs" on storage.objects;
create policy "lgu_users_upload_resolution_pdfs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'resolution-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_read_resolution_pdfs" on storage.objects;
create policy "lgu_users_read_resolution_pdfs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'resolution-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_update_resolution_pdfs" on storage.objects;
create policy "lgu_users_update_resolution_pdfs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'resolution-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_delete_resolution_pdfs" on storage.objects;
create policy "lgu_users_delete_resolution_pdfs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'resolution-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);



------------------------------------------------------------------------------


-- ============================================================
-- Session minutes table + PDF storage for LGU admin uploads
-- ============================================================

create table if not exists public.session_minutes (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  session_date date not null,
  session_type text not null default 'regular'
    check (session_type in ('regular', 'special')),
  pdf_storage_path text not null,
  status text not null default 'published'
    check (status in ('draft', 'approved', 'published', 'archived')),
  is_public boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lgu_id, session_date, session_type)
);

create index if not exists session_minutes_lgu_id_idx on public.session_minutes (lgu_id);
create index if not exists session_minutes_session_date_idx on public.session_minutes (session_date desc);

drop trigger if exists session_minutes_updated_at on public.session_minutes;
create trigger session_minutes_updated_at
before update on public.session_minutes
for each row execute function public.set_updated_at();

alter table public.session_minutes enable row level security;

drop policy if exists "lgu_users_select_own_session_minutes" on public.session_minutes;
create policy "lgu_users_select_own_session_minutes"
on public.session_minutes for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_session_minutes" on public.session_minutes;
create policy "lgu_users_insert_own_session_minutes"
on public.session_minutes for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_session_minutes" on public.session_minutes;
create policy "lgu_users_update_own_session_minutes"
on public.session_minutes for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_session_minutes" on public.session_minutes;
create policy "lgu_users_delete_own_session_minutes"
on public.session_minutes for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_session_minutes" on public.session_minutes;
create policy "company_admin_all_session_minutes"
on public.session_minutes for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_published_session_minutes" on public.session_minutes;
create policy "public_read_published_session_minutes"
on public.session_minutes for select
to anon
using (is_public = true and status = 'published');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'minutes-pdfs',
  'minutes-pdfs',
  false,
  26214400,
  array['application/pdf']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lgu_users_upload_minutes_pdfs" on storage.objects;
create policy "lgu_users_upload_minutes_pdfs"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'minutes-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_read_minutes_pdfs" on storage.objects;
create policy "lgu_users_read_minutes_pdfs"
on storage.objects for select
to authenticated
using (
  bucket_id = 'minutes-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_update_minutes_pdfs" on storage.objects;
create policy "lgu_users_update_minutes_pdfs"
on storage.objects for update
to authenticated
using (
  bucket_id = 'minutes-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_delete_minutes_pdfs" on storage.objects;
create policy "lgu_users_delete_minutes_pdfs"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'minutes-pdfs'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);



-------------------------------------------------------------------------


-- ============================================================
-- SB Members table + photo storage for LGU admin roster
-- ============================================================

create table if not exists public.sb_members (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  name text not null,
  position_slot text not null
    check (position_slot in (
      'vice_mayor',
      'kagawad_1', 'kagawad_2', 'kagawad_3', 'kagawad_4',
      'kagawad_5', 'kagawad_6', 'kagawad_7', 'kagawad_8',
      'abc_president', 'sk_federated', 'sb_secretary'
    )),
  position text not null,
  image_storage_path text not null default '',
  committees jsonb not null default '[]'::jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lgu_id, position_slot)
);

create index if not exists sb_members_lgu_id_idx on public.sb_members (lgu_id);

drop trigger if exists sb_members_updated_at on public.sb_members;
create trigger sb_members_updated_at
before update on public.sb_members
for each row execute function public.set_updated_at();

alter table public.sb_members enable row level security;

drop policy if exists "lgu_users_select_own_sb_members" on public.sb_members;
create policy "lgu_users_select_own_sb_members"
on public.sb_members for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_sb_members" on public.sb_members;
create policy "lgu_users_insert_own_sb_members"
on public.sb_members for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_sb_members" on public.sb_members;
create policy "lgu_users_update_own_sb_members"
on public.sb_members for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_sb_members" on public.sb_members;
create policy "lgu_users_delete_own_sb_members"
on public.sb_members for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_sb_members" on public.sb_members;
create policy "company_admin_all_sb_members"
on public.sb_members for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_sb_members" on public.sb_members;
create policy "public_read_sb_members"
on public.sb_members for select
to anon
using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'sb-member-photos',
  'sb-member-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "lgu_users_upload_sb_member_photos" on storage.objects;
create policy "lgu_users_upload_sb_member_photos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'sb-member-photos'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_read_sb_member_photos" on storage.objects;
create policy "lgu_users_read_sb_member_photos"
on storage.objects for select
to authenticated
using (
  bucket_id = 'sb-member-photos'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_update_sb_member_photos" on storage.objects;
create policy "lgu_users_update_sb_member_photos"
on storage.objects for update
to authenticated
using (
  bucket_id = 'sb-member-photos'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "lgu_users_delete_sb_member_photos" on storage.objects;
create policy "lgu_users_delete_sb_member_photos"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'sb-member-photos'
  and (storage.foldername(name))[1] = public.get_user_lgu_id()::text
);

drop policy if exists "public_read_sb_member_photos" on storage.objects;
create policy "public_read_sb_member_photos"
on storage.objects for select
to anon
using (bucket_id = 'sb-member-photos');


-------------------------------------------------------------------


-- ============================================================
-- Committees table for LGU admin — leadership linked to SB members
-- ============================================================

create table if not exists public.committees (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  name text not null,
  chairman_id uuid not null references public.sb_members(id) on delete restrict,
  vice_chairman_id uuid not null references public.sb_members(id) on delete restrict,
  member_ids uuid[] not null default '{}'::uuid[],
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists committees_lgu_id_idx on public.committees (lgu_id);

drop trigger if exists committees_updated_at on public.committees;
create trigger committees_updated_at
before update on public.committees
for each row execute function public.set_updated_at();

alter table public.committees enable row level security;

drop policy if exists "lgu_users_select_own_committees" on public.committees;
create policy "lgu_users_select_own_committees"
on public.committees for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_committees" on public.committees;
create policy "lgu_users_insert_own_committees"
on public.committees for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_committees" on public.committees;
create policy "lgu_users_update_own_committees"
on public.committees for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_committees" on public.committees;
create policy "lgu_users_delete_own_committees"
on public.committees for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_committees" on public.committees;
create policy "company_admin_all_committees"
on public.committees for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_committees" on public.committees;
create policy "public_read_committees"
on public.committees for select
to anon
using (true);


-----------------------------------------------------------------



-- ============================================================
-- CSO organizations table for LGU admin directory
-- ============================================================

create table if not exists public.cso_organizations (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  name text not null,
  officer_name text not null,
  position text not null,
  term text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cso_organizations_lgu_id_idx on public.cso_organizations (lgu_id);
create index if not exists cso_organizations_term_idx on public.cso_organizations (term);

drop trigger if exists cso_organizations_updated_at on public.cso_organizations;
create trigger cso_organizations_updated_at
before update on public.cso_organizations
for each row execute function public.set_updated_at();

alter table public.cso_organizations enable row level security;

drop policy if exists "lgu_users_select_own_cso_organizations" on public.cso_organizations;
create policy "lgu_users_select_own_cso_organizations"
on public.cso_organizations for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_cso_organizations" on public.cso_organizations;
create policy "lgu_users_insert_own_cso_organizations"
on public.cso_organizations for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_cso_organizations" on public.cso_organizations;
create policy "lgu_users_update_own_cso_organizations"
on public.cso_organizations for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_cso_organizations" on public.cso_organizations;
create policy "lgu_users_delete_own_cso_organizations"
on public.cso_organizations for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_cso_organizations" on public.cso_organizations;
create policy "company_admin_all_cso_organizations"
on public.cso_organizations for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_cso_organizations" on public.cso_organizations;
create policy "public_read_cso_organizations"
on public.cso_organizations for select
to anon
using (true);



------------------------------------------------------------------------


-- ============================================================
-- Document categories per LGU + default seed on LGU creation
-- ============================================================

create table if not exists public.document_categories (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lgu_id, name)
);

create index if not exists document_categories_lgu_id_idx
  on public.document_categories (lgu_id);

drop trigger if exists document_categories_updated_at on public.document_categories;
create trigger document_categories_updated_at
before update on public.document_categories
for each row execute function public.set_updated_at();

alter table public.document_categories enable row level security;

drop policy if exists "lgu_users_select_own_document_categories" on public.document_categories;
create policy "lgu_users_select_own_document_categories"
on public.document_categories for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_own_document_categories" on public.document_categories;
create policy "lgu_users_insert_own_document_categories"
on public.document_categories for insert
to authenticated
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_update_own_document_categories" on public.document_categories;
create policy "lgu_users_update_own_document_categories"
on public.document_categories for update
to authenticated
using (lgu_id = public.get_user_lgu_id())
with check (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_delete_own_document_categories" on public.document_categories;
create policy "lgu_users_delete_own_document_categories"
on public.document_categories for delete
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_document_categories" on public.document_categories;
create policy "company_admin_all_document_categories"
on public.document_categories for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_read_document_categories" on public.document_categories;
create policy "public_read_document_categories"
on public.document_categories for select
to anon
using (is_active = true);

-- Seed default categories for an LGU (idempotent)
create or replace function public.seed_default_document_categories(target_lgu_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  category_names text[] := array[
    'Environment',
    'Infrastructure',
    'Taxes',
    'Fees and Charges',
    'Penal, Criminal and Regulatory',
    'Agriculture',
    'Education',
    'Health',
    'Peace and Order',
    'Sports / Amusement',
    'Tourism',
    'Monetary Aide and other requests',
    'Land Use / Zoning',
    'Municipal Lots',
    'Waterworks',
    'Administrative Matters',
    'History and Heritage',
    'Budget',
    'Loans and other Fiscal Matters',
    'Celebrations',
    'Sisterhood Agreement',
    'Women and Children / PWD / Senior Citizen',
    'Information Technology',
    'MOA / MOU / Usufruct / Contracts & Agreements',
    'Coastal Management',
    'Traffic Matters',
    'NGO / PO Accreditation',
    'Purok System',
    'Risk Reduction',
    'Transportation',
    'Franchise'
  ];
  category_name text;
  idx int := 0;
begin
  foreach category_name in array category_names loop
    insert into public.document_categories (lgu_id, name, is_active, sort_order)
    values (target_lgu_id, category_name, true, idx)
    on conflict (lgu_id, name) do nothing;
    idx := idx + 1;
  end loop;
end;
$$;

grant execute on function public.seed_default_document_categories(uuid) to authenticated;

-- Auto-seed when a new LGU is created
create or replace function public.trigger_seed_lgu_document_categories()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_document_categories(new.id);
  return new;
end;
$$;

drop trigger if exists lgus_seed_document_categories on public.lgus;
create trigger lgus_seed_document_categories
after insert on public.lgus
for each row execute function public.trigger_seed_lgu_document_categories();

-- Backfill categories for existing LGUs
do $$
declare
  lgu_record record;
begin
  for lgu_record in select id from public.lgus loop
    perform public.seed_default_document_categories(lgu_record.id);
  end loop;
end;
$$;


---------------------------------------------------------------------------


-- ============================================================
-- LGU primary admin user management (profiles RLS helpers)
-- ============================================================

create or replace function public.is_lgu_primary_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and account_type = 'lgu'
      and is_active = true
      and is_primary_admin = true
      and lgu_id is not null
  );
$$;

grant execute on function public.is_lgu_primary_admin() to authenticated;

-- Primary LGU admin can list all staff profiles for their municipality
drop policy if exists "lgu_primary_admin_select_lgu_profiles" on public.profiles;
create policy "lgu_primary_admin_select_lgu_profiles"
on public.profiles for select
to authenticated
using (
  public.is_lgu_primary_admin()
  and lgu_id = public.get_user_lgu_id()
);

-- Primary LGU admin can update non-primary staff in their municipality
drop policy if exists "lgu_primary_admin_update_lgu_profiles" on public.profiles;
create policy "lgu_primary_admin_update_lgu_profiles"
on public.profiles for update
to authenticated
using (
  public.is_lgu_primary_admin()
  and lgu_id = public.get_user_lgu_id()
  and is_primary_admin = false
  and id <> auth.uid()
)
with check (
  public.is_lgu_primary_admin()
  and lgu_id = public.get_user_lgu_id()
  and is_primary_admin = false
  and account_type = 'lgu'
);



---------------------------------------------------------------------------


-- ============================================================
-- LGU activity logs — immutable audit trail for admin actions
-- Tracks upload/add, edit, delete, and publish on key modules
-- ============================================================

create table if not exists public.lgu_activity_logs (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  action text not null
    check (action in ('upload', 'edit', 'delete', 'publish')),
  module text not null
    check (module in (
      'ordinances',
      'resolutions',
      'minutes',
      'committees',
      'cso',
      'sb_members',
      'categories'
    )),
  entity_id uuid,
  entity_title text,
  details text not null,
  created_at timestamptz not null default now()
);

create index if not exists lgu_activity_logs_lgu_id_created_at_idx
  on public.lgu_activity_logs (lgu_id, created_at desc);

create index if not exists lgu_activity_logs_user_id_idx
  on public.lgu_activity_logs (user_id);

alter table public.lgu_activity_logs enable row level security;

drop policy if exists "lgu_users_select_activity_logs" on public.lgu_activity_logs;
create policy "lgu_users_select_activity_logs"
  on public.lgu_activity_logs
  for select
  using (lgu_id = public.get_user_lgu_id());

drop policy if exists "lgu_users_insert_activity_logs" on public.lgu_activity_logs;
create policy "lgu_users_insert_activity_logs"
  on public.lgu_activity_logs
  for insert
  with check (lgu_id = public.get_user_lgu_id());

--------------------------------------------------------------------

-- ============================================================
-- Public document download logs (citizen download requests)
-- ============================================================

create table if not exists public.document_download_logs (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  document_id uuid not null,
  document_type text not null
    check (document_type in ('ordinance', 'resolution', 'minutes')),
  document_number text,
  document_title text not null,
  document_category text,
  requester_name text,
  office_org text not null,
  purpose text not null,
  consent_agreed boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists document_download_logs_lgu_id_created_at_idx
  on public.document_download_logs (lgu_id, created_at desc);

create index if not exists document_download_logs_document_type_idx
  on public.document_download_logs (document_type);

alter table public.document_download_logs enable row level security;

drop policy if exists "lgu_users_select_own_document_download_logs" on public.document_download_logs;
create policy "lgu_users_select_own_document_download_logs"
on public.document_download_logs for select
to authenticated
using (lgu_id = public.get_user_lgu_id());

drop policy if exists "company_admin_all_document_download_logs" on public.document_download_logs;
create policy "company_admin_all_document_download_logs"
on public.document_download_logs for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "public_insert_document_download_logs" on public.document_download_logs;
create policy "public_insert_document_download_logs"
on public.document_download_logs for insert
to anon
with check (true);


-----------------------------------------------------------------------------------

-- Allow LGU accounts to exist before payment; subscription dates start when marked paid.

alter table public.lgus
  alter column subscription_start_date drop not null,
  alter column subscription_end_date drop not null;

