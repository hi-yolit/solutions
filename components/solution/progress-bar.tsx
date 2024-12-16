// src/components/solution/progress-bar.tsx
import { Progress } from "@/components/ui/progress"

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-500">
          Progress: {current} of {total} steps
        </span>
        <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
}