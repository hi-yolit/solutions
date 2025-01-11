import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FABProps {
  onClick: () => void
  text: string
  className?: string
}

export function FAB({ onClick, text, className }: FABProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 shadow-lg",
        "gap-2 rounded-full px-6",
        "bg-primary hover:bg-primary/90",
        "transition-all duration-200 ease-in-out",
        "hover:shadow-xl hover:-translate-y-0.5",
        className
      )}
    >
      <Plus className="h-5 w-5" />
      {text}
    </Button>
  )
}