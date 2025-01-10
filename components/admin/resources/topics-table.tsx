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
import { Badge } from "@/components/ui/badge"
import { Topic } from "@prisma/client"
import { useState } from "react"
import { toast } from "@/hooks/use-toast"
import { deleteTopic } from "@/actions/topics"
import { AlertDialogHeader, AlertDialogFooter, AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogAction, AlertDialogCancel, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface TopicWithMeta extends Topic {
  _count?: {
    questions: number;
  };
}

interface TopicsTableProps {
  topics: TopicWithMeta[]
  resourceId: string
  chapterId: string
  onEdit: (topic: Topic) => void
}

export function TopicsTable({ topics, resourceId, chapterId, onEdit  }: TopicsTableProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [topicToDelete, setTopicToDelete] = useState<Topic | null>(null)

  const handleDelete = async () => {
    if (!topicToDelete) return

    try {
      const result = await deleteTopic(topicToDelete.id)
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
        description: "Topic deleted successfully"
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
      setTopicToDelete(null)
    }
  }
  return (
    <>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell className="font-medium">
                  {topic.title || "Untitled Topic"}
                </TableCell>
                <TableCell>
                  {topic._count?.questions || 0} questions
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(
                        `/admin/resources/${resourceId}/chapters/${chapterId}/topics/${topic.id}`
                      )}
                    >
                      Manage Questions
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(topic)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setTopicToDelete(topic)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {topics.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground p-4"
                >
                  No topics found
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
              This action cannot be undone. This will permanently delete this topic
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}