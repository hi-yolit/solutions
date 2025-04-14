// components/admin/resources/chapters-table.tsx
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
import { ContentType, ResourceType } from "@prisma/client"
import { useState } from "react"
import { deleteContent } from "@/actions/contents"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash } from "lucide-react"

// Define Content type that matches your Prisma schema
interface Content {
  id: string
  type: ContentType
  title: string
  number?: string | null
  resourceId: string
  parentId?: string | null
  order: number
  _count?: {
    questions: number;
    children: number;
  };
}

interface ChaptersTableProps {
  chapters: Content[] // Now using Content[] instead of Chapter[]
  resourceId: string
  resourceType: ResourceType
  onEdit: (chapter: Content) => void
}

export function ChaptersTable({ 
  chapters, 
  resourceId, 
  resourceType,
  onEdit 
}: Readonly<ChaptersTableProps>) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<Content | null>(null)
  const isPastPaper = resourceType === 'PAST_PAPER'

  const handleManageClick = (chapterId: string) => {
    router.push(`/admin/resources/${resourceId}/contents/${chapterId}`)
  }

  const handleDelete = async () => {
    if (!chapterToDelete) return

    try {
      const result = await deleteContent(chapterToDelete.id)
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
        description: resourceType === 'PAST_PAPER' 
          ? "Question deleted successfully" 
          : "Chapter deleted successfully"
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive"
      })
    } finally {
      setDeleteDialogOpen(false)
      setChapterToDelete(null)
    }
  }

  return (
    <div className="mb-24">
      <div className="border rounded-md mb-12">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                {resourceType === "PAST_PAPER" ? "Question" : "Chapter"}
              </TableHead>
              {!isPastPaper && <TableHead>Title</TableHead>}
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chapters.map((chapter) => (
              <TableRow key={chapter.id}>
                <TableCell>{chapter.number}</TableCell>
                {!isPastPaper && (
                  <TableCell className="font-medium">{chapter.title}</TableCell>
                )}
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageClick(chapter.id)}
                    >
                      {resourceType === "PAST_PAPER"
                        ? "Manage Questions"
                        : "Manage Sections"}
                    </Button>
                    <Button
                      variant="outline"
                      aria-label="Edit"
                      size="icon"
                      onClick={() => onEdit(chapter)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label="Delete"
                      onClick={() => {
                        setChapterToDelete(chapter);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {chapters.length === 0 && (
              <TableRow>
                <TableCell colSpan={!isPastPaper ? 3 : 2} className="text-center text-muted-foreground p-4">
                  No {resourceType === "PAST_PAPER" ? "questions" : "chapters"} found
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
              This action cannot be undone. This will permanently delete the
              {resourceType === "PAST_PAPER" ? " question" : " chapter"}
              {resourceType !== "PAST_PAPER" && " and all its sections"}.
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