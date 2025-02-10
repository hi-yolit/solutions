// src/app/(public)/page.tsx
import { ResourceStatus, Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server"; // Import server-side Supabase client
import { Navbar } from "@/components/layout/navbar";
import { SearchBox } from "@/components/search-box";
import { getResources, getSuggestedSubjects } from "@/actions/resources";
import { SubjectResources } from "@/components/subject-resources";

export default async function Home() {
  const supabase = createClient(); 

  const { data, error } = await (await supabase).auth.getUser();

  if (!error && data?.user) {
    redirect("/home");
  }

  const { subjects } = await getSuggestedSubjects();
  const { resources } = (await getResources({
    status: ResourceStatus.LIVE,
    limit: 15,
  })) || { resources: [], total: 0, pages: 0 };

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
