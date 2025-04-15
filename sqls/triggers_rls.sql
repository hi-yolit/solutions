-- ============================================================
-- Instructions: Run each section separately in the SQL Editor
-- ============================================================

-- Section 1: Create security definer function
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profile
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$;

-- Section 2: Profile trigger (maintain lowercase)
-- ============================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        INSERT INTO public.profile (
            id, 
            role, 
            "solutionCredits",  -- camelCase column
            "createdAt", 
            "updatedAt"
        )
        VALUES (
            NEW.id, 
            'STUDENT', 
            3, 
            NOW(), 
            NOW()
        );
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Section 3: Resource trigger (PascalCase table)
-- ============================================================
DROP TRIGGER IF EXISTS "on_resource_created" ON public."Resource";

CREATE OR REPLACE FUNCTION public.handle_new_resource() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        NEW.status = COALESCE(NEW.status, 'DRAFT');
        NEW."createdAt" = COALESCE(NEW."createdAt", NOW());
        NEW."updatedAt" = COALESCE(NEW."updatedAt", NOW());
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER "on_resource_created"
    BEFORE INSERT ON public."Resource"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_resource();

-- Section 4: Content trigger (PascalCase table)
-- ============================================================
DROP TRIGGER IF EXISTS "on_question_created" ON public."Question";

CREATE OR REPLACE FUNCTION public.handle_new_question() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
    BEGIN
        -- Use quoted camelCase columns
        NEW."status" = COALESCE(NEW."status", 'DRAFT');
        NEW."createdAt" = COALESCE(NEW."createdAt", NOW());
        NEW."updatedAt" = COALESCE(NEW."updatedAt", NOW());
        RETURN NEW;
    END;
    $$;

CREATE TRIGGER "on_question_created"
    BEFORE INSERT ON public."Question"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_question();

-- Section 5: Resource policies (PascalCase table)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view LIVE resources" ON public."Resource";
DROP POLICY IF EXISTS "Admins can view all resources" ON public."Resource";

CREATE POLICY "Anyone can view LIVE resources"
  ON public."Resource"
  FOR SELECT
  USING (status = 'LIVE');

CREATE POLICY "Admins can view all resources"
  ON public."Resource"
  FOR SELECT
  USING (public.is_admin());

-- Section 6: Content policies (PascalCase table)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can view content from LIVE resources" ON public."Content";

CREATE POLICY "Anyone can view content from LIVE resources"
  ON public."Content"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Resource"
      WHERE "Resource".id = "Content"."resourceId"
      AND "Resource".status = 'LIVE'
    )
  );

-- Section 7: Question policies (PascalCase table)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all questions" ON public."Question";

CREATE POLICY "Admins can view all questions"
  ON public."Question"
  FOR SELECT
  USING (public.is_admin());

-- Section 8: Solution policies (PascalCase table)
-- ============================================================
DROP POLICY IF EXISTS "Admins can view all solutions" ON public."Solution";

CREATE POLICY "Admins can view all solutions"
  ON public."Solution"
  FOR SELECT
  USING (public.is_admin());

-- Section 9: Grant permissions (PascalCase tables)
-- ============================================================
GRANT ALL ON 
  public.profile, 
  public."Resource", 
  public."Content", 
  public."Question", 
  public."Solution" 
TO service_role;

GRANT SELECT ON 
  public."Resource", 
  public."Content", 
  public."Question" 
TO authenticated, anon;

-- Section 10: Updated_at triggers (PascalCase tables)
-- ============================================================
CREATE TRIGGER "set_Resource_updated_at"
    BEFORE UPDATE ON public."Resource"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER "set_Content_updated_at"
    BEFORE UPDATE ON public."Content"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER "set_Question_updated_at"
    BEFORE UPDATE ON public."Question"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER "set_Solution_updated_at"
    BEFORE UPDATE ON public."Solution"
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();