// src/app/(public)/page.tsx
import { ResourceStatus, Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { SearchBox } from "@/components/search-box";
import { getResources, getSuggestedSubjects } from "@/actions/resources";
import { SubjectResources } from "@/components/subject-resources";

async function checkUserAuthentication() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // Handle auth error (this is a system error, not just lack of authentication)
    if (error) {
      console.error("Supabase auth error:", error);
      return { error: "Authentication service unavailable." };
    }

    // Return authentication status
    return { isAuthenticated: !!user, userId: user?.id };
  } catch (error) {
    console.error("Error checking authentication:", error);
    return { error: "Failed to check authentication status." };
  }
}

async function handleGetSuggestedSubjects() {
  try {
    const subjectsData = await getSuggestedSubjects();
    return { subjects: subjectsData?.subjects || [] };
  } catch (error) {
    console.error("Error fetching suggested subjects:", error);
    return { subjects: [] };
  }
}

async function handleGetResources() {
  try {
    const resourcesData = await getResources({
      status: ResourceStatus.LIVE,
      limit: 15,
    });
    return { resources: resourcesData?.resources || [] };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { resources: [] };
  }
}

export default async function Home() {
  // Check authentication status
  const authResult = await checkUserAuthentication();

  // Handle system errors with auth
  if (authResult?.error) {
    return (
      <div className="max-w-[64rem] mx-auto px-4 py-12">
        <Navbar />
        <div className="text-center my-12">
          <p className="text-red-500">
            {authResult.error} Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to home
  // This should be outside of try/catch to let Next.js handle the redirect
  if (authResult.isAuthenticated) {
    redirect("/home");
  }

  // If we're here, the user is not authenticated, so show the public content
  const { subjects } = await handleGetSuggestedSubjects();
  const { resources } = await handleGetResources();

  const resourcesBySubject = resources.reduce((acc, resource) => {
    const subject = resource.subject;
    if (!acc[subject]) {
      acc[subject] = [];
    }
    acc[subject].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  return (
    <div className="max-w-[64rem] mx-auto px-4 py-12">
      <Navbar />
      <div className="text-center my-12">
        <h1 className="text-5xl font-bold mb-4">
          Find textbook solutions you can trust
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Access step-by-step solutions for your CAPS and IEB textbooks and past
          papers
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBox />
        </div>
      </div>

      {/* Browse Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Browse by subject</h2>
        {subjects && resources && (
          <SubjectResources
            subjects={subjects}
            resourcesBySubject={resourcesBySubject || {}}
          />
        )}
      </div>
    </div>
  );
}