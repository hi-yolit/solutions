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
import { Chapter, ResourceType } from "@prisma/client"
import { useState } from "react"
import { deleteChapter } from "@/actions/chapters"
import { useToast } from "@/hooks/use-toast"
import { Pencil, Trash } from "lucide-react"

interface ChaptersTableProps {
  chapters: Chapter[]
  resourceId: string
  resourceType: ResourceType
  onEdit: (chapter: Chapter) => void
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
  const [chapterToDelete, setChapterToDelete] = useState<Chapter | null>(null)
  const isPastPaper = resourceType === 'PAST_PAPER'

  const handleManageClick = (chapterId: string) => {
    if (resourceType === 'PAST_PAPER') {
      router.push(`/admin/resources/${resourceId}/chapters/${chapterId}/questions`)
    } else {
      router.push(`/admin/resources/${resourceId}/chapters/${chapterId}`)
    }
  }

  const handleDelete = async () => {
    if (!chapterToDelete) return

    try {
      const result = await deleteChapter(chapterToDelete.id)
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
                        : "Manage Topics"}
                    </Button>
                    <Button
                      variant="outline"
                      aria-label="Edit Chapter"
                      size="icon"
                      onClick={() => onEdit(chapter)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      aria-label="Delete Chapter"
                      onClick={() => {
                        setChapterToDelete(chapter);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
              {resourceType !== "PAST_PAPER" && " and all its topics"}.
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