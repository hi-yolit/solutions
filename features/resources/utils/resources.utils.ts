// src/lib/data.ts
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client
import { ResourceStatus, Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server"; // Import server-side Supabase client
import { Navbar } from "@/components/layout/navbar";
import { SearchBox } from "@/components/search-box";
import { getResources, getSuggestedSubjects } from "@/actions/resources";
import { SubjectResources } from "@/components/subject-resources";

export async function getResourcesData(grade?: number, limit?: number) {
  try {
    const resources = await prisma.resource.findMany({
      where: {
        status: ResourceStatus.LIVE,
        grade: grade,
      },
      take: limit,
    });

    return { resources };
  } catch (error) {
    console.error("Error fetching resources:", error);
    return { resources: [] }; // Or throw the error if you want to handle it higher up
  }
}
