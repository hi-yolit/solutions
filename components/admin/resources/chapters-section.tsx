'use client'

import { useState } from "react"
import { ChaptersTable } from "./chapters-table"
import { AddChapterDialog } from "./add-chapter-dialog"
import { ResourceType, ContentType } from "@prisma/client"
import { FAB } from "@/components/ui/fab"

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

interface ChaptersSectionProps {
  chapters: Content[] // Now using Content[] instead of Chapter[]
  resourceId: string
  resourceType: ResourceType
}

export function ChaptersSection({ 
  chapters, 
  resourceId, 
  resourceType
}: Readonly<ChaptersSectionProps>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Content | undefined>()

  const handleEdit = (chapter: Content) => {
    setSelectedChapter(chapter)
    setDialogOpen(true)
  }

  // Get appropriate button text based on resource type
  const getAddButtonText = () => {
    return resourceType === 'PAST_PAPER' ? 'Add Question' : 'Add Chapter'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">
          {resourceType === 'PAST_PAPER' ? 'Questions' : 'Chapters'}
        </h3>
      </div>

      <ChaptersTable
        chapters={chapters}
        resourceId={resourceId}
        resourceType={resourceType}
        onEdit={handleEdit}
      />

      <AddChapterDialog
        resourceId={resourceId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resourceType={resourceType}
        chapter={selectedChapter}
        totalChapters={chapters.length}
      />

      <FAB
        onClick={() => {
          setSelectedChapter(undefined)
          setDialogOpen(true)
        }}
        text={getAddButtonText()}
      />
    </div>
  )
}