// app/resources/[resourceId]/page.tsx
import { getResourceWithContent } from '@/actions/resources'
import { Badge } from "@/components/ui/badge"
import { ChapterAccordion } from '@/components/resources/chapter-accordion'
import { Button } from "@mantine/core";
import { ResourceType } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-variants";

interface PageProps {
  params: {
    resourceId: string;
  };
}

export default async function ResourcePage({ params }: Readonly<PageProps>) {
  const { resource, error } = await getResourceWithContent(params.resourceId);


  if (error || !resource) {
    return <div>Failed to load resource</div>;
  }
  

  return (
    <div className="max-w-4xl mx-auto">
      <section className="py-2 px-3">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Link
            href={`/subjects/${resource.subject.toLowerCase()}`}
            className="hover:text-foreground"
          >
            {resource.subject}
          </Link>
          <span>/</span>
          <span>
            {resource.type === ResourceType.TEXTBOOK
              ? "Textbook solutions"
              : "Past Paper"}
          </span>
        </div>

        {/* Title Section */}
        <section>
          <div className="flex items-end gap-3 justify-between">
            <div>
              <div className="font-bold text-xs  text-purple-700 flex items-center gap-2">
                <p>{resource.type}</p>
                <p>•</p>
                <p>Gr{resource.grade}</p>
              </div>
              <h1 className="text-lg text-pretty font-bold mb-2">
                {resource.title}
              </h1>
            </div>

            <div className="relative w-[66px] h-[90px]">
              {" "}
              {/* 2:3 Aspect Ratio Container */}
              {resource.coverImage && (
                <Image
                  src={resource.coverImage}
                  alt="Book Cover"
                  fill // Automatically scales inside the div
                  className="object-cover rounded-sm" // Ensures it covers and has rounded corners
                  priority
                />
              )}
            </div>
          </div>

          {resource.type === ResourceType.TEXTBOOK ? (
            <div className="text-muted-foreground space-y-1">
              {resource.edition && <p>{resource.edition} Edition</p>}
              {resource.publisher && <p>ISBN: {resource.publisher}</p>}
            </div>
          ) : (
            <div className="text-muted-foreground">
              {resource.term && <p>Term {resource.term}</p>}
              {resource.year && <p>{resource.year}</p>}
            </div>
          )}
        </section>
      </section>

      {/* Content Tabs */}
      {/* <div className="mb-6 flex items-center gap-2 border-b">
        <div className="px-4 py-2 border-b-2 border-primary">
          {resource.type === ResourceType.TEXTBOOK
            ? "Textbook solutions"
            : "Questions"}
          <Badge variant="secondary" className="ml-2">
            Verified
          </Badge>
        </div>
      </div> */}

      <div className="my-4">
        <Tabs
          defaultValue={resource.chapters[0]?.title ?? ""}
          className="w-full"
        >
          <TabsList variant="underline" width="full" className="overflow-auto">
            {resource.chapters.map((chapter) => (
              <TabsTrigger
                key={chapter.id}
                value={chapter.title ?? ""}
                variant="underline"
              >
                {resource.type === ResourceType.TEXTBOOK ? "Ch" : "Question"}
                {chapter.number}: {chapter.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {resource.chapters.map((chapter) => (
            <TabsContent key={chapter.id} value={chapter.title ?? ""}>
              <div className="grid gap-6">
                {chapter.topics.map((topic) => (
                  <div key={topic.id}>
                    <h3 className="font-bold">{topic.title}</h3>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Chapters List */}
      {/* <div className="space-y-1">
        {resource.chapters.map((chapter) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            resourceType={resource.type}
          />
        ))}
      </div> */}
    </div>
  );
}