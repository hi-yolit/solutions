"use client";

import { ContentWithChildren } from "@/types/resource";
import { ResourceType } from "@prisma/client";
import { Book, FileQuestion, List } from "lucide-react";
import {
  Accordion,
  Text,
  Group,
  Grid,
  UnstyledButton,
  Avatar,
} from "@mantine/core";
import Link from "next/link";

// Types
interface ContentAccordionProps {
  content: ContentWithChildren;
  resourceId: string;
  resourceType: ResourceType;
  level: "CHAPTER" | "SECTION" | "PAGE";
}

// Utils
function getQuestionCount(content: ContentWithChildren): number {
  return content._count?.questions || 0;
}

// Components
function ContentIcon({ level }: { level: "CHAPTER" | "SECTION" | "PAGE" }) {
  if (level === "CHAPTER") return <Book size={20} />;
  if (level === "SECTION") return <List size={20} />;
  return <FileQuestion size={20} />;
}

function ContentItems({
  content,
  resourceId,
  resourceType,
  level,
}: Readonly<ContentAccordionProps>) {
  // Show child content items
  if (content.children && content.children.length > 0) {
    return (
      <Grid className="ml-8">
        {content.children.map((child) => (
          <Grid.Col key={child.id} span={12}>
            <Link href={`/admin/resources/${resourceId}/contents/${child.id}`}>
              <UnstyledButton className="w-full p-3 rounded hover:bg-gray-50 transition-colors">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {child.number && `${child.number}: `}{child.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {child._count?.questions || 0} questions
                  </Text>
                </Group>
              </UnstyledButton>
            </Link>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  // Show questions when there are no child content items
  if (content._count?.questions && content._count.questions > 0) {
    return (
      <Link href={`/admin/resources/${resourceId}/contents/${content.id}`} className="block">
        <UnstyledButton className="w-full p-3 rounded hover:bg-gray-50 transition-colors">
          <Text size="sm" fw={500}>
            View {content._count.questions} Questions
          </Text>
        </UnstyledButton>
      </Link>
    );
  }

  return (
    <Text ta="center" c="dimmed" py="md">
      No content or questions found
    </Text>
  );
}

export function ContentAccordion({
  content,
  resourceId,
  resourceType,
  level,
}: Readonly<ContentAccordionProps>) {
  const contentType = level === "CHAPTER" 
    ? "Chapter" 
    : level === "SECTION" 
      ? "Section" 
      : "Page";

  return (
    <Accordion.Item value={content.id} className="py-2">
      <Accordion.Control
        icon={
          <Avatar radius="xl" size="sm" color="blue">
            <ContentIcon level={level} />
          </Avatar>
        }
      >
        <Text size="md" fw={400}>
          {contentType} {content.number && `${content.number}:`} {content.title}
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        <ContentItems 
          content={content} 
          resourceId={resourceId} 
          resourceType={resourceType} 
          level={level} 
        />
      </Accordion.Panel>
    </Accordion.Item>
  );
}