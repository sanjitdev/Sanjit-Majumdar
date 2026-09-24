"use client";
import { useEffect, useRef, useState } from 'react';

/**
 * <CommandPalette> — AD-13 closed-set client component (2 of 10).
 *
 * Renders `<div role="dialog" aria-modal="true" aria-labelledby="cmdk-title">`
 * with `<input>` + `<ul role="listbox" aria-live="polite" aria-relevant="additions">`
 * containing `<li role="option" aria-selected>` per item. Focus trap inside
 * the dialog on Tab/Shift+Tab. Open transition collapses to 0.01ms under
 * `prefers-reduced-motion`.
 *
 * This 1-6 baseline ships the structural contract; consumers (1-7, E4) wire
 * the item source + filter algorithm.
 */
export interface CommandPaletteItem {
  id: string;
  label: string;
}

export function CommandPalette({
  items,
  open: controlledOpen,
  onClose,
}: {
  items: CommandPaletteItem[];
  open?: boolean;
  onClose?: () => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const open = controlledOpen ?? internalOpen;

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Focus trap: cycle Tab/Shift+Tab inside the dialog.
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose ? onClose() : setInternalOpen(false);
      return;
    }
    if (e.key !== 'Tab' || !dialogRef.current) return;
    // Focus-trap selector excludes disabled, tabindex="-1", hidden, and
    // inert elements so the trap cycles only over genuine tab-stops
    // within the dialog.
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
      'input:not([disabled]), [role="option"]:not([aria-disabled="true"]):not([tabindex="-1"]):not([hidden]), button:not([disabled]):not([tabindex="-1"]):not([hidden]):not([inert])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  const transitionDuration = reducedMotion ? 'duration-[0.01ms]' : 'duration-150';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmdk-title"
      hidden={!open}
      onKeyDown={handleKeyDown}
      className={[
        'transition-[opacity,transform]',
        transitionDuration,
      ].join(' ')}
    >
      <h2 id="cmdk-title" className="sr-only">
        Command palette
      </h2>
      <input
        ref={inputRef}
        type="text"
        aria-label="Search commands"
        autoFocus={open}
        className="w-full min-h-[44px] rounded-md border border-border-strong bg-bg-2 px-3 text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
        placeholder="Type a command…"
      />
      <ul
        role="listbox"
        aria-live="polite"
        aria-relevant="additions"
        className="mt-2 max-h-80 overflow-y-auto"
      >
        {items.length === 0 ? (
          <li
            role="option"
            aria-disabled="true"
            className="min-h-[44px] cursor-default rounded-md px-3 py-2 text-fg-3"
          >
            No commands
          </li>
        ) : (
          items.map((item, i) => (
            <li
              key={item.id}
              role="option"
              aria-selected={i === activeIndex}
              className="min-h-[44px] cursor-pointer rounded-md px-3 py-2 text-fg-2 hover:bg-glass-strong"
              onMouseEnter={() => setActiveIndex(i)}
            >
              {item.label}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
