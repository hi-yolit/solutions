// components/subject-resources.tsx
'use client'

import { useState } from 'react'
import { Resource, ResourceType } from '@prisma/client'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Book, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'


interface SubjectResourcesProps {
  subjects: string[];
  resourcesBySubject: Record<string, Resource[]>;
}

const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: "Textbook",
  PAST_PAPER: "Past Paper",
  STUDY_GUIDE: "Study Guide",
};


export function SubjectResources({
  subjects,
  resourcesBySubject,
}: Readonly<SubjectResourcesProps>) {
  const [activeSubject, setActiveSubject] = useState(subjects[0]);

  return (
    <div className="space-y-6">
      <div className="flex gap-6 mb-8 border-b pb-4 overflow-x-auto">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`text-sm hover:text-primary transition-colors whitespace-nowrap
              ${
                subject === activeSubject
                  ? "text-primary border-b-2 border-primary pb-4 -mb-4"
                  : "text-muted-foreground"
              }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {resourcesBySubject[activeSubject]?.map((resource) => (
          <Link
            href={`/resources/${resource.id}`}
            key={resource.id}
            className="block"
          >
            <Card className="p-4 hover:shadow-md transition-shadow h-full">
              <div className="flex gap-4">
                {resource.coverImage ? (
                  <div className="flex-shrink-0 w-32 h-40 bg-muted relative">
                    <Image
                      src={resource.coverImage}
                      alt={resource.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-32 h-40 bg-muted flex items-center justify-center">
                    {resource.type === ResourceType.TEXTBOOK ? (
                      <Book className="h-8 w-8 text-muted-foreground" />
                    ) : resource.type === ResourceType.PAST_PAPER ? (
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {resourceTypeLabels[resource.type]}
                    {resource.type === ResourceType.TEXTBOOK &&
                      resource.edition && <> • Edition: {resource.edition}</>}
                    {resource.type === ResourceType.TEXTBOOK &&
                      resource.publisher && (
                        <> • Publisher: {resource.publisher}</>
                      )}
                    {(resource.type === ResourceType.PAST_PAPER ||
                      resource.type === ResourceType.STUDY_GUIDE) &&
                      resource.year && (
                        <>
                          {" "}
                          • Year: {resource.year}{" "}
                          {resource.term && ` • Term ${resource.term}`}
                        </>
                      )}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge>{resource.curriculum}</Badge>
                    <Badge variant="outline">Grade {resource.grade}</Badge>
                  </div>
                  <div className="flex items-center text-primary">
                    {resource.type === ResourceType.TEXTBOOK ? (
                      <>
                        <BookOpen className="h-4 w4 mr-2" />
                        <span className="text-sm">View Chapters</span>
                      </>
                    ) : (
                      <>
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="text-sm">View Questions</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link href={`/subjects/${activeSubject?.toLowerCase()}`}>
          <Button variant="outline" className="w-full">
            View all in {activeSubject}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}