--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.12 (Ubuntu 15.12-1.pgdg22.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: CurriculumType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CurriculumType" AS ENUM (
    'CAPS',
    'IEB'
);


--
-- Name: QuestionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."QuestionStatus" AS ENUM (
    'DRAFT',
    'LIVE'
);


--
-- Name: ResourceStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResourceStatus" AS ENUM (
    'DRAFT',
    'LIVE'
);


--
-- Name: ResourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ResourceType" AS ENUM (
    'TEXTBOOK',
    'PAST_PAPER',
    'STUDY_GUIDE'
);


--
-- Name: SolutionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SolutionType" AS ENUM (
    'STRUCTURED',
    'ESSAY',
    'MCQ',
    'DRAWING',
    'PROOF',
    'HEADER'
);


--
-- Name: SubscriptionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SubscriptionStatus" AS ENUM (
    'ACTIVE',
    'PAST_DUE',
    'CANCELLED',
    'TRIAL'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'STUDENT',
    'ADMIN'
);


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(user_id uuid) RETURNS public."UserRole"
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    AS $$
DECLARE
    user_role "UserRole"; -- Declare a variable to hold the role
BEGIN
    SELECT role
    INTO user_role
    FROM public.profile
    WHERE id = user_id
    LIMIT 1;

    RETURN user_role; -- Return the role
EXCEPTION
    WHEN NO_DATA_FOUND THEN RETURN 'STUDENT'; -- Return default role if no data found
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
        begin
            insert into public.profile (id)
            values (new.id);
            return new;
        end;
        $$;


--
-- Name: handle_user_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_user_delete() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
        begin
          delete from auth.users where id = old.id;
          return old;
        end;
        $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Chapter; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Chapter" (
    id uuid NOT NULL,
    "resourceId" uuid NOT NULL,
    number integer,
    title text
);


--
-- Name: Question; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Question" (
    id uuid NOT NULL,
    "resourceId" uuid NOT NULL,
    "chapterId" uuid,
    "topicId" uuid,
    "pageNumber" integer,
    "questionNumber" text NOT NULL,
    "exerciseNumber" integer,
    type public."SolutionType" NOT NULL,
    content jsonb NOT NULL,
    status public."QuestionStatus" DEFAULT 'DRAFT'::public."QuestionStatus" NOT NULL
);


--
-- Name: Resource; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Resource" (
    id uuid NOT NULL,
    type public."ResourceType" NOT NULL,
    title text NOT NULL,
    subject text NOT NULL,
    grade integer NOT NULL,
    year integer,
    term integer,
    publisher text,
    edition text,
    "coverImage" text,
    curriculum public."CurriculumType" NOT NULL,
    status public."ResourceStatus" DEFAULT 'DRAFT'::public."ResourceStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Solution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Solution" (
    id uuid NOT NULL,
    "questionId" uuid NOT NULL,
    "adminId" uuid NOT NULL,
    content jsonb NOT NULL,
    steps jsonb[],
    metrics jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Topic; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Topic" (
    id uuid NOT NULL,
    "chapterId" uuid NOT NULL,
    number text,
    title text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile (
    id uuid NOT NULL,
    role public."UserRole" DEFAULT 'STUDENT'::public."UserRole" NOT NULL,
    grade integer,
    school text,
    subjects text[],
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cancelAtPeriodEnd" boolean DEFAULT false NOT NULL,
    "currentPeriodEnd" timestamp(3) without time zone,
    "paystackCustomerId" text,
    "solutionCredits" integer DEFAULT 3 NOT NULL,
    "subscriptionCode" text,
    "subscriptionStatus" public."SubscriptionStatus",
    "trialEndsAt" timestamp(3) without time zone,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "encryptedToken" text
);


--
-- Name: Chapter Chapter_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chapter"
    ADD CONSTRAINT "Chapter_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: Resource Resource_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resource"
    ADD CONSTRAINT "Resource_pkey" PRIMARY KEY (id);


--
-- Name: Solution Solution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Solution"
    ADD CONSTRAINT "Solution_pkey" PRIMARY KEY (id);


--
-- Name: Topic Topic_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: profile profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);


--
-- Name: profile on_profile_user_deleted; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_user_deleted AFTER DELETE ON public.profile FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();


--
-- Name: Chapter Chapter_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Chapter"
    ADD CONSTRAINT "Chapter_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Question Question_chapterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Question Question_resourceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES public."Resource"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Question Question_topicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES public."Topic"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Solution Solution_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Solution"
    ADD CONSTRAINT "Solution_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.profile(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Solution Solution_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Solution"
    ADD CONSTRAINT "Solution_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public."Question"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Topic Topic_chapterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Topic"
    ADD CONSTRAINT "Topic_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES public."Chapter"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: profile Allow admin to read profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to read profiles" ON public.profile FOR SELECT USING ((public.get_user_role(auth.uid()) = 'ADMIN'::public."UserRole"));


--
-- Name: profile Allow admin to update profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow admin to update profiles" ON public.profile FOR UPDATE USING ((public.get_user_role(auth.uid()) = 'ADMIN'::public."UserRole")) WITH CHECK ((public.get_user_role(auth.uid()) = 'ADMIN'::public."UserRole"));


--
-- Name: profile Allow users to read their own profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to read their own profiles" ON public.profile FOR SELECT USING ((id = auth.uid()));


--
-- Name: profile Allow users to update their own profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to update their own profiles" ON public.profile FOR UPDATE USING ((id = auth.uid())) WITH CHECK ((id = auth.uid()));


--
-- Name: Chapter; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Chapter" ENABLE ROW LEVEL SECURITY;

--
-- Name: Question; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Question" ENABLE ROW LEVEL SECURITY;

--
-- Name: Resource; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Resource" ENABLE ROW LEVEL SECURITY;

--
-- Name: Solution; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Solution" ENABLE ROW LEVEL SECURITY;

--
-- Name: Topic; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."Topic" ENABLE ROW LEVEL SECURITY;

--
-- Name: profile; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

