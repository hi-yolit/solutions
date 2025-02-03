import { Suspense } from "react";
import prisma from "@/lib/prisma";
import ExerciseContent from "@/features/exercise/components/exercise-content";
import  TopBar  from "@/features/exercise/components/top-bar";
import { Container, Skeleton, Stack } from "@mantine/core";

interface PageProps {
  params: {
    chapterId: string;
    exerciseId: string;
  };
}

async function getExerciseQuestions(chapterId: string, exerciseId: string) {
  try {
    const questions = await prisma.question.findMany({
      where: {
        chapterId,
        exerciseNumber: parseInt(exerciseId),
      },
      include: {
        solutions: {
          select: {
            id: true,
            content: true,
            steps: true,
            metrics: true,
          },
        },
        topic: {
          select: {
            id: true,
            title: true,
            number: true,
          },
        },
      },
      orderBy: {
        questionNumber: "asc",
      },
    });

    return questions;
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw new Error("Failed to fetch questions");
  }
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

export default async function ExercisePage({ params }: Readonly<PageProps>) {
  const questions = await getExerciseQuestions(
    params.chapterId,
    params.exerciseId
  );

  console.log("Questions From Excerse", questions)

  return (
    <Suspense fallback={<Loading />}>
      {/* Header */}
      <TopBar exerciseNumber={questions[0].exerciseNumber ?? 0}/>
      <ExerciseContent questions={questions} params={params} />
    </Suspense>
  );
}
