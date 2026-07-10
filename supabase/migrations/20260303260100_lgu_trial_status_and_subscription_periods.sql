-- STEP 2 OF 2 — Run after 20260303260000_add_lgu_status_trial_enum.sql has committed.
-- Trial status, subscription periods for billing history, annual plan only in UI.

-- Default new LGUs to trial (was pending)
alter table public.lgus
  alter column status set default 'trial';

-- Normalize legacy status values
update public.lgus
set status = 'trial'
where status in ('pending', 'paid')
  and subscription_start_date is null;

update public.lgus
set status = 'active'
where status = 'paid'
  and subscription_start_date is not null;

update public.lgus
set status = 'trial'
where status = 'pending';

-- Standardize subscription plan to annual
update public.lgus
set support_plan = 'annual'
where support_plan is null or support_plan = 'monthly';

-- Subscription periods table (billing history)
create table if not exists public.lgu_subscription_periods (
  id uuid primary key default gen_random_uuid(),
  lgu_id uuid not null references public.lgus(id) on delete cascade,
  start_date timestamptz not null,
  end_date timestamptz not null,
  amount numeric not null default 0,
  activated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists lgu_subscription_periods_lgu_id_idx
  on public.lgu_subscription_periods (lgu_id, start_date desc);

alter table public.lgu_subscription_periods enable row level security;

drop policy if exists "company_admin_all_subscription_periods" on public.lgu_subscription_periods;
create policy "company_admin_all_subscription_periods"
on public.lgu_subscription_periods
for all
to authenticated
using (public.is_company_admin())
with check (public.is_company_admin());

drop policy if exists "lgu_read_own_subscription_periods" on public.lgu_subscription_periods;
create policy "lgu_read_own_subscription_periods"
on public.lgu_subscription_periods
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.account_type = 'lgu'
      and p.lgu_id = lgu_subscription_periods.lgu_id
  )
);

-- Backfill billing history from current subscription dates
insert into public.lgu_subscription_periods (lgu_id, start_date, end_date, amount, activated_at)
select
  l.id,
  l.subscription_start_date,
  l.subscription_end_date,
  l.subscription_amount,
  coalesce(l.subscription_start_date, l.created_at)
from public.lgus l
where l.subscription_start_date is not null
  and l.subscription_end_date is not null
  and not exists (
    select 1
    from public.lgu_subscription_periods sp
    where sp.lgu_id = l.id
      and sp.start_date = l.subscription_start_date
      and sp.end_date = l.subscription_end_date
  );
