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

interface TopicWithMeta extends Topic {
  _count?: {
    questions: number;
  };
}

interface TopicsTableProps {
  topics: TopicWithMeta[]
  resourceId: string
  chapterId: string
}

export function TopicsTable({ topics, resourceId, chapterId }: TopicsTableProps) {
  const router = useRouter()

  return (
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
                  >
                    Edit
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
  )
}