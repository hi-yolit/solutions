"use client";

import { ContentWithChildren, ResourceType, QuestionWithSolutions } from "@/types/resource";
import { useState, useEffect } from "react";
import { Book, FileQuestion, ArrowLeft, X, List, Loader2 } from "lucide-react";
import { Text, Group, UnstyledButton, Avatar, Drawer, Button, Loader } from "@mantine/core";
import Link from "next/link";
import { ContentType } from "@prisma/client";

// Types
interface ContentNavigationProps {
  contents: ContentWithChildren[];
  resourceId: string;
  resourceType: ResourceType;
  resourceTitle: string;
}

interface DrawerContentProps {
  content: ContentWithChildren;
  resourceId: string;
  resourceType: ResourceType;
  level: "CHAPTER" | "SECTION" | "PAGE";
  onSelectChild: (child: ContentWithChildren) => void;
  onBack: () => void;
  onClose: () => void;
  title: string;
}

// Utils
function getContentIcon(type: ContentType) {
  switch (type) {
    case ContentType.CHAPTER: return <Book size={18} />;
    case ContentType.SECTION: return <List size={18} />;
    case ContentType.PAGE: return <FileQuestion size={18} />;
    default: return <FileQuestion size={18} />;
  }
}

function getContentLabel(type: ContentType, resourceType: ResourceType) {
  if (resourceType === "PAST_PAPER") return "Chapter";
  switch (type) {
    case ContentType.CHAPTER: return "Chapter";
    case ContentType.SECTION: return "Section";
    case ContentType.PAGE: return "Page";
    default: return "Content";
  }
}

// Question List Component
function QuestionList({ contentId }: Readonly<{ contentId: string }>) {
  const [questions, setQuestions] = useState<QuestionWithSolutions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/contents/${contentId}/questions`);
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [contentId]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileQuestion size={48} className="text-gray-300 mb-4" />
        <Text fw={500} size="lg" c="dimmed" ta="center">No questions found</Text>
        <Text size="sm" c="dimmed" ta="center" mt={2}>This page doesn&apos;t have any questions yet.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <Link 
          key={question.id} 
          href={`/exercises/${contentId}/${question.id}`}
          legacyBehavior
        >
          <UnstyledButton className="w-full px-4 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Group>
              <Avatar radius="xl" size="sm" color="indigo">
                <FileQuestion size={16} />
              </Avatar>
              <Text fw={500} size="sm">Question {question.questionNumber}</Text>
            </Group>
          </UnstyledButton>
        </Link>
      ))}
    </div>
  );
}

// Past Paper Questions Component
function PastPaperQuestions({ chapter }: Readonly<{ chapter: ContentWithChildren }>) {
  const [questions, setQuestions] = useState<QuestionWithSolutions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const pages = chapter.children?.filter(c => c.type === ContentType.PAGE) || [];
        
        const questionsPromises = pages.map(async (page) => {
          const response = await fetch(`/api/contents/${page.id}/questions`);
          if (!response.ok) throw new Error('Failed to fetch questions');
          const data = await response.json();
          return data.questions;
        });

        const questionsArrays = await Promise.all(questionsPromises);
        setQuestions(questionsArrays.flat());
      } catch (error) {
        console.error('Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [chapter.children]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader size="sm" /></div>;
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <FileQuestion size={48} className="text-gray-300 mb-4" />
        <Text fw={500} size="lg" c="dimmed" ta="center">No questions found</Text>
        <Text size="sm" c="dimmed" ta="center" mt={2}>This chapter doesn&apos;t have any questions yet.</Text>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {questions.map((question) => (
        <Link 
          key={question.id} 
          href={`/exercises/${question.contentId}/${question.id}`}
          legacyBehavior
        >
          <UnstyledButton className="w-full px-4 py-2 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <Group>
              <Avatar radius="xl" size="sm" color="indigo">
                <FileQuestion size={16} />
              </Avatar>
              <Text fw={500} size="sm">Question {question.questionNumber}</Text>
            </Group>
          </UnstyledButton>
        </Link>
      ))}
    </div>
  );
}

// Drawer Content Component
function DrawerContent({
  content,
  resourceId,
  resourceType,
  onSelectChild,
  onBack,
  onClose,
  title,
}: Readonly<DrawerContentProps>) {
  const isPastPaperChapter = resourceType === "PAST_PAPER" && content.type === ContentType.CHAPTER;
  const isPage = content.type === ContentType.PAGE;

  return (
    <div className="max-w-4xl flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {isPastPaperChapter ? (
          <PastPaperQuestions chapter={content} />
        ) : isPage ? (
          <QuestionList contentId={content.id} />
        ) : (
          <>
            {content.children?.map((child) => (
              <div key={child.id} className="rounded overflow-hidden mb-2">
                <UnstyledButton
                  className="w-full px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  onClick={() => onSelectChild(child)}
                >
                  <Group>
                    <Avatar radius="xl" size="sm" color="blue">
                      {getContentIcon(child.type)}
                    </Avatar>
                    <Text fw={500} size="sm">
                        {getContentLabel(child.type, resourceType)} {child.number &&` ${child.number}`}
                        {child.pageNumber &&` ${child.pageNumber}`}
                        {child.title &&`  : ${child.title}`}
                    </Text>
                  </Group>
                </UnstyledButton>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// Mobile Navigation Component
export function MobileContentNavigation({
  contents,
  resourceId,
  resourceType,
  resourceTitle,
}: Readonly<ContentNavigationProps>) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeContent, setActiveContent] = useState<ContentWithChildren | null>(null);
  const [navigationStack, setNavigationStack] = useState<ContentWithChildren[]>([]);
  const [drawerTitle, setDrawerTitle] = useState("");

  const handleOpenDrawer = (content: ContentWithChildren) => {
    setActiveContent(content);
    setNavigationStack([content]);
    setDrawerTitle(resourceTitle);
    setDrawerOpen(true);
  };

  const handleSelectChild = (child: ContentWithChildren) => {
    setActiveContent(child);
    setNavigationStack([...navigationStack, child]);
    setDrawerTitle(
      `${getContentLabel(child.type, resourceType)}${child.number ? ` ${child.number}` : ''}${child.pageNumber ? ` ${child.pageNumber}` : ''}${child.title ? ` : ${child.title}` : ''}`
    );
      };

  const handleGoBack = () => {
    if (navigationStack.length <= 1) {
      setDrawerOpen(false);
      return;
    }
    
    const newStack = [...navigationStack];
    newStack.pop();
    const previousContent = newStack[newStack.length - 1];
    
    setNavigationStack(newStack);
    setActiveContent(previousContent);
    setDrawerTitle(previousContent ? 
      `${getContentLabel(previousContent.type, resourceType)} ${previousContent.number}${previousContent.title ? `: ${previousContent.title}` : ''}` 
      : resourceTitle
    );
  };

  return (
    <>
      <div className="space-y-2">
        {contents.map((chapter) => (
          <UnstyledButton
            key={chapter.id}
            className="w-full px-4 py-3 rounded hover:bg-gray-50 active:bg-gray-100 transition-colors border"
            onClick={() => handleOpenDrawer(chapter)}
          >
            <Group>
              <Avatar radius="xl" size="sm" color="blue">
                <Book size={18} />
              </Avatar>
              <Text fw={500} size="sm">
                {resourceType === "PAST_PAPER" ? "Question" : getContentLabel(chapter.type, resourceType)} {chapter.number}
                {chapter.title?.trim() && `: ${chapter.title}`}
              </Text>
            </Group>
          </UnstyledButton>
        ))}
      </div>

      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        padding={0}
        size="100%"
        classNames={{
          body: "p-0 flex flex-col h-[calc(100vh-60px)]",
          header: "py-3 px-4 flex items-center justify-between bg-white sticky top-0 z-10 border-b",
          inner: "bg-white"
        }}
        title={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleGoBack}
              leftSection={<ArrowLeft size={16} />}
              className="pl-0"
            >
              Back
            </Button>
            <Text fw={600} size="md" className="flex-1 text-center">
              {drawerTitle}
            </Text>
          </div>
        }
        closeButtonProps={{
          icon: <X size={16} />,
          "aria-label": "Close"
        }}
        zIndex={1000}
      >
        {activeContent && (
          <DrawerContent
            content={activeContent}
            resourceId={resourceId}
            resourceType={resourceType}
            onSelectChild={handleSelectChild}
            onBack={handleGoBack}
            onClose={() => setDrawerOpen(false)}
            title={drawerTitle}
            level="CHAPTER"
          />
        )}
      </Drawer>
    </>
  );
}