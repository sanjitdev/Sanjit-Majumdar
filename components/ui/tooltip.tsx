"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

/**
 * <Tooltip> — AD-15 closed shadcn surface (3 of 3).
 *
 * Token-mapped onto the closed AD-18 set defined in `app/globals.css`:
 *   TooltipContent → `bg-bg-3 text-fg border border-border-strong shadow-md`
 *   TooltipArrow   → `fill-bg-3`
 *
 * Ships the `<TooltipProvider>` re-export in the same file so consumers
 * have a single import path. The provider must wrap any route that mounts
 * one or more `<Tooltip>` instances so hover-delay state is shared.
 * Per epics.md line 70, `<Tooltip>` mounts on Patterns-cited deep-link
 * hover in E3.
 *
 * Animation contract: open/close uses native Tailwind v4 transition
 * utilities (`transition-opacity transition-transform duration-150
 * data-[state=closed]:opacity-0 data-[state=closed]:scale-95`) instead
 * of the shadcn-canonical `animate-in fade-in-0 zoom-in-95` set —
 * the canonical classes require the `tailwindcss-animate` plugin which
 * is NOT installed in this project (per AD-15 closed-surface discipline:
 * adding the plugin would be a Tailwind-config amendment outside this
 * story's scope; native v4 transitions preserve the same UX at zero
 * dependency cost).
 */

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md bg-bg-3 px-3 py-1.5 text-xs text-fg border border-border-strong shadow-md origin-(--radix-tooltip-content-transform-origin) transition-opacity transition-transform duration-150 data-[state=closed]:opacity-0 data-[state=closed]:scale-95 data-[state=delayed-open]:opacity-100 data-[state=delayed-open]:scale-100",
      className,
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn("fill-bg-3", className)}
    {...props}
  />
));
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipArrow,
};
