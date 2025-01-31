"use client";

import { ChapterWithContent, TopicWithQuestions } from "@/types/resource";
import { ResourceType } from "@prisma/client";
import { Book, FileQuestion } from "lucide-react";
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
interface ChapterAccordionProps {
  chapter: ChapterWithContent;
  resourceType: ResourceType;
}

// Utils
function getQuestionCount(
  chapter: ChapterWithContent,
  resourceType: ResourceType
): number {
  return resourceType === ResourceType.TEXTBOOK
    ? chapter.topics.reduce((acc, topic) => acc + topic.questions.length, 0)
    : chapter.questions?.length ?? 0;
}

interface QuestionWithTopic {
  id: string;
  exerciseNumber: string;
  questionNumber: string;
  topicId: string;
  topicTitle: string;
  topicNumber: number;
}

interface ExerciseGroup {
  exerciseNumber: string;
  questions: QuestionWithTopic[];
  questionCount: number;
}

interface QuestionButtonProps {
  readonly question: {
    readonly id: string;
    readonly questionNumber: string;
  };
}

function groupByExercise(topics: TopicWithQuestions[]): ExerciseGroup[] {
  const exerciseMap = new Map<string, QuestionWithTopic[]>();

  topics.forEach((topic) => {
    topic.questions.forEach((question) => {
      const exerciseNumber = String(question.exerciseNumber || "default");
      if (!exerciseMap.has(exerciseNumber)) {
        exerciseMap.set(exerciseNumber, []);
      }

      exerciseMap.get(exerciseNumber)!.push({
        ...question,
        topicId: topic.id,
        topicTitle: topic.title || "",
        topicNumber: topic.number || 0,
      });
    });
  });

  return Array.from(exerciseMap.entries())
    .map(([exerciseNumber, questions]) => ({
      exerciseNumber,
      questions,
      questionCount: questions.length,
    }))
    .sort((a, b) => {
      const numA = parseInt(a.exerciseNumber) || 0;
      const numB = parseInt(b.exerciseNumber) || 0;
      return numA - numB;
    });
}

// Components
function ChapterIcon({ resourceType }: { resourceType: ResourceType }) {
  return resourceType === ResourceType.TEXTBOOK ? (
    <Book size={20} />
  ) : (
    <FileQuestion size={20} />
  );
}

function TextbookContent({
  chapter,
}: Readonly<{ chapter: ChapterWithContent }>) {
  const exercises = groupByExercise(chapter.topics);

  if (exercises.length === 0) {
    return (
      <Text ta="center" c="dimmed" py="md">
        No exercises found
      </Text>
    );
  }

  return (
    <Grid>
      {exercises.map((exercise) => (
        <Grid.Col key={exercise.exerciseNumber} span={6}>
          <ExerciseButton chapter={chapter} exercise={exercise} />
        </Grid.Col>
      ))}
    </Grid>
  );
}

function PastPaperContent({
  chapter,
}: Readonly<{ chapter: ChapterWithContent }>) {
  if (!chapter.questions?.length) {
    return (
      <Text ta="center" c="dimmed" py="md">
        No questions found
      </Text>
    );
  }

  return (
    <Grid>
      {chapter.questions.map((question) => (
        <Grid.Col key={question.id} span={6}>
          <QuestionButton question={question} />
        </Grid.Col>
      ))}
    </Grid>
  );
}

function ExerciseButton({
  chapter,
  exercise,
}: Readonly<{
  chapter: ChapterWithContent;
  exercise: ExerciseGroup;
}>) {
  return (
    <Link href={`/exercises/${chapter.id}/${exercise.exerciseNumber}`}>
      <UnstyledButton className="w-full p-3 rounded hover:bg-gray-50 transition-colors">
        <Group justify="space-between">
          <Text size="sm" fw={500}>
            Exercise {exercise.exerciseNumber}
          </Text>
        </Group>
      </UnstyledButton>
    </Link>
  );
}

function QuestionButton({ question }: Readonly<QuestionButtonProps>) {
  return (
    <Link href={`/questions/${question.id}`}>
      <UnstyledButton className="w-full p-3 rounded hover:bg-gray-50 transition-colors">
        <Text size="sm">Question {question.questionNumber}</Text>
      </UnstyledButton>
    </Link>
  );
}

export function ChapterAccordion({
  chapter,
  resourceType,
}: Readonly<ChapterAccordionProps>) {
  const chapterType =
    resourceType === ResourceType.TEXTBOOK ? "Ch" : "Question";

  return (
    <Accordion.Item value={chapter.id}>
      <Accordion.Control
        icon={
          <Avatar radius="xl" size="sm" color="blue">
            <ChapterIcon resourceType={resourceType} />
          </Avatar>
        }
      >
        <Text size="sm" fw={400}>
          {chapterType}
          {chapter.number} : {chapter.title}
        </Text>
      </Accordion.Control>
      <Accordion.Panel>
        {resourceType === ResourceType.TEXTBOOK ? (
          <TextbookContent chapter={chapter} />
        ) : (
          <PastPaperContent chapter={chapter} />
        )}
      </Accordion.Panel>
    </Accordion.Item>
  );
}
