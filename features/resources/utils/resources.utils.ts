import prisma  from "@/lib/prisma";
import { ResourceStatus, Resource, ResourceType } from "@prisma/client";

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

export function groupResourceByType(resources: Resource[]) {
  return resources.reduce<Record<ResourceType, Resource[]>>(
    (acc, resource) => {
      acc[resource.type] = acc[resource.type] || [];
      acc[resource.type].push(resource);
      return acc;
    },
    { PAST_PAPER: [], TEXTBOOK: [], STUDY_GUIDE: [] }
  );
}

export function groupResourcesBySubject(resources: Resource[]) {
  return resources.reduce(
    (acc: { [subject: string]: Resource[] }, resource) => {
      if (!acc[resource.subject]) {
        acc[resource.subject] = [];
      }
      acc[resource.subject].push(resource);
      return acc;
    },
    {}
  );
}

export const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: "Textbook",
  PAST_PAPER: "Past Paper",
  STUDY_GUIDE: "Study Guide",
};
