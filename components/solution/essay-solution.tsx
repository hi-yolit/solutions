"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronRight } from "lucide-react"
import { EssayOutlinePoint } from '@/types/solution'
import { ContentRenderer } from '../shared/content-renderer'

interface EssaySolutionProps {
  points: EssayOutlinePoint[]
  revealed: boolean
  onReveal: () => void
}

export function EssaySolutionView({
  points,
  revealed,
  onReveal
}: EssaySolutionProps) {
  const [expandedPoints, setExpandedPoints] = useState<number[]>([])

  return (
    <div className="space-y-4">
      {points.map((point, index) => (
        <Card
          key={index}
          className={!revealed ? 'opacity-60' : ''}
        >
          <CardHeader
            className="cursor-pointer"
            onClick={() => revealed && setExpandedPoints(prev =>
              prev.includes(index)
                ? prev.filter(p => p !== index)
                : [...prev, index]
            )}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {revealed && (
                  expandedPoints.includes(index)
                    ? <ChevronDown className="h-4 w-4" />
                    : <ChevronRight className="h-4 w-4" />
                )}
                <CardTitle className="text-base">{point.title}</CardTitle>
                {point.marks && (
                  <Badge variant="outline">{point.marks} marks</Badge>
                )}
              </div>
              {!revealed && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onReveal()
                  }}
                >
                  Show Point
                </Button>
              )}
            </div>
          </CardHeader>
          {revealed && expandedPoints.includes(index) && (
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <ContentRenderer content={point.content} />
              </div>
              {/*               {point.subPoints?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Supporting Points:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {point.subPoints.map((subPoint, i) => (
                      <li key={i}>
                        <Latex>{subPoint}</Latex>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {point.keyWords?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Key Words:</h4>
                  <div className="flex flex-wrap gap-2">
                    {point.keyWords.map((word, i) => (
                      <Badge key={i} variant="secondary">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )} */}
              {point.explanation && (
                <div className="bg-muted p-4 rounded-md">
                  <div className="prose max-w-none">
                    <ContentRenderer content={point.explanation} />
                  </div>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  )
}
