-- STEP 1 OF 2 — Run this query ALONE in Supabase SQL Editor, then run
-- 20260303260100_lgu_trial_status_and_subscription_periods.sql next.
--
-- PostgreSQL requires new enum values to be committed before they can be used
-- in UPDATE/ALTER DEFAULT (error 55P04 if combined in one transaction).

alter type public.lgu_status add value if not exists 'trial';
