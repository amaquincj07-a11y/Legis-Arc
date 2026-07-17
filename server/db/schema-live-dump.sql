--
-- PostgreSQL database dump
--

\restrict BJuceZB6QAsTWHmiZQscTjCjbZTj0aED2wG0921OdNUAhJ9txlGiwwfYPyPxxjl

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: account_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.account_type AS ENUM (
    'company',
    'lgu'
);


--
-- Name: lgu_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.lgu_status AS ENUM (
    'active',
    'paid',
    'pending',
    'suspended',
    'expired'
);


--
-- Name: user_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.user_role AS ENUM (
    'sys_admin',
    'sb_secretary',
    'sb_member',
    'digitization_assistant'
);


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: committees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.committees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    name text NOT NULL,
    chairman_id uuid,
    vice_chairman_id uuid,
    member_ids uuid[] DEFAULT '{}'::uuid[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cso_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cso_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    name text NOT NULL,
    officer_name text,
    "position" text,
    term text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: document_download_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.document_download_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    document_id uuid NOT NULL,
    document_type text NOT NULL,
    document_number text DEFAULT ''::text NOT NULL,
    document_title text DEFAULT ''::text NOT NULL,
    document_category text DEFAULT ''::text NOT NULL,
    requester_name text DEFAULT ''::text NOT NULL,
    office_org text DEFAULT ''::text NOT NULL,
    purpose text DEFAULT ''::text NOT NULL,
    consent_agreed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lgu_activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lgu_activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    user_id uuid,
    user_name text DEFAULT ''::text NOT NULL,
    action text NOT NULL,
    module text DEFAULT ''::text NOT NULL,
    entity_id uuid,
    entity_title text,
    details jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lgu_subscription_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lgu_subscription_periods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: lgus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lgus (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    province text NOT NULL,
    municipality text NOT NULL,
    status public.lgu_status DEFAULT 'pending'::public.lgu_status NOT NULL,
    subscription_amount numeric(12,2) DEFAULT 100000 NOT NULL,
    subscription_start_date timestamp with time zone DEFAULT now() NOT NULL,
    subscription_end_date timestamp with time zone NOT NULL,
    street_address text,
    support_plan text,
    document_count integer DEFAULT 0 NOT NULL,
    admin_full_name text NOT NULL,
    admin_position text NOT NULL,
    admin_office_email text NOT NULL,
    admin_mobile_number text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT lgus_support_plan_check CHECK (((support_plan IS NULL) OR (support_plan = ANY (ARRAY['monthly'::text, 'annual'::text]))))
);


--
-- Name: ordinances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ordinances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    ordinance_number text NOT NULL,
    series_year integer NOT NULL,
    title text NOT NULL,
    author_sponsor text DEFAULT ''::text NOT NULL,
    category text NOT NULL,
    ordinance_kind text DEFAULT 'municipal'::text NOT NULL,
    pdf_storage_path text,
    status text DEFAULT 'draft'::text NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ordinances_ordinance_kind_check CHECK ((ordinance_kind = ANY (ARRAY['municipal'::text, 'appropriation'::text]))),
    CONSTRAINT ordinances_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    account_type public.account_type NOT NULL,
    role public.user_role,
    lgu_id uuid,
    full_name text NOT NULL,
    "position" text,
    mobile text,
    is_active boolean DEFAULT true NOT NULL,
    is_primary_admin boolean DEFAULT false NOT NULL,
    module_access text[] DEFAULT '{}'::text[],
    allowed_categories text[] DEFAULT '{}'::text[],
    managed_password text,
    last_login_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    password_reset_token_hash text,
    password_reset_expires_at timestamp with time zone,
    CONSTRAINT profiles_lgu_account_requires_lgu_id CHECK ((((account_type = 'lgu'::public.account_type) AND (lgu_id IS NOT NULL)) OR ((account_type = 'company'::public.account_type) AND (lgu_id IS NULL)))),
    CONSTRAINT profiles_role_matches_account_type CHECK ((((account_type = 'lgu'::public.account_type) AND (role IS NOT NULL)) OR ((account_type = 'company'::public.account_type) AND (role IS NULL))))
);


--
-- Name: resolutions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resolutions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    resolution_number text NOT NULL,
    series_year integer NOT NULL,
    title text NOT NULL,
    author_sponsor text DEFAULT ''::text NOT NULL,
    category text NOT NULL,
    pdf_storage_path text,
    status text DEFAULT 'draft'::text NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT resolutions_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: sb_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sb_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    name text NOT NULL,
    position_slot text,
    "position" text,
    image_storage_path text,
    committees text[] DEFAULT '{}'::text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: session_minutes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_minutes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lgu_id uuid NOT NULL,
    session_date date NOT NULL,
    session_type text DEFAULT 'regular'::text NOT NULL,
    pdf_storage_path text,
    status text DEFAULT 'draft'::text NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT session_minutes_session_type_check CHECK ((session_type = ANY (ARRAY['regular'::text, 'special'::text]))),
    CONSTRAINT session_minutes_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'approved'::text, 'published'::text, 'archived'::text])))
);


--
-- Name: committees committees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_pkey PRIMARY KEY (id);


--
-- Name: cso_organizations cso_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cso_organizations
    ADD CONSTRAINT cso_organizations_pkey PRIMARY KEY (id);


--
-- Name: document_categories document_categories_lgu_id_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_lgu_id_name_key UNIQUE (lgu_id, name);


--
-- Name: document_categories document_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_pkey PRIMARY KEY (id);


--
-- Name: document_download_logs document_download_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_download_logs
    ADD CONSTRAINT document_download_logs_pkey PRIMARY KEY (id);


--
-- Name: lgu_activity_logs lgu_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgu_activity_logs
    ADD CONSTRAINT lgu_activity_logs_pkey PRIMARY KEY (id);


--
-- Name: lgu_subscription_periods lgu_subscription_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgu_subscription_periods
    ADD CONSTRAINT lgu_subscription_periods_pkey PRIMARY KEY (id);


--
-- Name: lgus lgus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgus
    ADD CONSTRAINT lgus_pkey PRIMARY KEY (id);


--
-- Name: lgus lgus_province_municipality_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgus
    ADD CONSTRAINT lgus_province_municipality_unique UNIQUE (province, municipality);


--
-- Name: ordinances ordinances_lgu_id_series_year_ordinance_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordinances
    ADD CONSTRAINT ordinances_lgu_id_series_year_ordinance_number_key UNIQUE (lgu_id, series_year, ordinance_number);


--
-- Name: ordinances ordinances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordinances
    ADD CONSTRAINT ordinances_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: resolutions resolutions_lgu_id_series_year_resolution_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_lgu_id_series_year_resolution_number_key UNIQUE (lgu_id, series_year, resolution_number);


--
-- Name: resolutions resolutions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_pkey PRIMARY KEY (id);


--
-- Name: sb_members sb_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sb_members
    ADD CONSTRAINT sb_members_pkey PRIMARY KEY (id);


--
-- Name: session_minutes session_minutes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_minutes
    ADD CONSTRAINT session_minutes_pkey PRIMARY KEY (id);


--
-- Name: lgus_location_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lgus_location_idx ON public.lgus USING btree (province, municipality);


--
-- Name: lgus_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lgus_status_idx ON public.lgus USING btree (status);


--
-- Name: ordinances_lgu_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ordinances_lgu_id_idx ON public.ordinances USING btree (lgu_id);


--
-- Name: profiles_account_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_account_type_idx ON public.profiles USING btree (account_type);


--
-- Name: profiles_email_lower_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX profiles_email_lower_idx ON public.profiles USING btree (lower(email));


--
-- Name: profiles_lgu_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX profiles_lgu_id_idx ON public.profiles USING btree (lgu_id);


--
-- Name: resolutions_lgu_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX resolutions_lgu_id_idx ON public.resolutions USING btree (lgu_id);


--
-- Name: session_minutes_lgu_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX session_minutes_lgu_id_idx ON public.session_minutes USING btree (lgu_id);


--
-- Name: lgus lgus_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER lgus_set_updated_at BEFORE UPDATE ON public.lgus FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: ordinances ordinances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER ordinances_updated_at BEFORE UPDATE ON public.ordinances FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: profiles profiles_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: resolutions resolutions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER resolutions_updated_at BEFORE UPDATE ON public.resolutions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: session_minutes session_minutes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER session_minutes_updated_at BEFORE UPDATE ON public.session_minutes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: committees committees_chairman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_chairman_id_fkey FOREIGN KEY (chairman_id) REFERENCES public.sb_members(id) ON DELETE SET NULL;


--
-- Name: committees committees_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: committees committees_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: committees committees_vice_chairman_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.committees
    ADD CONSTRAINT committees_vice_chairman_id_fkey FOREIGN KEY (vice_chairman_id) REFERENCES public.sb_members(id) ON DELETE SET NULL;


--
-- Name: cso_organizations cso_organizations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cso_organizations
    ADD CONSTRAINT cso_organizations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: cso_organizations cso_organizations_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cso_organizations
    ADD CONSTRAINT cso_organizations_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: document_categories document_categories_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: document_categories document_categories_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_categories
    ADD CONSTRAINT document_categories_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: document_download_logs document_download_logs_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.document_download_logs
    ADD CONSTRAINT document_download_logs_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: lgu_activity_logs lgu_activity_logs_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgu_activity_logs
    ADD CONSTRAINT lgu_activity_logs_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: lgu_activity_logs lgu_activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgu_activity_logs
    ADD CONSTRAINT lgu_activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: lgu_subscription_periods lgu_subscription_periods_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lgu_subscription_periods
    ADD CONSTRAINT lgu_subscription_periods_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: ordinances ordinances_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordinances
    ADD CONSTRAINT ordinances_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: ordinances ordinances_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ordinances
    ADD CONSTRAINT ordinances_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE SET NULL;


--
-- Name: resolutions resolutions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: resolutions resolutions_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resolutions
    ADD CONSTRAINT resolutions_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: sb_members sb_members_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sb_members
    ADD CONSTRAINT sb_members_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: sb_members sb_members_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sb_members
    ADD CONSTRAINT sb_members_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- Name: session_minutes session_minutes_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_minutes
    ADD CONSTRAINT session_minutes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: session_minutes session_minutes_lgu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_minutes
    ADD CONSTRAINT session_minutes_lgu_id_fkey FOREIGN KEY (lgu_id) REFERENCES public.lgus(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict BJuceZB6QAsTWHmiZQscTjCjbZTj0aED2wG0921OdNUAhJ9txlGiwwfYPyPxxjl

