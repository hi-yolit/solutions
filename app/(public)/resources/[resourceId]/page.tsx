// app/resources/[resourceId]/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { getResourceWithContent } from "@/actions/resources";
import { MobileContentNavigation } from "@/components/resources/content-navigation";
import {ResourceType } from "@/types/resource";
import { ContentType } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";


interface PageProps {
  params: Promise<{ resourceId: string }>;
}

export default function ResourcePage({ params }: Readonly<PageProps>) {
  const resolvedParams = use(params);
  const resourceId = resolvedParams.resourceId;
  const [resource, setResource] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const result = await getResourceWithContent(resourceId);
        
        if (result.error) {
          setError(result.error);
        } else if (result.resource) {
          setResource(result.resource);
        }
      } catch (err) {
        setError("Failed to load resource");
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [resourceId]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error || !resource) {
    return <div className="p-6 text-center">Failed to load resource: {error}</div>;
  }

  // Get the top-level content (chapters)
  console.log(resource)
  const topLevelContents = resource.contents.filter(
    (content: any) => content.type === ContentType.CHAPTER
  );

  console.log(topLevelContents)

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      <section className="px-0 py-3">
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
            {resource.type === "TEXTBOOK"
              ? "Textbook solutions"
              : "Past Paper"}
          </span>
        </div>

        {/* Title Section */}
        <section>
          <div className="flex items-center gap-3 justify-between">
            <div>
              <div className="font-bold text-xs text-purple-700 flex items-center gap-2">
                <p>{resource.type}</p>
                <p>•</p>
                <p>Gr{resource.grade}</p>
              </div>
              <h1 className="text-lg text-pretty font-bold">
                {resource.title}
              </h1>

              {resource.type === "TEXTBOOK" ? (
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
            </div>

            <div className="relative w-[66px] h-[90px]">
              {resource.coverImage && (
                <Image
                  src={resource.coverImage}
                  alt="Book Cover"
                  fill
                  className="object-cover rounded-sm"
                  priority
                />
              )}
            </div>
          </div>
        </section>
      </section>

      {/* Content Navigation */}
      <MobileContentNavigation
        contents={topLevelContents}
        resourceId={resource.id}
        resourceType={resource.type as ResourceType}
        resourceTitle={resource.title}
      />
    </div>
  );
}