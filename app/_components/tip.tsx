"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface TipProps {
  label: string;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
}

export function Tip({ label, side = "bottom", children }: TipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
