'use client'

import { useState, useEffect } from "react"
import { ContentTable } from "./content-table"
import { AddContentDialog } from "./add-content-dialog"
import { ResourceType, ContentType } from "@prisma/client"
import { FAB } from "@/components/ui/fab"

// Define a Content type that matches your Prisma schema
interface Content {
  id: string
  type: ContentType
  title: string
  number?: string | null
  resourceId: string
  parentId?: string | null
  order: number
  pageNumber?: number | null
  _count?: {
    questions: number;
    children: number;
  };
}

interface ContentSectionProps {
  contents: Content[]
  resourceId: string
  resourceType: ResourceType
  contentTypeOptions: ContentType[] // Multiple content type options
  parentId?: string
  title?: string
}

export function ContentSection({ 
  contents, 
  resourceId, 
  resourceType, 
  contentTypeOptions,
  parentId,
  title = "Content"
}: Readonly<ContentSectionProps>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | undefined>()
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(parentId)
  const [selectedContentType, setSelectedContentType] = useState<ContentType>(
    contentTypeOptions[0] || ContentType.SECTION
  )
  // New state to track child counts by parent
  const [childOrderCounts, setChildOrderCounts] = useState<Record<string, number>>({})
  
  const handleEdit = (content: Content) => {
    setSelectedContent(content)
    setSelectedParentId(parentId)
    setSelectedContentType(content.type)
    setDialogOpen(true)
  }
  
  // Get the next order value for a specific parent
  const getNextOrderForParent = async (parentId: string) => {
    try {
      // Fetch children of this parent to determine next order
      const response = await fetch(`/api/contents/${parentId}/children`);
      if (!response.ok) {
        throw new Error('Failed to fetch children');
      }
      
      const data = await response.json();
      if (data.children && Array.isArray(data.children)) {
        // Find highest order value and add 1
        const maxOrder = data.children.reduce(
          (max: number, child: Content) => Math.max(max, child.order || 0), 
          0
        );
        return maxOrder + 1;
      }
      
      return 1; // Default to 1 if no children exist
    } catch (error) {
      console.error('Error getting next order:', error);
      return contents.length + 1; // Fallback
    }
  };
  
  const handleAddChild = async (parentId: string, contentType: ContentType) => {
    // Get the next order specifically for this parent
    const nextOrder = await getNextOrderForParent(parentId);
    
    setSelectedContent(undefined)
    setSelectedParentId(parentId)
    setSelectedContentType(contentType)
    // Store the next order in state for the dialog to use
    setChildOrderCounts(prev => ({
      ...prev,
      [parentId]: nextOrder
    }))
    setDialogOpen(true)
  }

  // Get appropriate button text
  const getAddButtonText = () => {
    if (contentTypeOptions.length > 1) {
      return 'Add Content';
    }
    
    const type = contentTypeOptions[0];
    if (resourceType === 'PAST_PAPER') {
      switch (type) {
        case 'CHAPTER': return 'Add Section'
        case 'SECTION': return 'Add Question'
        case 'PAGE': return 'Add Sub-question'
        case 'EXERCISE': return 'Add Exercise'
        default: return 'Add Item'
      }
    } else {
      switch (type) {
        case 'CHAPTER': return 'Add Chapter'
        case 'SECTION': return 'Add Section'
        case 'PAGE': return 'Add Page'
        case 'EXERCISE': return 'Add Exercise'
        default: return 'Add Item'
      }
    }
  }

  // Initialize the root order count
  useEffect(() => {
    if (parentId) {
      setChildOrderCounts(prev => ({
        ...prev,
        [parentId]: contents.length + 1
      }));
    }
  }, [contents, parentId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {title}
        </h3>
      </div>

      <ContentTable
        contents={contents}
        resourceId={resourceId}
        resourceType={resourceType}
        onEdit={handleEdit}
        onAddChild={handleAddChild}
      />

      <AddContentDialog
        resourceId={resourceId}
        parentId={selectedParentId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resourceType={resourceType}
        contentTypeOptions={selectedContent ? [selectedContent.type] : 
                            selectedParentId !== parentId ? [selectedContentType] : 
                            contentTypeOptions}
        defaultContentType={selectedContent?.type ?? selectedContentType}
        content={selectedContent}
        // Use the parent-specific order count if available
        totalItems={selectedParentId && childOrderCounts[selectedParentId] 
                    ? childOrderCounts[selectedParentId] - 1 
                    : contents.length}
      />

      <FAB
        onClick={async () => {
          const nextOrder = parentId 
            ? await getNextOrderForParent(parentId)
            : contents.length + 1;
            
          setSelectedContent(undefined)
          setSelectedParentId(parentId)
          setSelectedContentType(contentTypeOptions[0])
          setChildOrderCounts(prev => ({
            ...prev,
            [parentId || 'root']: nextOrder
          }))
          setDialogOpen(true)
        }}
        text={getAddButtonText()}
      />
    </div>
  )
}