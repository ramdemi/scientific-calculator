"use client";

import { X, Trash2 } from "lucide-react";

export interface HistoryEntry {
  expression: string;
  result: string;
}

interface CalculatorHistoryProps {
  history: HistoryEntry[];
  onSelect: (result: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function CalculatorHistory({
  history,
  onSelect,
  onClear,
  onClose,
}: CalculatorHistoryProps) {
  return (
    <div className=" absolute w-1/3 text-black inset-0 z-10 flex flex-col rounded-2xl bg-gray-100 backdrop-blur-sm border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">
          History
        </h2>
        <div className="flex items-center gap-1">
          {history.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              aria-label="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close history"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1 py-16">
            <p className="text-sm text-muted-foreground">No history yet</p>
            <p className="text-xs text-muted-foreground/60">
              Calculations will appear here
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {[...history].reverse().map((entry, i) => (
              <button
                key={`history-${history.length - 1 - i}`}
                type="button"
                onClick={() => onSelect(entry.result)}
                className="flex flex-col items-end px-4 py-3 text-right transition-colors hover:bg-muted/50 border-b border-border/30 last:border-b-0"
              >
                <span className="text-xs text-muted-foreground font-mono truncate max-w-full">
                  {entry.expression}
                </span>
                <span className="text-lg font-mono font-semibold text-foreground mt-0.5">
                  {entry.result}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
