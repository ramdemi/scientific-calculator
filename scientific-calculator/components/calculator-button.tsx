"use client";

import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "number"
  | "operator"
  | "function"
  | "action"
  | "equals"
  | "memory";

interface CalculatorButtonProps {
  label: string;
  secondLabel?: string;
  isSecond?: boolean;
  variant?: ButtonVariant;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

export function CalculatorButton({
  label,
  secondLabel,
  isSecond = false,
  variant = "function",
  onClick,
  className,
  ariaLabel,
}: CalculatorButtonProps) {
  const displayLabel = isSecond && secondLabel ? secondLabel : label;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel || displayLabel}
      className={cn(
        "relative flex items-center justify-center rounded-lg font-mono text-sm font-medium",
        "transition-all duration-100 ease-out",
        "active:scale-[0.96] active:brightness-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        "select-none cursor-pointer",
        "h-11 sm:h-12",
        // Number buttons - prominent and easy to read
        variant === "number" &&
          "bg-secondary text-secondary-foreground hover:brightness-125 text-base font-semibold",
        // Operator buttons - teal tinted
        variant === "operator" &&
          "bg-primary/20 text-primary hover:bg-primary/30 text-base font-semibold",
        // Function buttons - subtle muted
        variant === "function" &&
          "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground text-xs",
        // Action buttons (AC, DEL) - destructive hint
        variant === "action" &&
          "bg-destructive/12 text-destructive hover:bg-destructive/20 font-semibold",
        // Equals button - full primary
        variant === "equals" &&
          "bg-primary text-primary-foreground hover:brightness-110 text-lg font-bold",
        // Memory buttons - tiny and transparent
        variant === "memory" &&
          "bg-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground text-[11px] h-9",
        // 2nd mode highlight
        isSecond && secondLabel && "ring-1 ring-primary/40",
        className
      )}
    >
      <span className="truncate px-0.5 leading-tight">{displayLabel}</span>
    </button>
  );
}
