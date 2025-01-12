import postgres from "postgres";
import "dotenv/config";

const dbUrl = process.env.DATABASE_URL!;

if (!dbUrl) {
    throw new Error("Couldn't find db url");
}
const sql = postgres(dbUrl);

async function main() {
    await sql`
        create or replace function public.handle_new_user()
        returns trigger as $$
        begin
            insert into public.profile (id)
            values (new.id);
            return new;
        end;
        $$ language plpgsql security definer;
        `;
    await sql`
        create or replace trigger on_auth_user_created
            after insert on auth.users
            for each row execute procedure public.handle_new_user();
      `;

    await sql`
        create or replace function public.handle_user_delete()
        returns trigger as $$
        begin
          delete from auth.users where id = old.id;
          return old;
        end;
        $$ language plpgsql security definer;
      `;

    await sql`
        create or replace trigger on_profile_user_deleted
          after delete on public.profile
          for each row execute procedure public.handle_user_delete()
      `;

    // Drop all existing policies
    await sql`
        DROP POLICY IF EXISTS "Allow admin to read profiles" ON public.profile;
        DROP POLICY IF EXISTS "Allow admin to update profiles" ON public.profile;
        DROP POLICY IF EXISTS "Allow users to read their own profiles" ON public.profile;
        DROP POLICY IF EXISTS "Allow users to update their own profiles" ON public.profile;
    `;

    // Function to get the user's role
    await sql`
        CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
        RETURNS "UserRole" AS $$
        DECLARE
            user_role "UserRole";
        BEGIN
            SELECT role
            FROM public.profile
            WHERE id = user_id
            LIMIT 1
            INTO user_role;
            RETURN user_role;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN RETURN 'STUDENT';
        END;
        $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    `;

    // Allow admin users to read all profiles
    await sql`
        CREATE POLICY "Allow admin to read profiles"
        ON public.profile
        FOR SELECT
        USING (get_user_role(auth.uid()) = 'ADMIN');
    `;

    // Allow admin users to update all profiles
    await sql`
        CREATE POLICY "Allow admin to update profiles"
        ON public.profile
        FOR UPDATE
        USING (get_user_role(auth.uid()) = 'ADMIN')
        WITH CHECK (get_user_role(auth.uid()) = 'ADMIN');
    `;

    // Allow users to read their own profiles
    await sql`
        CREATE POLICY "Allow users to read their own profiles"
        ON public.profile
        FOR SELECT
        USING (id = auth.uid());
    `;

    // Allow users to update their own profiles
    await sql`
        CREATE POLICY "Allow users to update their own profiles"
        ON public.profile
        FOR UPDATE
        USING (id = auth.uid())
        WITH CHECK (id = auth.uid());
    `;

    console.log(
        "Finished adding triggers, functions, and row-level security policies."
    );
    process.exit();
}

main();