"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <AlertCircle className="h-10 w-10 text-destructive mb-4" />
      <p className="text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
