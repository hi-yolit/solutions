-- ============================================================
-- Instructions: Run each section separately in the SQL Editor
-- ============================================================

-- Section 1: Profile trigger
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO public.profile (id, role, solutionCredits, createdAt, updatedAt)
        VALUES (NEW.id, 'STUDENT', 3, NOW(), NOW());
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Section 2: Resource trigger
-- ============================================================
/* DROP TRIGGER IF EXISTS on_resource_created ON public.resource;

CREATE OR REPLACE FUNCTION public.handle_new_resource() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        -- Set default values if needed
        NEW.status = COALESCE(NEW.status, 'DRAFT');
        NEW.createdAt = COALESCE(NEW.createdAt, NOW());
        NEW.updatedAt = COALESCE(NEW.updatedAt, NOW());
        
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_resource_created
    BEFORE INSERT ON public.resource
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_resource(); */

-- Section 3: Content trigger
-- ============================================================
/* DROP TRIGGER IF EXISTS on_content_created ON public.content;

CREATE OR REPLACE FUNCTION public.handle_new_content() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        -- Set default values
        NEW.order = COALESCE(NEW.order, 0);
        NEW.createdAt = COALESCE(NEW.createdAt, NOW());
        NEW.updatedAt = COALESCE(NEW.updatedAt, NOW());
        
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_content_created
    BEFORE INSERT ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_content(); */

-- Section 4: Question trigger
-- ============================================================
DROP TRIGGER IF EXISTS on_question_created ON public.question;

CREATE OR REPLACE FUNCTION public.handle_new_question() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        -- Set default values
        NEW.status = COALESCE(NEW.status, 'DRAFT');
        NEW.createdAt = COALESCE(NEW.createdAt, NOW());
        NEW.updatedAt = COALESCE(NEW.updatedAt, NOW());
        
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_question_created
    BEFORE INSERT ON public.question
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_question();

-- Section 5: Solution trigger
-- ============================================================
DROP TRIGGER IF EXISTS on_solution_created ON public.solution;
/* 
CREATE OR REPLACE FUNCTION public.handle_new_solution() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        -- Set default values
        NEW.createdAt = COALESCE(NEW.createdAt, NOW());
        NEW.updatedAt = COALESCE(NEW.updatedAt, NOW());
        
        -- Check if the user is an admin (security measure at DB level)
        IF NOT EXISTS (
            SELECT 1 FROM public.profile 
            WHERE id = NEW.adminId 
            AND role = 'ADMIN'
        ) THEN
            RAISE EXCEPTION 'Only admins can create solutions';
        END IF;
        
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_solution_created
    BEFORE INSERT ON public.solution
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_solution(); */

-- Section 6: Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        NEW.updatedAt = NOW();
        RETURN NEW;
    END;
    $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS set_profile_updated_at ON public.profile;
DROP TRIGGER IF EXISTS set_resource_updated_at ON public.resource;
DROP TRIGGER IF EXISTS set_content_updated_at ON public.content;
DROP TRIGGER IF EXISTS set_question_updated_at ON public.question;
DROP TRIGGER IF EXISTS set_solution_updated_at ON public.solution;

-- Create updated_at triggers
CREATE TRIGGER set_profile_updated_at
    BEFORE UPDATE ON public.profile
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_resource_updated_at
    BEFORE UPDATE ON public.resource
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_content_updated_at
    BEFORE UPDATE ON public.content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_question_updated_at
    BEFORE UPDATE ON public.question
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_solution_updated_at
    BEFORE UPDATE ON public.solution
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Section 7: Enable RLS and grant permissions
-- ============================================================
-- Enable RLS on all tables
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solution ENABLE ROW LEVEL SECURITY;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON public.profile, public.resource, public.content, public.question, public.solution TO service_role;
GRANT SELECT, UPDATE ON public.profile TO authenticated;
GRANT SELECT ON public.resource, public.content, public.question TO authenticated, anon;

-- Section 8: Profile policies
-- ============================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profile;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profile;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profile;

-- Create profile policies
CREATE POLICY "Users can view their own profile"
  ON public.profile
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profile
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profile
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

-- Section 9: Resource policies
-- ============================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view LIVE resources" ON public.resource;
DROP POLICY IF EXISTS "Admins can view all resources" ON public.resource;
DROP POLICY IF EXISTS "Only admins can create resources" ON public.resource;
DROP POLICY IF EXISTS "Only admins can update resources" ON public.resource;
DROP POLICY IF EXISTS "Only admins can delete resources" ON public.resource;

-- Create resource policies
CREATE POLICY "Anyone can view LIVE resources"
  ON public.resource
  FOR SELECT
  USING (status = 'LIVE');

CREATE POLICY "Admins can view all resources"
  ON public.resource
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can create resources"
  ON public.resource
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can update resources"
  ON public.resource
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can delete resources"
  ON public.resource
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

-- Section 10: Content policies
-- ============================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view content from LIVE resources" ON public.content;
DROP POLICY IF EXISTS "Admins can view all content" ON public.content;
DROP POLICY IF EXISTS "Only admins can create content" ON public.content;
DROP POLICY IF EXISTS "Only admins can update content" ON public.content;
DROP POLICY IF EXISTS "Only admins can delete content" ON public.content;

-- Create content policies
CREATE POLICY "Anyone can view content from LIVE resources"
  ON public.content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.resource
      WHERE resource.id = content.resourceId
      AND resource.status = 'LIVE'
    )
  );

CREATE POLICY "Admins can view all content"
  ON public.content
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can create content"
  ON public.content
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can update content"
  ON public.content
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can delete content"
  ON public.content
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

-- Section 11: Question policies
-- ============================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view LIVE questions" ON public.question;
DROP POLICY IF EXISTS "Admins can view all questions" ON public.question;
DROP POLICY IF EXISTS "Only admins can create questions" ON public.question;
DROP POLICY IF EXISTS "Only admins can update questions" ON public.question;
DROP POLICY IF EXISTS "Only admins can delete questions" ON public.question;

-- Create question policies
CREATE POLICY "Anyone can view LIVE questions"
  ON public.question
  FOR SELECT
  USING (status = 'LIVE');

CREATE POLICY "Admins can view all questions"
  ON public.question
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can create questions"
  ON public.question
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can update questions"
  ON public.question
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can delete questions"
  ON public.question
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

-- Section 12: Solution policies
-- ============================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all solutions" ON public.solution;
DROP POLICY IF EXISTS "Students can view solutions" ON public.solution;
DROP POLICY IF EXISTS "Only admins can create solutions" ON public.solution;
DROP POLICY IF EXISTS "Only admins can update solutions" ON public.solution;
DROP POLICY IF EXISTS "Only admins can delete solutions" ON public.solution;

-- Create solution policies
CREATE POLICY "Admins can view all solutions"
  ON public.solution
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Students can view solutions"
  ON public.solution
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'STUDENT'
    )
  );

CREATE POLICY "Only admins can create solutions"
  ON public.solution
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can update solutions"
  ON public.solution
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );

CREATE POLICY "Only admins can delete solutions"
  ON public.solution
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profile
      WHERE profile.id = auth.uid()
      AND profile.role = 'ADMIN'
    )
  );