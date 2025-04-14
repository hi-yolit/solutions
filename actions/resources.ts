"use server";

import prisma from "@/lib/prisma";
import { ResourceFormValues } from "@/lib/validations/resource";
import {
  ContentType,
  CurriculumType,
  ResourceStatus,
  ResourceType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "./user";
import { ResourceWithContent } from "@/types/resource";

type SubjectsResponse = {
  subjects: string[];
  error?: string;
};

export async function getResources({
  subject,
  grade,
  curriculum,
  status,
  type,
  page = 1,
  limit = 15,
}: {
  subject?: string;
  grade?: number;
  curriculum?: CurriculumType;
  status?: ResourceStatus;
  type?: ResourceType;
  page?: number;
  limit?: number;
}) {
  try {
    const skip = (page - 1) * limit;

    const resources = await prisma.resource.findMany({
      where: {
        status: status || undefined,
        subject: subject
          ? {
              equals: subject,
              mode: "insensitive",
            }
          : undefined,
        grade: grade || undefined,
        curriculum: curriculum || undefined,
        type: type || undefined,
      },
      orderBy: {
        title: "asc",
      },
      skip,
      take: limit,
    });

    const total = await prisma.resource.count({
      where: {
        status: status || undefined,
        subject: subject
          ? {
              equals: subject,
              mode: "insensitive",
            }
          : undefined,
        grade: grade || undefined,
        curriculum: curriculum || undefined,
        type: type || undefined,
      },
    });

    return {
      resources,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return {
      error: "Failed to fetch resources",
      resources: [],
      total: 0,
      pages: 0,
    };
  }
}

export async function getResourceWithContent(resourceId: string): Promise<{ resource?: ResourceWithContent, error?: string }> {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        contents: {
          where: {
            type: ContentType.CHAPTER
          },
          orderBy: {
            order: 'asc'
          },
          include: {
            children: {
              orderBy: {
                order: 'asc'
              },
              include: {
                children: {
                  orderBy: {
                    order: 'asc'
                  },
                  include: {
                    _count: {
                      select: {
                        questions: true,
                        children: true
                      }
                    }
                  }
                },
                _count: {
                  select: {
                    questions: true,
                    children: true
                  }
                }
              }
            },
            _count: {
              select: {
                questions: true,
                children: true
              }
            }
          }
        }
      }
    })

    if (!resource) {
      return { error: "Resource not found" }
    }

    return { resource: resource as ResourceWithContent }
  } catch (error) {
    console.error("Failed to fetch resource:", error)
    return { error: "Failed to fetch resource data" }
  }
}

/* export async function getResourceWithContent(resourceId: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: {
        id: resourceId,
      },
      include: {
        chapters: {
          orderBy: {
            number: "asc",
          },
          include: {
            topics: {
              include: {
                questions: {
                  where: {
                    status: "LIVE",
                  },
                  orderBy: {
                    questionNumber: "asc",
                  },
                  include: {
                    solutions: true,
                  },
                },
              },
            },
            questions: {
              where: {
                status: "LIVE",
              },
              orderBy: {
                questionNumber: "asc",
              },
              include: {
                solutions: true,
              },
            },
          },
        },
      },
    });

    return { resource };
  } catch (error) {
    console.error("Failed to fetch resource:", error);
    return { error: "Failed to fetch resource" };
  }
} */

export async function updateResourceStatus(
  resourceId: string,
  status: ResourceStatus
) {
  try {
    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: { status },
    });

    revalidatePath("/admin/resources");
    return { resource };
  } catch (error) {
    console.error("Failed to update resource status:", error);
    return { error: "Failed to update resource status" };
  }
}

export async function addResource(data: ResourceFormValues) {
  try {
    const { isAdmin, error } = await verifyAdmin();

    if (!isAdmin) {
      return { error: error || "Unauthorized - Admin access required" };
    }

    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        year: data.year,
        curriculum: data.curriculum,
        publisher: data.publisher,
        edition: data.edition,
        term: data.term,
        coverImage: data.coverImage,
      },
    });

    revalidatePath("/admin/resources");
    return { resource };
  } catch (error) {
     console.error("Failed to create resource:", error);
    return { error: "Failed to create resource" };
  }
}

export async function getSuggestedSubjects(
  query: string = ""
): Promise<SubjectsResponse> {
  try {
    const results =
      (await prisma.resource.findMany({
        where: query
          ? {
              subject: {
                contains: query,
                mode: "insensitive",
              },
            }
          : undefined,
        select: {
          subject: true,
        },
        distinct: ["subject"],
        orderBy: {
          subject: "asc",
        },
      })) || [];

    // Ensure we always return an array of strings
    const subjects = results.map((r) => r.subject).filter(Boolean);

    return {
      subjects,
    };
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return { subjects: [] };
  }
}

export async function updateResource(
  resourceId: string,
  data: ResourceFormValues
) {
  try {
    const { isAdmin, error } = await verifyAdmin();

    if (!isAdmin) {
      return { error: error || "Unauthorized - Admin access required" };
    }

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: data.title,
        type: data.type,
        subject: data.subject,
        grade: data.grade,
        year: data.year,
        curriculum: data.curriculum,
        publisher: data.publisher,
        edition: data.edition,
        term: data.term,
        coverImage: data.coverImage,
      },
    });

    revalidatePath("/admin/resources");
    return { resource };
  } catch (error) {
    console.error("Failed to update resource:", error);
    return { error: "Failed to update resource" };
  }
}

export async function deleteResource(resourceId: string) {
  try {
    const { isAdmin, error } = await verifyAdmin();

    if (!isAdmin) {
      return { error: error || "Unauthorized - Admin access required" };
    }

    await prisma.resource.delete({
      where: { id: resourceId },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete resource:", error);
    return { error: "Failed to delete resource" };
  }
}
