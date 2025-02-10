// components/subjects/resource-list.tsx
import { Resource, ResourceType } from "@prisma/client";
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
import {
  groupResourceByType,
  groupResourcesBySubject,
  resourceTypeLabels,
} from "@/features/resources/utils/resources.utils";
import { subjectEmojis } from "@/lib/constants";

interface ResourceListProps {
  resources?: Resource[];
}

interface SubjectResourceListProps {
  subject: string;
  subjectResources: Resource[];
}

const ResourceCardComponent = ({ resource }: { resource: Resource }) => {
  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block w-44 h-64 p-2 hover:shadow-md transition-shadow flex flex-col"
    >
      {/* Adjusted width and height for a more book-like appearance */}
      <ResourceCoverImage resource={resource} />
      <div className="p-2 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm truncate overflow-hidden whitespace-nowrap">
            {resource.title}
          </h3>
        </div>
        <ResourceTags resource={resource} />
      </div>
    </Link>
  );
};

const ResourceCoverImage = ({ resource }: { resource: Resource }) => {
  const getPlaceholderIcon = () => {
    if (resource.type === "TEXTBOOK") {
      return <Book className="h-8 w-8 text-muted-foreground" />;
    } else if (resource.type === "PAST_PAPER") {
      return <FileText className="h-8 w-8 text-muted-foreground" />;
    } else {
      return <BookOpen className="h-8 w-8 text-muted-foreground" />;
    }
  };

  // A4 aspect ratio is approximately 1:1.414
  const a4Height = 176 * 1.414; // width (176px) * aspect ratio

  return resource.coverImage ? (
    <div
      className="w-full relative"
      style={{ height: `${a4Height}px` }} // Set A4 height
    >
      {/* Increased height for cover image */}
      <Image
        src={resource.coverImage}
        alt={resource.title}
        fill
        className="object-contain" // Changed to object-contain
      />
    </div>
  ) : (
    <div
      className="w-full bg-muted flex items-center justify-center"
      style={{ height: `${a4Height}px` }} // Set A4 height
    >
      {getPlaceholderIcon()}
    </div>
  );
};

const ResourceTags = ({ resource }: { resource: Resource }) => (
  <div className="flex flex-wrap gap-1 text-xs">
    <Badge>{resource.curriculum}</Badge>
    <Badge variant="outline">Grade {resource.grade}</Badge>
  </div>
);

const SubjectResourceList: React.FC<SubjectResourceListProps> = ({
  subject,
  subjectResources,
}) => {
  const subjectEmoji = subjectEmojis[subject] || "📚";
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg flex items-center">
          {subjectEmoji} {subject}
        </h4>
        <Link
          href={`/subjects/${subject}`}
          className="text-sm text-blue-500 hover:underline"
        >
          View All
        </Link>
      </div>
      <div
        className="flex gap-3 py-4 overflow-x-auto"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {subjectResources.map((resource) => (
          <div
            key={resource.id}
            style={{ scrollSnapAlign: "start" }}
            className="w-44 shrink-0" // Adjust width as needed
          >
            <ResourceCardComponent resource={resource} />
          </div>
        ))}
      </div>
    </div>
  );
};

export async function ResourceList({
  resources = [],
}: Readonly<ResourceListProps>) {
  const resourceByType = groupResourceByType(resources);

  if (!resources.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No resources found
      </div>
    );
  }

  return (
    <div className="py-3">
      <Tabs defaultValue={resourceTypeLabels.TEXTBOOK} className="w-full">
        <TabsList variant="underline" width="full" className="overflow-auto">
          {Object.entries(resourceTypeLabels).map(([key, label]) => (
            <TabsTrigger key={key} value={label} variant="underline">
              {label}s
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(resourceTypeLabels).map(([key, label]) => {
          const resourceType = key as ResourceType;
          const resourcesForType = resourceByType[resourceType] || [];
          const resourcesBySubject = groupResourcesBySubject(resourcesForType);

          return (
            <TabsContent key={key} value={label}>
              {Object.entries(resourcesBySubject).map(
                ([subject, subjectResources]) => (
                  <SubjectResourceList
                    key={subject}
                    subject={subject}
                    subjectResources={subjectResources}
                  />
                )
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
