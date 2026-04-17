"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { AngleMode } from "@/lib/calculator";
import { asciiToMathML } from "asciimath2ml";

interface CalculatorDisplayProps {
  expression: string;
  result: string;
  angleMode: AngleMode;
  Modeis: string;
  memory: number;
}

export function CalculatorDisplay({
  expression,
  result,
  angleMode,
  Modeis,
  memory,
}: CalculatorDisplayProps) {
  const resultRef = useRef<HTMLDivElement>(null);
  var ml = expression;
  if (expression.includes("cbrt")) {
    ml = ml.replaceAll(/(cbrt)+([\(\d\.\+\-\*\/]+\??)(\))/g, "root$2$3 3 ");
  }
  if (expression.includes("exp")) {
    ml = ml.replaceAll(/(exp\()+([\d\.\+\-\*\/]{0,}\??)(\))/g, "e^$2");
  }
  if (expression.includes("tenx")) {
    ml = ml.replaceAll(/(tenx\()+([\d\.\+\-\*\/]{0,}\??)(\))/g, "10^$2");
  }
  if (expression.includes("nthroot\(")) {
    ml = ml.replaceAll(
      /(nthroot\()+([\d\.\+\-\*\/]{0,}\??)(\,)([(\,\d\.\+\-\*\/]{0,}\??)/g,
      "root($4) $2",
    );
  }
  if (expression.includes("^ -1")) {
    ml = ml.replaceAll("^ -1", "^ {-1}");
  }

  const iserr = Modeis === "ERROR";

  let mathML = asciiToMathML(ml.toLowerCase() || "sqrt(3x-1) + (1+x)^2");

  useEffect(() => {
    const el = resultRef.current;
    const ml = expression.replaceAll("cbrt", "root(3)");
    if (!el) return;
    const len = result.length;
    if (len > 16) {
      el.style.fontSize = "1.25rem";
    } else if (len > 12) {
      el.style.fontSize = "1.75rem";
    } else {
      el.style.fontSize = "";
    }
  }, [result, expression]);

  return (
    <div id="screenWrapper" className="calculator-screen dark:text-black">
      {/* Status badges */}
      <div
        style={{ display: "flex", justifyContent: "space-around" }}
        className="gap-2"
      >
        <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-widest text-primary">
          {angleMode.toUpperCase()}
        </span>

        <span className="inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-widest text-primary">
          {memory !== 0 ? "M" : ""}
        </span>

        {Modeis && (
          <span
            className={`inline-flex items-center rounded-md bg-primary/15 px-1.5 py-0.5 font-mono text-[12px] font-bold tracking-widest ${iserr ? "text-red-500" : "text-primary"}`}
          >
            {Modeis}
          </span>
        )}
      </div>

      {/* Expression */}
      <div className="mt-auto overflow-x-auto scrollbar-none text-right">
        <span className="whitespace-nowrap font-mono text-sm text-muted-foreground">
          {/* {expression || "\u00A0"} */}
          {expression || "\u00A0"}
        </span>
      </div>
      <div
        className="text-1xl h-10 py-1.5"
        id="guppy1"
        contentEditable
        dangerouslySetInnerHTML={{ __html: mathML }}
      ></div>
      {/* Result */}
      <div
        ref={resultRef}
        className={cn(
          "overflow-x-auto scrollbar-none text-right font-mono text-[2.25rem] font-bold leading-tight tracking-tight text-foreground transition-[font-size] duration-100",
          result === "Error" && "text-destructive",
          (result === "Infinity" || result === "-Infinity") && "text-primary",
        )}
      >
        <span className="whitespace-nowrap">{result || "0"}</span>
      </div>
    </div>
  );
}
