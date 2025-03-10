"use client"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface InfoTooltipProps {
  text: string
  className?: string
}

export function InfoTooltip({ text, className = "" }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <InfoIcon
            className={`h-3 w-3 text-muted-foreground/60 cursor-help ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent className={"max-w-[300px]"}>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
