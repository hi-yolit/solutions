"use client";

import React, { useState, useCallback, useMemo, memo, MouseEvent, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertCircle, ArrowDown, Lightbulb, Loader2, Lock,
  LogIn, Coins, ChevronRight
} from "lucide-react";
import Latex from "react-latex-next";
import "katex/dist/katex.min.css";
import { Drawer, Alert, Group, Text } from "@mantine/core";
import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import QuestionNavigation from "./question-navigation";
import { StepContent } from "@/types/question";
import { solutionCredit } from '@/actions/user';
import { useRouter } from 'next/navigation';

// Process content with mixed text and images
const ProcessedContent = ({ content }: { content: string }) => {
  const segments = useMemo(() => {
    if (!content) return [];

    // Split content into text and image segments
    const imgRegex = /\[image\|(.*?)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    // Find all image placeholders and split content
    while ((match = imgRegex.exec(content)) !== null) {
      // Add text before image if any
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }

      // Add image
      try {
        const imgData = JSON.parse(match[1]);
        parts.push({
          type: 'image',
          data: imgData
        });
      } catch (e) {
        console.error("Failed to parse image JSON:", e);
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after last image if any
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }

    return parts;
  }, [content]);

  return (
    <div className="space-y-2">
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
          {segment.type === 'text' ? (
            <div className="prose-sm dark:prose-invert">
              <Latex>{segment.content || ""}</Latex>
            </div>
          ) : (
            <div className={`flex ${segment.data.alignment === 'center' ? 'justify-center' : segment.data.alignment === 'right' ? 'justify-end' : ''}`}>
              <figure className="relative">
                <img
                  src={segment.data.url}
                  alt={segment.data.caption || "Solution image"}
                  style={{ width: segment.data.width ? `${segment.data.width}%` : 'auto' }}
                  className="rounded border border-gray-200"
                />
                {segment.data.caption && (
                  <figcaption className="text-center text-sm text-gray-500 mt-1">
                    {segment.data.caption}
                  </figcaption>
                )}
              </figure>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* const StepProgress = memo(function StepProgressComponent({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="text-xs text-muted-foreground whitespace-nowrap py-1">
      {current} of {total}
    </div>
  );
});

StepProgress.displayName = "StepProgress"; */

// --- Solution Step Component ---

const SolutionStep = ({
  stepNumber,
  totalSteps,
  step,
  isActive,
  onNextStep,
  isLastStep,
  onToggleActive,
  index,
}: {
  stepNumber: number;
  totalSteps: number;
  step: StepContent;
  isActive: boolean;
  onNextStep: () => void;
  isLastStep: boolean;
  onToggleActive: (index: number) => void;
  index: number;
}) => {
  const [showHint, setShowHint] = useState(false);

  const toggleHint = useCallback((e: MouseEvent) => {
    e.stopPropagation(); // Stop event propagation
    setShowHint((prev) => !prev);
  }, []);

  const closeHint = useCallback(() => {
    setShowHint(false);
  }, []);

  const hintButton = (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleHint}
      aria-label={showHint ? "Hide hint" : "Show hint"}
      className="text-blue-600"
    >
      {showHint ? <Lightbulb fill="blue" strokeWidth={1.5} /> : <Lightbulb />}
    </Button>
  );

  return (
    <div className="py-2 border-b last:border-b-0 relative">
      <div className="flex items-center justify-between gap-4">
        <div
          className="flex-1 cursor-pointer"
          onClick={() => onToggleActive(index)}
        >
          <div className="space-y-3 w-full">
            <div className="flex justify-between items-start">
              <div className="flex-col">
                <h6 className="flex items-center">
                  <span className="text-xs text-muted-foreground mr-2">
                    {stepNumber} of {totalSteps}
                  </span>
                  <Latex>{step.title || 'Solution Step'}</Latex>
                </h6>
              </div>

              {step.hint && hintButton}
            </div>

            {isActive && (
              <div className="pl-4">
                {/* Main content with images in correct position */}
                <ProcessedContent content={step.content || ''} />

                {/* Explanation section */}
                {step.explanation && (
                  <div className="mt-3 p-3 bg-gray-50 border-l-2 border-blue-400 text-sm">
                    <div className="font-medium mb-1">Explanation:</div>
                    <ProcessedContent content={step.explanation} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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

      {showHint &&
        step.hint && (
          <Drawer
            position="bottom"
            opened={showHint && !!step.hint}
            onClose={closeHint}
            title={`Hint for Step ${stepNumber}`}
          >
            <ProcessedContent content={step.hint} />
          </Drawer>
        )}
    </div>
  );
};

// --- Limited Solution Steps Component (only first step) ---
const LimitedSolutionSteps = ({
  steps,
  onUnlockAllSteps
}: {
  steps: StepContent[];
  onUnlockAllSteps: () => void;
}) => {
  const { profile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  // Only show the first step
  const firstStep = steps[0];

  const handleSubscribe = () => {
    router.push('/pricing');
  };

  // Determine if user has credits
  const hasCredits = profile && profile.solutionCredits > 0;

  return (
    <Card>
      <CardContent className="p-4">
        {/* Always show the first step */}
        <SolutionStep
          stepNumber={1}
          totalSteps={steps.length}
          step={firstStep}
          isActive={true}
          onNextStep={() => { }}
          isLastStep={false}
          onToggleActive={() => { }}
          index={0}
        />

        {/* Credit alert or subscription CTA */}
        <div className="mt-4 border-t pt-4">
          {hasCredits ? (
            <Alert
              icon={<Coins size={16} />}
              title="Unlock All Steps"
              color="orange"
              variant="light"
              className="mb-4"
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Text size="sm" lineClamp={2}>
                  See all {steps.length} steps (uses 1 credit)
                </Text>
                <Button
                  variant="outline"
                  color="orange"
                  onClick={onUnlockAllSteps}
                  size="sm"
                >
                  Use Credit
                </Button>
              </Group>
            </Alert>
          ) : (
            <Alert
              icon={<Lock size={16} />}
              title="Subscribe for Full Access"
              color="blue"
              variant="light"
            >
              <Group justify="space-between" align="center" wrap="nowrap">
                <Text size="sm" lineClamp={2}>
                  Get unlimited access to all solutions
                </Text>
                <Button
                  variant="outline"
                  color="blue"
                  onClick={handleSubscribe}
                  size="sm"
                >
                  Subscribe
                </Button>
              </Group>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Solution Steps Component (all steps) ---
const FullSolutionSteps = ({ steps }: { steps: StepContent[] }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = steps.length;

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [totalSteps]);

  const handleToggleActive = useCallback((index: number) => {
    setCurrentStep((prev) => (prev === index ? -1 : index));
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        {steps.map((step, index) => (
          <SolutionStep
            key={index}
            stepNumber={index + 1}
            totalSteps={totalSteps}
            step={step}
            isActive={index === currentStep}
            onNextStep={handleNextStep}
            isLastStep={index === totalSteps - 1}
            onToggleActive={handleToggleActive}
            index={index}
          />
        ))}
      </CardContent>
    </Card>
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

// --- Login Required Component ---
const LoginRequired = () => (
  <Card>
    <CardContent className="p-6 text-center">
      <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <p className="text-gray-500 mb-6">Login to view step-by-step explanations</p>
      <Link href="/auth/login">
        <Button>
          Login <LogIn className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

// --- Main Component ---
const ExerciseContent = ({ question }: { question: any }) => {
  const { user, profile, isLoading } = useAuth();
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [isProcessingCredit, setIsProcessingCredit] = useState(false);
  const [creditError, setCreditError] = useState<string | null>(null);
  const router = useRouter();
  const { refreshAuth } = useAuth()

  // Check if user is admin or has subscription - they see all steps by default
  const hasFullAccess = useMemo(() => {
    return profile?.role === 'ADMIN' || profile?.subscriptionStatus === 'ACTIVE';
  }, [profile]);

  // Set showAllSteps to true if the user has full access
  useEffect(() => {
    if (hasFullAccess) {
      setShowAllSteps(true);
    }
  }, [hasFullAccess]);

  // Handle using a credit to unlock all steps
  const handleUnlockAllSteps = async () => {
    try {
      setIsProcessingCredit(true);
      setCreditError(null);

      const result = await solutionCredit();

      if (result.error) {
        setCreditError(result.error);
        return;
      }

      if (result.canViewSolution) {
        await refreshAuth()
        setShowAllSteps(true);
      }
    } catch (err) {
      setCreditError('Failed to process credit');
      console.error(err);
    } finally {
      setIsProcessingCredit(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If user is not logged in, show login required message
  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4">
        <LoginRequired />
      </div>
    );
  }

  // Check if question has solutions with steps
  const hasSolutions = question?.solutions && question.solutions.length > 0;

  if (!hasSolutions) {
    return <EmptyState message="No solution available for this question" />;
  }

  // Get the first solution with steps
  const solution = question.solutions[0];
  const hasSteps = solution?.steps && solution.steps.length > 0;

  if (!hasSteps) {
    return <EmptyState message="No solution steps available for this question" />;
  }

  return (
    <div className="max-w-4xl mx-auto p-2 space-y-6">
      {/* Credit error display if any */}
      {creditError && (
        <Alert color="red" title="Error" className="mb-4">
          {creditError}
        </Alert>
      )}

      {/* Display full solution or limited solution based on access */}
      {(showAllSteps || hasFullAccess) ? (
        <FullSolutionSteps steps={solution.steps} />
      ) : (
        <LimitedSolutionSteps
          steps={solution.steps}
          onUnlockAllSteps={handleUnlockAllSteps}
        />
      )}

      {/* Navigation between questions */}
      {question.contentId && (
        <div className="mt-8 border-t pt-4">
          <QuestionNavigation
            contentId={question.contentId}
            currentQuestionId={question.id}
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseContent;