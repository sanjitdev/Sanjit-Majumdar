"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * <Toggle> — AD-15 closed shadcn surface (2 of 3).
 *
 * Token-mapped onto the closed AD-18 set defined in `app/globals.css`:
 *   default  → `bg-bg-2 text-fg-2 hover:bg-bg-3`
 *   outline  → `border border-border-strong bg-transparent hover:bg-bg-3`
 *
 * Active state (data-[state=on]) flips to the accent token (`bg-accent
 * text-on-accent`). Reserved for E3 filter-chip non-radiogroup contexts;
 * no E1 consumer mounts it.
 */

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-bg-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-on-accent",
  {
    variants: {
      variant: {
        default: "bg-bg-2 text-fg-2",
        outline: "border border-border-strong bg-transparent hover:bg-bg-3",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant }), className)}
    {...props}
  />
));
Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
