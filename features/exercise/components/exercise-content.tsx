"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowDown , Lightbulb} from "lucide-react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { Drawer } from "@mantine/core";

// Types (Keep these as they are, they're well-defined)
type StepContent = {
  hint?: string;
  content: string;
  title?: string;
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


const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

// --- Helper Components ---
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
  <span className="text-xs text-muted-foreground whitespace-nowrap py-1">
    {current} of {total}
  </span>
);

// --- Solution Step Component ---
const SolutionStep = ({
  stepNumber,
  totalSteps,
  step,
  isActive,
  onNextStep,
  isLastStep,
  onToggleActive,
}: {
  stepNumber: number;
  totalSteps: number;
  step: StepContent;
  isActive: boolean;
  onNextStep: () => void;
  isLastStep: boolean;
  onToggleActive: () => void;
}) => {
  const [showHint, setShowHint] = useState(false);

  const toggleHint = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    setShowHint((prev) => !prev);
  };

  const closeHint = () => {
    setShowHint(false);
  };

  return (
    <div className="py-2 border-b last:border-b-0 relative">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          className="flex-1"
          onClick={onToggleActive}
          style={{ cursor: "pointer" }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <StepProgress current={stepNumber} total={totalSteps} />
                <h6 className="">
                  Step {stepNumber}: {step.title}
                </h6>
              </div>

              {step.hint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleHint}
                  aria-label={showHint ? "Hide hint" : "Show hint"}
                  className="text-blue-600"
                >
                  {showHint ? (
                    <Lightbulb fill="blue" strokeWidth={1.5} />
                  ) : (
                    <Lightbulb />
                  )}
                </Button>
              )}
            </div>

            <p className="text-muted-foreground pl-4">
              {isActive ? <LatexContent content={step.content} /> : null}
            </p>
          </div>
        </button>
      </div>

      {isActive && (
        <div className="flex justify-end items-center mt-2">
          {!isLastStep && (
            <Button variant="ghost" size="sm" onClick={onNextStep}>
              Next <ArrowDown className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      )}

      <Drawer
        position="bottom"
        opened={showHint && !!step.hint}
        onClose={closeHint}
        title={`Hint for Step ${stepNumber}`}
      >
        {step.hint && <LatexContent content={step.hint} />}
      </Drawer>
    </div>
  );
};

// --- Solution Section Component ---
const SolutionSection = ({
  letter,
  solution,
}: {
  letter: string;
  solution: SubSolutionType;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = solution.solution.content.length;

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleToggleActive = (index: number) => () => {
    setCurrentStep((prev) => (prev === index ? -1 : index));
  };

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
              isActive={index === currentStep}
              onNextStep={handleNextStep}
              isLastStep={index === totalSteps - 1}
              onToggleActive={handleToggleActive(index)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Empty State Component ---
const EmptyState = ({ message }: { message: string }) => (
  <Card>
    <CardContent className="p-6 text-center">
      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500">{message}</p>
    </CardContent>
  </Card>
);

// --- Main Component ---
const ExerciseContent = ({ questions }: { questions?: Question[] }) => {
  if (!questions?.length) {
    return <EmptyState message="No solutions available" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-8">
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
