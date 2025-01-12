"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Lightbulb } from "lucide-react"
import { MCQSolution } from '@/types/solution'
import { cn } from "@/lib/utils"
import { ContentRenderer } from '../shared/content-renderer'

interface OptionFeedback {
  selected: boolean;
  isCorrect: boolean;
}

interface MCQSolutionProps {
  solution: MCQSolution
  onComplete?: (isCorrect: boolean) => void
}

export function MCQSolutionView({
  solution,
  onComplete
}: MCQSolutionProps) {
  const [optionFeedback, setOptionFeedback] = useState<Record<string, OptionFeedback>>(
    solution.options.reduce((acc, option) => ({
      ...acc,
      [option.label]: { selected: false, isCorrect: false }
    }), {})
  );
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealSolution, setRevealSolution] = useState(false);

  const handleOptionSelect = (optionLabel: string) => {
    if (revealSolution) return;

    // Reset previous selections
    const newFeedback = { ...optionFeedback };
    Object.keys(newFeedback).forEach(key => {
      newFeedback[key] = { selected: false, isCorrect: false };
    });

    // Check if the selected option is correct
    const isCorrect = optionLabel === solution.correctOption;

    // Update feedback for the selected option
    newFeedback[optionLabel] = {
      selected: true,
      isCorrect: isCorrect
    };

    setOptionFeedback(newFeedback);
    setSelectedOption(optionLabel);

    // If correct, prevent further attempts
    if (isCorrect) {
      onComplete && onComplete(true);
    }
  };

  const handleRevealSolution = () => {
    setRevealSolution(true);
    onComplete && onComplete(false);
  };

  const resetSelection = () => {
    setOptionFeedback(
      solution.options.reduce((acc, option) => ({
        ...acc,
        [option.label]: { selected: false, isCorrect: false }
      }), {})
    );
    setSelectedOption(null);
    setRevealSolution(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {solution.options.map((option) => {
          const feedback = optionFeedback[option.label];
          const isRevealed = revealSolution;
          const isCorrect = option.label === solution.correctOption;
          const isSelected = selectedOption === option.label;

          return (
            <div
              key={option.label}
              className="space-y-2"
            >
              <Button
                variant={
                  isRevealed
                    ? (isCorrect ? "default" : "outline")
                    : (feedback.selected
                      ? (feedback.isCorrect ? "default" : "destructive")
                      : "outline")
                }
                className={cn(
                  "w-full justify-start text-left",
                  isRevealed && isCorrect && "bg-green-100 hover:bg-green-100",
                  feedback.selected && !feedback.isCorrect && "bg-red-100 hover:bg-red-100"
                )}
                onClick={() => handleOptionSelect(option.label)}
                disabled={revealSolution && !isCorrect}
              >
                <div className="flex items-center gap-4 w-full">
                  <Badge variant="outline">{option.label}</Badge>
                  <div className="flex-1">
                    <ContentRenderer content={option.content} />
                  </div>
                  {(feedback.selected || isRevealed) && (
                    <>
                      {(feedback.isCorrect || isRevealed && isCorrect) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {(feedback.selected && !feedback.isCorrect) && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </>
                  )}
                </div>
              </Button>

              {/* Inline Explanation */}
              {isSelected && !isRevealed && (
                <div className={cn(
                  "p-3 rounded-lg text-sm",
                  feedback.isCorrect
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                )}>
                  {feedback.isCorrect ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Correct! {option.explanation}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span>Incorrect. {solution.distractorExplanations.find(d => d.option === option.label)?.explanation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        {selectedOption && !revealSolution && (
          <Button
            variant="ghost"
            onClick={resetSelection}
          >
            Reset Selection
          </Button>
        )}

        {!revealSolution && (
          <Button
            variant="outline"
            onClick={handleRevealSolution}
            className="ml-auto"
          >
            Reveal Solution
          </Button>
        )}
      </div>

      {/* Full Solution */}
      {revealSolution && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-blue-800">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Complete Solution</h3>
          </div>
          <div className="text-sm text-blue-800">
          <ContentRenderer content={solution.explanation} />
          </div>

          {solution.tip && (
            <div className="text-sm text-blue-700 italic">
              💡 Tip:  <ContentRenderer content={solution.tip} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}