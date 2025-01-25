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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-variants";
import { RESOURCE_TYPES, ResourceTypeEnum } from "@/lib/constants";

interface SubjectResourcesProps {
  subjects: string[];
  resourcesBySubject: Record<string, Resource[]>;
}

const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: "Textbook",
  PAST_PAPER: "Past Paper",
  STUDY_GUIDE: "Study Guide",
};

// Dummy data simulating API response
export const dummyResources = [
  // Textbooks
  {
    type: ResourceTypeEnum.Textbook,
    title: "Mathematics Grade 12 CAPS",
    content:
      "Official CAPS-aligned textbook covering algebra, calculus, and analytical geometry. Includes practice exercises and exam preparation.",
    author: "Department of Basic Education",
    publisher: "Pearson South Africa",
  },
  {
    type: ResourceTypeEnum.Textbook,
    title: "Physical Sciences Grade 12",
    content:
      "Comprehensive guide for Physics and Chemistry with CAPS-aligned content. Includes practical experiments and problem sets.",
    author: "Dr. J. Bransby et al.",
    publisher: "Oxford University Press",
  },
  {
    type: ResourceTypeEnum.Textbook,
    title: "Via Afrika Life Sciences Grade 12",
    content:
      "Detailed coverage of DNA, genetics, and environmental studies. Aligned with CAPS requirements.",
    publisher: "Via Afrika",
  },

  // Past Papers
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2023 NSC Mathematics Paper 1",
    content:
      "National Senior Certificate examination paper with memorandum. Algebra and Calculus focus.",
    year: 2023,
    subject: "Mathematics",
    paperNumber: 1,
  },
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2022 Physical Sciences Paper 2 (Chemistry)",
    content:
      "Final exam paper covering chemical change, organic chemistry, and electrochemistry.",
    year: 2022,
    subject: "Physical Sciences",
    paperNumber: 2,
  },
  {
    type: ResourceTypeEnum.PastPaper,
    title: "2023 English HL Paper 3",
    content: "Home Language exam focusing on essay writing and comprehension.",
    year: 2023,
    subject: "English",
  },

  // Study Guides
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "The Answer Series: Accounting Grade 12",
    content:
      "Simplified study guide with worked examples and practice exams. CAPS-aligned.",
    subject: "Accounting",
    edition: "3rd",
    pages: 216,
  },
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "X-kit Achieve! Geography Grade 12",
    content:
      "Essential exam preparation guide covering climatology, geomorphology, and SA geography.",
    subject: "Geography",
    features: ["Exam tips", "Summaries", "Practice questions"],
  },
  {
    type: ResourceTypeEnum.StudyGuide,
    title: "Mind the Gap History Grade 12",
    content:
      "CAPS-aligned study guide focusing on Cold War, Civil Society protests, and SA heritage.",
    publisher: "Department of Basic Education",
    pages: 189,
  },
];

export function SubjectResources({
  subjects,
  resourcesBySubject,
}: Readonly<SubjectResourcesProps>) {
  const [activeSubject, setActiveSubject] = useState(subjects[0]);

  return (
    <>
      <Tabs defaultValue="Textbook" className="w-[400px]">
        <TabsList variant={"underline"} width={"full"}>
          {RESOURCE_TYPES.map((resource) => (
            <TabsTrigger key={resource} value={resource} variant={"underline"}>
              {resource}s
            </TabsTrigger>
          ))}
        </TabsList>

        {RESOURCE_TYPES.map((resourceType) => (
          <TabsContent key={resourceType} value={resourceType}>
            <div className="space-y-4">
              {dummyResources
                .filter((resource) => resource.type === resourceType)
                .map((resource, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <h3 className="font-bold mb-2">{resource.title}</h3>
                    <p className="text-sm">{resource.content}</p>
                    {resource.author && (
                      <p className="text-xs mt-2">Author: {resource.author}</p>
                    )}
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <hr />
      <div className="space-y-6 bg-green-700">
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
              href={`/subjects/${resource.subject?.toLowerCase()}/resources/${
                resource.id
              }`}
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
    </>
  );
}