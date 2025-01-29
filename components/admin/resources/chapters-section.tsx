'use client'

import { useState } from "react"
import { AddChapterDialog } from "./add-chapter-dialog"
import { ChaptersTable } from "./chapters-table"
import type { Chapter, ResourceType } from "@prisma/client"
import { FAB } from "@/components/ui/fab"

interface ChaptersSectionProps {
  chapters: Chapter[]
  resourceId: string
  resourceType: ResourceType
}

export function ChaptersSection({ chapters, resourceId, resourceType }: Readonly<ChaptersSectionProps>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | undefined>()

  const handleEdit = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setDialogOpen(true)
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
        totalChapters={chapters.length +1}
      />


      <FAB
        onClick={() => {
          setSelectedChapter(undefined)
          setDialogOpen(true)
        }}
        text={resourceType === 'PAST_PAPER' ? 'Add Question' : 'Add Chapter'}
      />
    </div>
  )
}