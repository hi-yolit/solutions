import { Suspense } from "react";
import ExerciseContent from "@/features/exercise/components/exercise-content";
import TopBar from "@/features/exercise/components/top-bar";
import { Container, Skeleton, Stack } from "@mantine/core";
import { getQuestionWithSolution } from "@/actions/questions";
import { notFound } from "next/navigation";
import { transformQuestion } from "@/types/question";

interface PageProps {
  params: Promise<{
    contentId: string;
    questionId: string;
  }>;
}

function Loading() {
  return (
    <Container size="lg" py={{ base: "md", sm: "xl" }}>
      <Stack gap="lg">
        <Skeleton height={40} radius="md" />
        <Skeleton height={24} width="40%" radius="md" />
        {[1, 2, 3].map((n) => (
          <Stack key={n} gap="md">
            <Skeleton height={120} radius="md" />
            <Skeleton height={80} radius="md" />
          </Stack>
        ))}
      </Stack>
    </Container>
  );
}

export default async function QuestionPage({ params }: Readonly<PageProps>) {
  const resolvedParams = await params;
  const { contentId, questionId } = resolvedParams;

  const result = await getQuestionWithSolution(questionId);

  if (result.error || !result.question) {
    notFound();
  }

  const question = result.question;

  // Transform the question data for the ExerciseContent component using our helper function
  const transformedQuestion = transformQuestion(question, contentId);

  // Get content info for the header
  const questionNumber = question.questionNumber;

  return (
    <Suspense fallback={<Loading />}>
      {/* Header */}
      <TopBar 
        questionNumber={questionNumber}
      />
      
      <Container size="lg" py={{ base: "md", sm: "xl" }}>
        <ExerciseContent question={transformedQuestion} />
      </Container>
    </Suspense>
  );
}