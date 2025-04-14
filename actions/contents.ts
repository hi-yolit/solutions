'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { verifyAdmin } from '@/actions/user'
import { z } from 'zod'
import { Content, ContentType } from '@prisma/client'

// Schema for content operations
const contentFormSchema = z.object({
  number: z.string().optional().nullable(),
  title: z.string().min(1, "Title is required"),
  order: z.number().int().optional(),
  type: z.enum(['CHAPTER', 'SECTION', 'PAGE', 'EXERCISE']),
  parentId: z.string().uuid().optional().nullable(),
  pageNumber: z.number().int().positive().optional().nullable(),
  description: z.string().optional().nullable(),
});

type ContentFormValues = z.infer<typeof contentFormSchema>;

export async function getResourceWithContents(resourceId: string) {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        contents: {
          include: {
            _count: {
              select: {
                children: true,
                questions: true
              }
            }
          }
        }
      }
    })

    if (!resource) {
      return { error: "Resource not found" }
    }

    return { resource }
  } catch (error) {
    console.error('Failed to fetch resource with contents:', error)
    return { error: 'Failed to fetch resource' }
  }
}

export async function getContentWithChildren(contentId: string) {
  try {
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    })

    if (!content) {
      return { error: "Content not found" }
    }

    const resource = await prisma.resource.findUnique({
      where: { id: content.resourceId }
    })

    if (!resource) {
      return { error: "Resource not found" }
    }

    const children = await prisma.content.findMany({
      where: { parentId: contentId },
      include: {
        _count: {
          select: {
            children: true,
            questions: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    return { content, children, resource }
  } catch (error) {
    console.error('Failed to fetch content with children:', error)
    return { error: 'Failed to fetch content' }
  }
}

export async function getContentBreadcrumb(contentId: string) {
  try {
    const breadcrumb: Content[] = [];
    
    // Find the initial content
    let currentContent = await prisma.content.findUnique({
      where: { id: contentId }
    });
    
    if (!currentContent) {
      return { error: "Content not found" };
    }
    
    // Add current content to breadcrumb
    breadcrumb.unshift(currentContent);
    
    // Find all parents up to the root
    while (currentContent && currentContent.parentId) {
      // Type assertion for parentId to ensure TS knows it's not null
      const parentId = currentContent.parentId;
      
      const parent = await prisma.content.findUnique({
        where: { id: parentId }
      });
      
      if (!parent) break;
      
      breadcrumb.unshift(parent);
      // Explicit assignment with proper typing
      currentContent = parent as Content;
    }
    
    return { breadcrumb };
  } catch (error) {
    console.error('Failed to fetch content breadcrumb:', error)
    return { error: 'Failed to fetch breadcrumb' }
  }
}

export async function addContent(resourceId: string, data: ContentFormValues) {
  try {
    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }
    
    // Find resource to make sure it exists
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId }
    })
    
    if (!resource) {
      return { error: "Resource not found" }
    }
    
    // Set default order if not provided
    const order = data.order ?? 0
    
    const content = await prisma.content.create({
      data: {
        resourceId,
        type: data.type as ContentType,
        title: data.title,
        number: data.number,
        parentId: data.parentId,
        order,
        pageNumber: data.pageNumber,
        description: data.description
      }
    })

    // Revalidate paths that could be affected
    revalidatePath(`/admin/resources/${resourceId}`)
    if (data.parentId) {
      revalidatePath(`/admin/resources/${resourceId}/contents/${data.parentId}`)
    }
    
    return { content }
  } catch (error) {
    console.error('Failed to create content:', error)
    return { error: 'Failed to create content' }
  }
}

export async function updateContent(contentId: string, data: Partial<ContentFormValues>) {
  try {
    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }
    
    // Find content to get resourceId and parentId for path revalidation
    const existingContent = await prisma.content.findUnique({
      where: { id: contentId }
    })
    
    if (!existingContent) {
      return { error: "Content not found" }
    }

    const updateData = {
      title: data.title,
      number: data.number,
      type: data.type as ContentType | undefined,
      parentId: data.parentId !== undefined ? data.parentId : existingContent.parentId,
      order: data.order,
      pageNumber: data.pageNumber,
      description: data.description
    };

    const content = await prisma.content.update({
      where: { id: contentId },
      data: updateData
    });
    
    // Revalidate paths that could be affected
    revalidatePath(`/admin/resources/${existingContent.resourceId}`)
    if (existingContent.parentId) {
      revalidatePath(`/admin/resources/${existingContent.resourceId}/contents/${existingContent.parentId}`)
    }
    if (data.parentId && data.parentId !== existingContent.parentId) {
      revalidatePath(`/admin/resources/${existingContent.resourceId}/contents/${data.parentId}`)
    }
    
    return { content }
  } catch (error) {
    console.error('Failed to update content:', error)
    return { error: 'Failed to update content' }
  }
}

export async function deleteContent(contentId: string) {
  try {
    const { isAdmin, error } = await verifyAdmin()

    if (!isAdmin) {
      return { error: error || 'Unauthorized - Admin access required' }
    }
    
    // Find content to get resourceId and parentId for path revalidation
    const content = await prisma.content.findUnique({
      where: { id: contentId }
    })
    
    if (!content) {
      return { error: "Content not found" }
    }
    
    // Recursively delete all children
    await deleteChildrenRecursive(contentId)
    
    // Delete the content itself
    await prisma.content.delete({
      where: { id: contentId }
    })
    
    // Revalidate paths that could be affected
    revalidatePath(`/admin/resources/${content.resourceId}`)
    if (content.parentId) {
      revalidatePath(`/admin/resources/${content.resourceId}/contents/${content.parentId}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to delete content:', error)
    return { error: 'Failed to delete content' }
  }
}

// Helper function to recursively delete content children
async function deleteChildrenRecursive(contentId: string) {
  // Find all children
  const children = await prisma.content.findMany({
    where: { parentId: contentId }
  })
  
  // Recursively delete each child's children
  for (const child of children) {
    await deleteChildrenRecursive(child.id)
  }
  
  // Delete all children of this content
  if (children.length > 0) {
    await prisma.content.deleteMany({
      where: { parentId: contentId }
    })
  }
}

