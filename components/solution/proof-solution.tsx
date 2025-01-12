"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react"
import { ProofStep } from '@/types/solution'
import { ContentRenderer } from '../shared/content-renderer'

interface ProofSolutionProps {
    steps: ProofStep[]
    revealed: boolean
    onReveal: () => void
}

export function ProofSolutionView({
    steps,
    revealed,
    onReveal
}: ProofSolutionProps) {
    const [expandedSteps, setExpandedSteps] = useState<number[]>([])

    return (
        <div className="space-y-4">
            {steps.map((step, index) => (
                <Card
                    key={index}
                    className={!revealed ? 'opacity-60' : ''}
                >
                    <CardHeader
                        className="cursor-pointer"
                        onClick={() => revealed && setExpandedSteps(prev =>
                            prev.includes(index)
                                ? prev.filter(s => s !== index)
                                : [...prev, index]
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {revealed && (
                                    expandedSteps.includes(index)
                                        ? <ChevronDown className="h-4 w-4" />
                                        : <ChevronRight className="h-4 w-4" />
                                )}
                                <CardTitle className="text-base">{step.title}</CardTitle>
                            </div>
                            {!revealed && (
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
                    </CardHeader>
                    {revealed && expandedSteps.includes(index) && (
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Statement</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none">
                                            <ContentRenderer content={step.statement} />
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm">Justification</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="prose max-w-none">
                                            <ContentRenderer content={step.justification} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {step.hint && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-1" />
                                    <ContentRenderer content={step.hint} />
                                </div>
                            )}
                        </CardContent>
                    )}
                </Card>
            ))}
        </div>
    )
}