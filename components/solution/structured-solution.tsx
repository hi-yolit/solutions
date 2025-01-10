// components/solution/structured-solution.tsx
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, ChevronDown, ChevronRight, HelpCircle } from "lucide-react"
import { StructuredStep } from '@/types/solution'
import Latex from 'react-latex-next'
import { cn } from '@/lib/utils'

interface StepProps {
    step: StructuredStep
    isRevealed: boolean
    showingHint: boolean
    onReveal: () => void
    onShowHint: () => void
}

export function StructuredSolutionStep({
    step,
    isRevealed,
    showingHint,
    onReveal,
    onShowHint
}: StepProps) {
    const [expanded, setExpanded] = useState(false)

    useEffect(() => {
        if (isRevealed) setExpanded(true)
    }, [isRevealed])

    return (
        <Card className={cn(!isRevealed && 'opacity-60')}>
            <CardHeader
                className="cursor-pointer select-none"
                onClick={() => isRevealed && setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {isRevealed && (
                            expanded ?
                                <ChevronDown className="h-4 w-4" /> :
                                <ChevronRight className="h-4 w-4" />
                        )}
                        <CardTitle className="text-base">{step.title}</CardTitle>
                        {step.marks && (
                            <Badge variant="outline">{step.marks} marks</Badge>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {!isRevealed && step.hint && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onShowHint()
                                }}
                            >
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Show Hint
                            </Button>
                        )}
                        {!isRevealed && (
                            <Button
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onReveal()
                                }}
                            >
                                Show Step
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            {(showingHint || (isRevealed && expanded)) && (
                <CardContent className="space-y-4">
                    {showingHint && !isRevealed && (
                        <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-md">
                            <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                            <p className="text-sm text-yellow-800">
                                <Latex>{step.hint ?? ''}</Latex>
                            </p>
                        </div>
                    )}
                    {isRevealed && (
                        <>
                            <div className="prose max-w-none">
                                <Latex>{step.content}</Latex>
                            </div>
                            {step.explanation && (
                                <div className="bg-muted p-4 rounded-md">
                                    <div className="prose max-w-none">
                                        <Latex>{step.explanation}</Latex>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            )}
        </Card>
    )
}

interface StructuredSolutionProps {
    steps: StructuredStep[]
    revealedSteps: number[] // Changed from boolean[] to number[]
    onReveal: (index: number) => void
    showingHint?: number | null
    onShowHint?: (index: number) => void
}

export function StructuredSolutionView({
    steps,
    revealedSteps,
    onReveal,
    showingHint,
    onShowHint
}: StructuredSolutionProps) {
    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
                <StructuredSolutionStep
                    key={index}
                    step={step}
                    isRevealed={revealedSteps.includes(index)}
                    showingHint={showingHint === index}
                    onReveal={() => onReveal(index)}
                    onShowHint={() => onShowHint?.(index)}
                />
            ))}
        </div>
    )
}