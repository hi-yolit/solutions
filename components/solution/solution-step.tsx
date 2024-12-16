// src/components/solution/solution-step.tsx
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { SolutionStep } from "@/types/solution"

interface SolutionStepCardProps {
  step: SolutionStep;
  isRevealed: boolean;
  showingHint: boolean;
  onReveal: () => void;
  onShowHint: () => void;
}

export function SolutionStepCard({
  step,
  isRevealed,
  showingHint,
  onReveal,
  onShowHint
}: SolutionStepCardProps) {
  return (
    <Card className={!isRevealed ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            Step {step.number}: {step.title}
          </CardTitle>
          {!isRevealed && (
            <div className="flex gap-2">
              {showingHint ? (
                <p className="text-sm text-gray-600 italic">{step.hint}</p>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onShowHint}
                >
                  Show Hint
                </Button>
              )}
              <Button onClick={onReveal}>
                Reveal Step
              </Button>
            </div>
          )}
          {isRevealed && (
            <Badge variant="secondary">
              <Check className="h-4 w-4 mr-1" /> Revealed
            </Badge>
          )}
        </div>
      </CardHeader>
      {isRevealed && (
        <CardContent>
          <p className="mb-4">{step.content}</p>
          <div className="bg-slate-50 p-4 rounded-md mb-4 whitespace-pre-line">
            {step.explanation}
          </div>
          {step.tip && (
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-800">💡 Tip: {step.tip}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}