import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn() — shadcn-canonical class joiner (AD-15 contract).
 *
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (Tailwind conflict resolution so the last-wins utility wins). The
 * shadcn-canonical implementation; no project-specific extension.
 *
 * Lives at `lib/utils.ts` (the canonical shadcn location matching
 * the `aliases.utils: "@/lib/utils"` field in `components.json`).
 *
 * Pure utility: callable from server components. Do NOT add `"use client"`.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
