'use client'

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";

// Types remain the same
type StepContent = {
  hint?: string;
  content: string;
};

type SolutionType = {
  content: StepContent[];
};

type SubSolutionType = {
  part: string;
  solution: SolutionType;
};

type Question = {
  id: string;
  questionNumber: string;
  solutions?: Array<{
    content: {
      subSolutions: SubSolutionType[];
    };
  }>;
};

// Static components with LaTeX support
const LatexContent = ({ content }: { content: string }) => (
  <div className="prose-sm dark:prose-invert">
    <Latex>{content}</Latex>
  </div>
);

const StepProgress = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => (
  <span className="text-sm text-muted-foreground whitespace-nowrap">
    {current} of {total}
  </span>
);

const VerticalSeparator = () => (
  <Separator orientation="vertical" className="h-6" />
);

const HintContent = ({ hint }: { hint: string }) => (
  <div className="mt-2 p-3 bg-blue-50 rounded-md text-blue-800 text-sm">
    <LatexContent content={hint} />
  </div>
);

// Step actions component
const StepActions = ({
  hasHint,
  showHint,
  isRevealed,
  stepNumber,
  totalSteps,
  onToggleHint,
  onToggleReveal,
}: {
  hasHint: boolean;
  showHint: boolean;
  isRevealed: boolean;
  stepNumber: number;
  totalSteps: number;
  onToggleHint: () => void;
  onToggleReveal: () => void;
}) => (
  <div className="flex items-center gap-2 shrink-0">
    <Button variant="outline" size="sm" onClick={onToggleReveal}>
      {isRevealed ? "Hide Step" : "Show Step"}
    </Button>
    {hasHint && (
      <>
        <VerticalSeparator />
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleHint}
          className="text-blue-600"
        >
          {showHint ? "Hide Hint" : "Show Hint"}
        </Button>
      </>
    )}
    <VerticalSeparator />
    <StepProgress current={stepNumber} total={totalSteps} />
  </div>
);

// Main step component
const SolutionStep = ({
  stepNumber,
  totalSteps,
  step,
}: {
  stepNumber: number;
  totalSteps: number;
  step: StepContent;
}) => {
  const [state, setState] = useState({
    showHint: false,
    isRevealed: false,
  });

  return (
    <div className="py-4 border-b last:border-b-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="font-medium">
            Step {stepNumber}:{" "}
            {!state.isRevealed ? (
              "..."
            ) : (
              <LatexContent content={step.content} />
            )}
          </div>
          {state.showHint && step.hint && <HintContent hint={step.hint} />}
        </div>
        <StepActions
          hasHint={!!step.hint}
          showHint={state.showHint}
          isRevealed={state.isRevealed}
          stepNumber={stepNumber}
          totalSteps={totalSteps}
          onToggleHint={() =>
            setState((prev) => ({ ...prev, showHint: !prev.showHint }))
          }
          onToggleReveal={() =>
            setState((prev) => ({ ...prev, isRevealed: !prev.isRevealed }))
          }
        />
      </div>
    </div>
  );
};

// Section component
const SolutionSection = ({
  letter,
  solution,
}: {
  letter: string;
  solution: SubSolutionType;
}) => {
  const totalSteps = solution.solution.content.length;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">({letter})</h3>
      <Card>
        <CardContent className="p-4">
          {solution.solution.content.map((step, index) => (
            <SolutionStep
              key={index}
              stepNumber={index + 1}
              totalSteps={totalSteps}
              step={step}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// Empty state component
const EmptyState = ({ message }: { message: string }) => (
  <Card>
    <CardContent className="p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500">{message}</p>
    </CardContent>
  </Card>
);

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// Main component
const ExerciseContent = ({ questions }: { questions?: Question[] }) => {
  if (!questions?.length) {
    return <EmptyState message="No solutions available" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {questions.map((question) => {
        const solutions = question.solutions?.[0]?.content.subSolutions;
        if (!solutions?.length) {
          return (
            <EmptyState
              key={question.id}
              message="No solution steps available"
            />
          );
        }

        return (
          <div key={question.id} className="space-y-6">
            <h2 className="text-xl font-bold">
              Question {question.questionNumber}
            </h2>
            {solutions.map((solution, index) => (
              <SolutionSection
                key={solution.part}
                letter={LETTERS[index]}
                solution={solution}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default ExerciseContent;
