// src/components/admin/resources/chapters-table.tsx
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
import { Chapter } from "@prisma/client"


interface ChaptersTableProps {
  chapters: Chapter[]
  resourceId: string
}

export function ChaptersTable({ chapters, resourceId }: ChaptersTableProps) {
  const router = useRouter()

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Chapter</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Topics</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {chapters.map((chapter) => (
            <TableRow key={chapter.id}>
              <TableCell>{chapter.number}</TableCell>
              <TableCell className="font-medium">{chapter.title}</TableCell>
              {/* <TableCell>{chapter.topicsCount} topics</TableCell> */}
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/resources/${resourceId}/chapters/${chapter.id}`)}
                  >
                    Manage Topics
                  </Button>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}