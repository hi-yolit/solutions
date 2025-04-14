// components/admin/resources/content-table.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { ContentType, ResourceType } from "@prisma/client"
import { useState, useEffect } from "react"
import { deleteContent } from "@/actions/contents"
import { useToast } from "@/hooks/use-toast"
import { Book, ChevronDown, ChevronRight, Pencil, Plus, Trash } from "lucide-react"
import React from "react"

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
  chapterId?: string | null;
}

interface ContentTableProps {
  contents: Content[]
  resourceId: string
  resourceType: ResourceType
  onEdit: (content: Content) => void
  onAddChild: (parentId: string, contentType: ContentType) => void
}

export function ContentTable({ 
  contents, 
  resourceId, 
  resourceType,
  onEdit,
  onAddChild
}: Readonly<ContentTableProps>) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null)
  const isPastPaper = resourceType === 'PAST_PAPER'
  
  // Track expanded sections and their children
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [sectionPages, setSectionPages] = useState<Record<string, Content[]>>({})
  const [loadingSections, setLoadingSections] = useState<Record<string, boolean>>({})

  // Get appropriate content type label
  const getContentTypeLabel = (type: ContentType) => {
    if (isPastPaper) {
      switch (type) {
        case 'CHAPTER': return 'Section'
        case 'SECTION': return 'Question'
        case 'PAGE': return 'Sub-question'
        case 'EXERCISE': return 'Exercise'
        default: return 'Item'
      }
    } else {
      switch (type) {
        case 'CHAPTER': return 'Chapter'
        case 'SECTION': return 'Section'
        case 'PAGE': return 'Page'
        case 'EXERCISE': return 'Exercise'
        default: return 'Item'
      }
    }
  }

  // Get content type badge color
  const getContentTypeBadgeVariant = (type: ContentType) => {
    switch (type) {
      case 'CHAPTER': return 'default'
      case 'SECTION': return 'secondary'
      case 'PAGE': return 'outline'
      case 'EXERCISE': return 'destructive'
      default: return 'default'
    }
  }

  // Fetch pages for a section
const fetchSectionPages = async (sectionId: string) => {
  setLoadingSections(prev => ({ ...prev, [sectionId]: true }));
  console.log(`Fetching pages for section ${sectionId}`);
  
  try {
    const response = await fetch(`/api/contents/${sectionId}/children`);
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch section pages: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Received data:', data);
    
    if (data.children) {
      // Sort pages by their order
      const sortedPages = data.children
        .filter((page: Content) => page.type === 'PAGE')
        .sort((a: Content, b: Content) => a.order - b.order);
        
      console.log(`Found ${sortedPages.length} pages for section ${sectionId}`);
      setSectionPages(prev => ({ ...prev, [sectionId]: sortedPages }));
    } else {
      console.log('No children property in API response');
    }
  } catch (error) {
    console.error('Error fetching section pages:', error);
    toast({
      title: "Error",
      description: "Failed to load pages",
      variant: "destructive"
    });
  } finally {
    setLoadingSections(prev => ({ ...prev, [sectionId]: false }));
  }
};

  // Toggle section expansion
  const toggleSection = async (sectionId: string) => {
    const isCurrentlyExpanded = expandedSections[sectionId];
    
    // Toggle the expanded state
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
    
    // If expanding and we don't have the pages yet, fetch them
    if (!isCurrentlyExpanded && !sectionPages[sectionId]) {
      await fetchSectionPages(sectionId);
    }
  };

  const handleManageClick = (contentId: string, parentId?: string | null) => {
    router.push(`/admin/resources/${resourceId}/contents/${contentId}/questions?parentId=${parentId}`)
  }

  const handleDelete = async () => {
    if (!contentToDelete) return

    try {
      const result = await deleteContent(contentToDelete.id)
      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Success",
        description: `${getContentTypeLabel(contentToDelete.type)} deleted successfully`
      })
      
      // Remove deleted section from state
      if (contentToDelete.type === 'SECTION') {
        setExpandedSections(prev => {
          const newState = { ...prev };
          delete newState[contentToDelete.id];
          return newState;
        });
        
        setSectionPages(prev => {
          const newState = { ...prev };
          delete newState[contentToDelete.id];
          return newState;
        });
      }
      
      // If a page was deleted, refresh the parent section's pages
      if (contentToDelete.type === 'PAGE' && contentToDelete.parentId) {
        await fetchSectionPages(contentToDelete.parentId);
      }
      
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setContentToDelete(null)
    }
  }

  // Refresh section pages when contents change
  useEffect(() => {
    // Re-fetch pages for any expanded sections
    Object.entries(expandedSections).forEach(([sectionId, isExpanded]) => {
      if (isExpanded) {
        fetchSectionPages(sectionId);
      }
    });
  }, [contents]);

  return (
    <div className="mb-24">
      <div className="border rounded-md mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Content</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.map((content) => (
              <React.Fragment key={content.id}>
                {/* Main content row */}
                <TableRow>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      {content.type === 'SECTION' && (
                        <button 
                          onClick={() => toggleSection(content.id)}
                          className="mr-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {expandedSections[content.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      {content.number ? `${content.number}: ` : ''}{content.title || 'Untitled'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getContentTypeBadgeVariant(content.type)}>
                      {getContentTypeLabel(content.type)}
                    </Badge>
                    {content.pageNumber && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        Page {content.pageNumber}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {content.type !== 'EXERCISE' && (
                      <>
                        {content._count?.children || 0} items / 
                        {content._count?.questions || 0} questions
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      {content.type === 'SECTION' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddChild(content.id, ContentType.PAGE)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Page
                        </Button>
                      )}
                      
                      {content.type !== 'SECTION' && content.type !== 'EXERCISE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageClick(content.id, content.parentId)}
                        >
                          <Book className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        aria-label={`Edit ${getContentTypeLabel(content.type)}`}
                        size="icon"
                        onClick={() => onEdit(content)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label={`Delete ${getContentTypeLabel(content.type)}`}
                        onClick={() => {
                          setContentToDelete(content);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                
                {/* Show loading indicator for section */}
                {content.type === 'SECTION' && expandedSections[content.id] && loadingSections[content.id] && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-2 text-center">
                      <div className="inline-flex items-center">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span className="ml-2">Loading pages...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                
                {/* Show pages for expanded section */}
                {content.type === 'SECTION' && 
                  expandedSections[content.id] && 
                  !loadingSections[content.id] && 
                  sectionPages[content.id]?.map(page => (
                    <TableRow key={page.id} className="bg-muted/30">
                      <TableCell className="font-medium">
                        <div className="flex items-center pl-8">
                          {page.number ? `${page.number}: ` : ''}{page.title || 'Untitled'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getContentTypeLabel(page.type)}
                        </Badge>
                        {page.pageNumber && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            Page {page.pageNumber}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {page._count?.children || 0} exercises
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageClick(page.id, page.chapterId)}
                          >
                            <Book className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                          
                          <Button
                            variant="outline"
                            aria-label="Edit Page"
                            size="icon"
                            onClick={() => onEdit(page)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            aria-label="Delete Page"
                            onClick={() => {
                              setContentToDelete(page);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                }
                
                {/* Show "no pages" message for empty expanded section */}
                {content.type === 'SECTION' && 
                  expandedSections[content.id] && 
                  !loadingSections[content.id] && 
                  (!sectionPages[content.id] || sectionPages[content.id].length === 0) && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={4} className="py-2 text-center">
                        <span className="text-sm text-muted-foreground">No pages found</span>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => onAddChild(content.id, ContentType.PAGE)}
                          className="ml-2"
                        >
                          Add Page
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                }
              </React.Fragment>
            ))}
            
            {contents.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground p-4">
                  No content items found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this {contentToDelete ? getContentTypeLabel(contentToDelete.type).toLowerCase() : 'item'}
              and all its children.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}