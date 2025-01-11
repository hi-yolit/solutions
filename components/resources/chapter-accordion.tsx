// components/resources/chapter-accordion.tsx
'use client'

import { useState } from "react"
import { ChapterWithContent } from "@/types/resource"
import { ResourceType } from "@prisma/client"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"
import Link from "next/link"
import { QuestionStatus } from "@prisma/client"

interface ChapterAccordionProps {
  chapter: ChapterWithContent
  resourceType: ResourceType
}

export function ChapterAccordion({ chapter, resourceType }: ChapterAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const renderTextbookContent = () => (
    <div className="border-t divide-y">
      {chapter.topics?.map((topic) => (
        <div key={topic.id} className="p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{topic.title}</h3>
            </div>
            
            {/* Questions Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              {topic.questions
                .map((question) => (
                  <Link
                    key={question.id}
                    href={`/questions/${question.id}`}
                    className="text-primary hover:underline text-sm"
                  >
                    Exercise {question.questionNumber}
                  </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  const renderPastPaperContent = () => (
    <div className="border-t p-2 bg-green-600">
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        {chapter.questions
          .map((question) => (
            <Link
              key={question.id}
              href={`/questions/${question.id}`}
              className="text-primary hover:underline text-sm"
            >
              Question {question.questionNumber}
            </Link>
        ))}
      </div>
    </div>
  )

  console.log(chapter)
  return (
    <div className="border rounded-lg">
      <button 
        className="w-full px-2 py-4 text-left flex items-center justify-between hover:bg-accent transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-baseline gap-1">
          <span className="font-bold">
            {resourceType === ResourceType.TEXTBOOK ? 'Chapter' : 'Question'} {chapter.number}:
          </span>
          {chapter.title && (
            <>
              <span className="text-muted-foreground"></span>
              <span>{chapter.title}</span>
            </>
          )}
        </div>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        resourceType === ResourceType.TEXTBOOK 
          ? renderTextbookContent() 
          : renderPastPaperContent()
      )}
    </div>
  )
}