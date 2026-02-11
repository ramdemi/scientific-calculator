"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { AngleMode } from "@/lib/calculator";

interface CalculatorDisplayProps {
  expression: string;
  result: string;
  angleMode: AngleMode;
  isSecond: boolean;
  memory: number;
}

export function CalculatorDisplay({
  expression,
  result,
  angleMode,
  isSecond,
  memory,
}: CalculatorDisplayProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = resultRef.current;
    if (!el) return;
    const len = result.length;
    if (len > 16) {
      el.style.fontSize = "1.25rem";
    } else if (len > 12) {
      el.style.fontSize = "1.75rem";
    } else {
      el.style.fontSize = "";
    }
  }, [result]);

  return (
    <div className="relative flex flex-col rounded-xl bg-background/50 border border-border/40 px-4 py-3 min-h-[108px] overflow-hidden">
      {/* Status badges */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
          {angleMode.toUpperCase()}
        </span>
        {isSecond && (
          <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
            2ND
          </span>
        )}
        {memory !== 0 && (
          <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-primary">
            M
          </span>
        )}
      </div>

      {/* Expression */}
      <div className="mt-auto overflow-x-auto scrollbar-none text-right">
        <span className="whitespace-nowrap font-mono text-sm text-muted-foreground">
          {expression || "\u00A0"}
        </span>
      </div>

      {/* Result */}
      <div
        ref={resultRef}
        className={cn(
          "overflow-x-auto scrollbar-none text-right font-mono text-[2.25rem] font-bold leading-tight tracking-tight text-foreground transition-[font-size] duration-100",
          result === "Error" && "text-destructive",
          (result === "Infinity" || result === "-Infinity") && "text-primary"
        )}
      >
        <span className="whitespace-nowrap">{result || "0"}</span>
      </div>
    </div>
  );
}
