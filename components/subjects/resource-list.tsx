// components/subjects/resource-list.tsx
import { Resource, ResourceType } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Book, BookOpen, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs-variants";

// Mapping resource types to labels
const resourceTypeLabels: Record<ResourceType, string> = {
  TEXTBOOK: "Textbook",
  PAST_PAPER: "Past Paper",
  STUDY_GUIDE: "Study Guide",
};

interface ResourceListProps {
  resources?: Resource[];
}

const ResourceCard = ({ resource }: { resource: Resource }) => {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block"
    >
      <Card className="p-4 hover:shadow-md transition-shadow h-full">
        <div className="flex flex-col sm:flex-row gap-4">
          <ResourceCoverImage resource={resource} />
          <div className="flex-1">
            <h3 className="font-semibold text-lg sm:text-xl mb-1">
              {resource.title}
            </h3>
            <ResourceDetails resource={resource} />
            <ResourceTags resource={resource} />
            <ResourceAction resource={resource} />
          </div>
        </div>
      </Card>
    </Link>
  );
};

const ResourceCoverImage = ({ resource }: { resource: Resource }) =>
  resource.coverImage ? (
    <div className="w-full sm:w-32 h-40 bg-muted relative">
      <Image
        src={resource.coverImage}
        alt={resource.title}
        fill
        className="object-contain"
      />
    </div>
  ) : (
    <div className="w-full sm:w-32 h-40 bg-muted flex items-center justify-center">
      {resource.type === "TEXTBOOK" ? (
        <Book className="h-8 w-8 text-muted-foreground" />
      ) : resource.type === "PAST_PAPER" ? (
        <FileText className="h-8 w-8 text-muted-foreground" />
      ) : (
        <BookOpen className="h-8 w-8 text-muted-foreground" />
      )}
    </div>
  );

const ResourceDetails = ({ resource }: { resource: Resource }) => (
  <p className="text-sm sm:text-base text-muted-foreground mb-2">
    {resourceTypeLabels[resource.type]}
    {resource.edition && <> • Edition: {resource.edition}</>}
    {resource.publisher && <> • Publisher: {resource.publisher}</>}
    {resource.year && (
      <>
        {" "}
        • Year: {resource.year} {resource.term && `• Term ${resource.term}`}
      </>
    )}
  </p>
);

const ResourceTags = ({ resource }: { resource: Resource }) => (
  <div className="flex flex-wrap gap-2 mb-4">
    <Badge>{resource.curriculum}</Badge>
    <Badge variant="outline">Grade {resource.grade}</Badge>
  </div>
);

const ResourceAction = ({ resource }: { resource: Resource }) => (
  <div className="flex items-center text-primary">
    <BookOpen className="h-4 w-4 mr-2" />
    <span className="text-sm">
      {resource.type === "TEXTBOOK" ? "View Chapters" : "View Questions"}
    </span>
  </div>
);

export async function ResourceList({
  resources = [],
}: Readonly<ResourceListProps>) {
  const resourceByType = resources.reduce<Record<ResourceType, Resource[]>>(
    (acc, resource) => {
      acc[resource.type] = acc[resource.type] || [];
      acc[resource.type].push(resource);
      return acc;
    },
    { PAST_PAPER: [], TEXTBOOK: [], STUDY_GUIDE: [] }
  );

  if (!resources.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No resources found
      </div>
    );
  }

  return (
    <div className="my-12">
      <Tabs defaultValue={resourceTypeLabels.TEXTBOOK} className="w-full">
        <TabsList variant="underline" width="full" className="overflow-auto">
          {Object.entries(resourceTypeLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={label} variant="underline">
              {label}s
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(resourceTypeLabels).map(([key, label]) => (
          <TabsContent key={key} value={label}>
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-4">
              {resourceByType[key as ResourceType]?.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
