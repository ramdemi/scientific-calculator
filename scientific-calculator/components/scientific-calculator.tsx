"use client";

import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, SunMoon, History } from "lucide-react";
import {
  evaluateUnary,
  evaluateBinary,
  formatResult,
  type AngleMode,
} from "@/lib/calculator";
import { CalculatorDisplay } from "./calculator-display";
import { CalculatorButton, type ButtonVariant } from "./calculator-button";
import {
  CalculatorHistory,
  type HistoryEntry,
} from "./calculator-history";

type CalcState = "input" | "operator" | "result" | "error";

export function ScientificCalculator() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Calculator state
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [pendingBinaryFn, setPendingBinaryFn] = useState<string | null>(null);
  const [calcState, setCalcState] = useState<CalcState>("input");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [isSecond, setIsSecond] = useState(false);
  const [memory, setMemory] = useState(0);
  const [lastAnswer, setLastAnswer] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [openParens, setOpenParens] = useState(0);
  const [parenStack, setParenStack] = useState<
    { value: number; op: string | null }[]
  >([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentValue = useCallback((): number => {
    return Number.parseFloat(display) || 0;
  }, [display]);

  const appendDigit = useCallback(
    (digit: string) => {
      if (calcState === "result" || calcState === "error") {
        setDisplay(digit);
        setExpression("");
        setCalcState("input");
        setPrevValue(null);
        setPendingOp(null);
        return;
      }
      if (calcState === "operator") {
        setDisplay(digit);
        setCalcState("input");
        return;
      }
      if (display === "0" && digit !== ".") {
        setDisplay(digit);
      } else if (digit === "." && display.includes(".")) {
        return;
      } else {
        setDisplay(display + digit);
      }
    },
    [display, calcState]
  );

  const handleClear = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setPrevValue(null);
    setPendingOp(null);
    setPendingBinaryFn(null);
    setCalcState("input");
    setOpenParens(0);
    setParenStack([]);
  }, []);

  const handleDelete = useCallback(() => {
    if (calcState === "result" || calcState === "error") {
      handleClear();
      return;
    }
    if (display.length <= 1 || display === "0") {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, calcState, handleClear]);

  const performBinaryOp = useCallback(
    (op: string) => {
      const current = currentValue();
      if (pendingOp && prevValue !== null && calcState !== "operator") {
        const result = evaluateBinary(pendingOp, prevValue, current);
        const formatted = formatResult(result);
        setDisplay(formatted);
        setPrevValue(result);
        setExpression(`${formatted} ${getOpSymbol(op)} `);
      } else {
        setPrevValue(current);
        setExpression(`${display} ${getOpSymbol(op)} `);
      }
      setPendingOp(op);
      setPendingBinaryFn(null);
      setCalcState("operator");
    },
    [currentValue, pendingOp, prevValue, display, calcState]
  );

  const handleBinaryFunction = useCallback(
    (fn: string) => {
      const current = currentValue();
      setPrevValue(current);
      setPendingBinaryFn(fn);
      setPendingOp(null);
      setExpression(`${getFnLabel(fn)}(${formatResult(current)}, `);
      setCalcState("operator");
    },
    [currentValue]
  );

  const handleEquals = useCallback(() => {
    const current = currentValue();
    let result: number;
    let expr: string;

    if (pendingBinaryFn && prevValue !== null) {
      result = evaluateBinary(pendingBinaryFn, prevValue, current);
      expr = `${getFnLabel(pendingBinaryFn)}(${formatResult(prevValue)}, ${formatResult(current)})`;
    } else if (pendingOp && prevValue !== null) {
      result = evaluateBinary(pendingOp, prevValue, current);
      expr = `${formatResult(prevValue)} ${getOpSymbol(pendingOp)} ${formatResult(current)}`;
    } else {
      result = current;
      expr = formatResult(current);
    }

    const formatted = formatResult(result);

    if (formatted === "Error" || formatted === "Infinity" || formatted === "-Infinity") {
      setDisplay(formatted);
      setCalcState("error");
    } else {
      setDisplay(formatted);
      setCalcState("result");
    }

    setExpression(`${expr} =`);
    setLastAnswer(result);
    setPrevValue(null);
    setPendingOp(null);
    setPendingBinaryFn(null);
    setHistory((prev) => [...prev, { expression: `${expr} =`, result: formatted }]);
  }, [currentValue, pendingOp, pendingBinaryFn, prevValue]);

  const handleUnary = useCallback(
    (fn: string) => {
      const current = currentValue();
      const result = evaluateUnary(fn, current, angleMode);
      const formatted = formatResult(result);
      const fnLabel = getFnLabel(fn);

      if (formatted === "Error") {
        setDisplay("Error");
        setExpression(`${fnLabel}(${formatResult(current)})`);
        setCalcState("error");
      } else {
        setDisplay(formatted);
        setExpression(`${fnLabel}(${formatResult(current)})`);
        setCalcState("result");
        setLastAnswer(result);
      }
    },
    [currentValue, angleMode]
  );

  const handleNegate = useCallback(() => {
    if (display === "0") return;
    if (display.startsWith("-")) {
      setDisplay(display.slice(1));
    } else {
      setDisplay("-" + display);
    }
  }, [display]);

  const handleConstant = useCallback(
    (id: string) => {
      let value: number;
      switch (id) {
        case "pi":
          value = Math.PI;
          break;
        case "e":
          value = Math.E;
          break;
        case "ans":
          value = lastAnswer;
          break;
        case "rand":
          value = Math.random();
          break;
        default:
          return;
      }
      const formatted = formatResult(value);
      setDisplay(formatted);
      if (calcState === "result" || calcState === "error") {
        setExpression("");
      }
      setCalcState("input");
    },
    [lastAnswer, calcState]
  );

  const handleScientificNotation = useCallback(() => {
    if (!display.includes("e")) {
      setDisplay(display + "e");
      setCalcState("input");
    }
  }, [display]);

  const handleParen = useCallback(
    (type: "(" | ")") => {
      if (type === "(") {
        setParenStack((prev) => [...prev, { value: prevValue ?? 0, op: pendingOp }]);
        setPrevValue(null);
        setPendingOp(null);
        setOpenParens((p) => p + 1);
        setDisplay("0");
        setCalcState("input");
        setExpression((prev) => prev + "(");
      } else if (type === ")" && openParens > 0) {
        const current = currentValue();
        let result = current;
        if (pendingOp && prevValue !== null) {
          result = evaluateBinary(pendingOp, prevValue, current);
        }
        const top = parenStack[parenStack.length - 1];
        setParenStack((prev) => prev.slice(0, -1));
        setPrevValue(top?.value ?? null);
        setPendingOp(top?.op ?? null);
        setOpenParens((p) => p - 1);
        setDisplay(formatResult(result));
        setCalcState("result");
        setExpression((prev) => prev + formatResult(current) + ")");
      }
    },
    [openParens, currentValue, pendingOp, prevValue, parenStack]
  );

  // Memory functions
  const handleMemoryClear = useCallback(() => setMemory(0), []);
  const handleMemoryRecall = useCallback(() => {
    setDisplay(formatResult(memory));
    setCalcState("input");
  }, [memory]);
  const handleMemoryAdd = useCallback(() => {
    setMemory((m) => m + currentValue());
  }, [currentValue]);
  const handleMemorySubtract = useCallback(() => {
    setMemory((m) => m - currentValue());
  }, [currentValue]);

  const handleAngleMode = useCallback(() => {
    setAngleMode((mode) => {
      if (mode === "deg") return "rad";
      if (mode === "rad") return "grad";
      return "deg";
    });
  }, []);

  const handleHistorySelect = useCallback((result: string) => {
    setDisplay(result);
    setCalcState("input");
    setShowHistory(false);
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") appendDigit(e.key);
      else if (e.key === ".") appendDigit(".");
      else if (e.key === "+") performBinaryOp("add");
      else if (e.key === "-") performBinaryOp("subtract");
      else if (e.key === "*") performBinaryOp("multiply");
      else if (e.key === "/") {
        e.preventDefault();
        performBinaryOp("divide");
      }
      else if (e.key === "Enter" || e.key === "=") handleEquals();
      else if (e.key === "Escape") handleClear();
      else if (e.key === "Backspace") handleDelete();
      else if (e.key === "%") handleUnary("percent");
      else if (e.key === "(") handleParen("(");
      else if (e.key === ")") handleParen(")");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appendDigit, performBinaryOp, handleEquals, handleClear, handleDelete, handleUnary, handleParen]);

  // Button click handler
  const handleButton = useCallback(
    (id: string) => {
      // Second function mappings
      const secondMap: Record<string, string> = {
        sin: "asin",
        cos: "acos",
        tan: "atan",
        sinh: "asinh",
        cosh: "acosh",
        tanh: "atanh",
        square: "sqrt",
        cube: "cbrt",
        tenx: "log10",
        twox: "log2",
        exp: "ln",
      };

      const effectiveId =
        isSecond && secondMap[id] ? secondMap[id] : id;

      // Digits
      if (/^[0-9]$/.test(effectiveId)) {
        appendDigit(effectiveId);
        return;
      }
      if (effectiveId === "decimal") {
        appendDigit(".");
        return;
      }

      // Basic operators
      if (["add", "subtract", "multiply", "divide", "mod"].includes(effectiveId)) {
        performBinaryOp(effectiveId);
        return;
      }

      // Binary functions
      if (["power", "nthroot", "logyx", "npr", "ncr", "gcd", "lcm"].includes(effectiveId)) {
        handleBinaryFunction(effectiveId);
        return;
      }

      // Unary functions
      const unaryFns = [
        "sin", "cos", "tan", "asin", "acos", "atan",
        "sinh", "cosh", "tanh", "asinh", "acosh", "atanh",
        "ln", "log10", "log2",
        "sqrt", "cbrt", "square", "cube",
        "tenx", "twox", "exp",
        "reciprocal", "abs", "factorial", "percent",
        "floor", "ceil", "round",
        "deg2rad", "rad2deg",
      ];
      if (unaryFns.includes(effectiveId)) {
        handleUnary(effectiveId);
        return;
      }

      // Constants
      if (["pi", "e", "ans", "rand"].includes(effectiveId)) {
        handleConstant(effectiveId);
        return;
      }

      // Special
      switch (effectiveId) {
        case "clear":
          handleClear();
          break;
        case "delete":
          handleDelete();
          break;
        case "equals":
          handleEquals();
          break;
        case "negate":
          handleNegate();
          break;
        case "scinotation":
          handleScientificNotation();
          break;
        case "lparen":
          handleParen("(");
          break;
        case "rparen":
          handleParen(")");
          break;
        case "second":
          setIsSecond((s) => !s);
          break;
        case "mc":
          handleMemoryClear();
          break;
        case "mr":
          handleMemoryRecall();
          break;
        case "mplus":
          handleMemoryAdd();
          break;
        case "mminus":
          handleMemorySubtract();
          break;
        case "anglemode":
          handleAngleMode();
          break;
      }
    },
    [
      isSecond,
      appendDigit,
      performBinaryOp,
      handleBinaryFunction,
      handleUnary,
      handleConstant,
      handleClear,
      handleDelete,
      handleEquals,
      handleNegate,
      handleScientificNotation,
      handleParen,
      handleMemoryClear,
      handleMemoryRecall,
      handleMemoryAdd,
      handleMemorySubtract,
      handleAngleMode,
    ]
  );

  // Button config
  type Btn = {
    id: string;
    label: string;
    secondLabel?: string;
    variant: ButtonVariant;
    className?: string;
  };

  const memoryRow: Btn[] = [
    { id: "mc", label: "MC", variant: "memory" },
    { id: "mr", label: "MR", variant: "memory" },
    { id: "mplus", label: "M+", variant: "memory" },
    { id: "mminus", label: "M\u2212", variant: "memory" },
    { id: "second", label: "2nd", variant: "memory" },
    { id: "anglemode", label: angleMode.toUpperCase(), variant: "memory" },
  ];

  const scientificRows: Btn[][] = [
    [
      { id: "sin", label: "sin", secondLabel: "sin\u207B\u00B9", variant: "function" },
      { id: "cos", label: "cos", secondLabel: "cos\u207B\u00B9", variant: "function" },
      { id: "tan", label: "tan", secondLabel: "tan\u207B\u00B9", variant: "function" },
      { id: "sinh", label: "sinh", secondLabel: "sinh\u207B\u00B9", variant: "function" },
      { id: "cosh", label: "cosh", secondLabel: "cosh\u207B\u00B9", variant: "function" },
      { id: "tanh", label: "tanh", secondLabel: "tanh\u207B\u00B9", variant: "function" },
    ],
    [
      { id: "power", label: "x\u02B8", variant: "function" },
      { id: "square", label: "x\u00B2", secondLabel: "\u221A", variant: "function" },
      { id: "cube", label: "x\u00B3", secondLabel: "\u00B3\u221A", variant: "function" },
      { id: "tenx", label: "10\u02E3", secondLabel: "log", variant: "function" },
      { id: "twox", label: "2\u02E3", secondLabel: "log\u2082", variant: "function" },
      { id: "exp", label: "e\u02E3", secondLabel: "ln", variant: "function" },
    ],
    [
      { id: "reciprocal", label: "1/x", variant: "function" },
      { id: "abs", label: "|x|", variant: "function" },
      { id: "factorial", label: "n!", variant: "function" },
      { id: "nthroot", label: "\u02B8\u221Ax", variant: "function" },
      { id: "logyx", label: "log\u2099x", variant: "function" },
      { id: "scinotation", label: "EXP", variant: "function" },
    ],
    [
      { id: "npr", label: "nPr", variant: "function" },
      { id: "ncr", label: "nCr", variant: "function" },
      { id: "gcd", label: "gcd", variant: "function" },
      { id: "lcm", label: "lcm", variant: "function" },
      { id: "floor", label: "\u230A\u230B", variant: "function" },
      { id: "ceil", label: "\u2308\u2309", variant: "function" },
    ],
    [
      { id: "round", label: "rnd", variant: "function" },
      { id: "deg2rad", label: "D\u2192R", variant: "function" },
      { id: "rad2deg", label: "R\u2192D", variant: "function" },
      { id: "pi", label: "\u03C0", variant: "function" },
      { id: "e", label: "e", variant: "function" },
      { id: "rand", label: "Rand", variant: "function" },
    ],
  ];

  const mainRows: Btn[][] = [
    [
      { id: "clear", label: "AC", variant: "action" },
      { id: "delete", label: "DEL", variant: "action" },
      { id: "percent", label: "%", variant: "function" },
      { id: "mod", label: "mod", variant: "operator" },
      { id: "divide", label: "\u00F7", variant: "operator" },
    ],
    [
      { id: "lparen", label: "(", variant: "function" },
      { id: "rparen", label: ")", variant: "function" },
      { id: "7", label: "7", variant: "number" },
      { id: "8", label: "8", variant: "number" },
      { id: "9", label: "9", variant: "number" },
    ],
    [
      { id: "negate", label: "+/\u2212", variant: "function" },
      { id: "ans", label: "Ans", variant: "function" },
      { id: "4", label: "4", variant: "number" },
      { id: "5", label: "5", variant: "number" },
      { id: "6", label: "6", variant: "number" },
    ],
    [
      { id: "multiply", label: "\u00D7", variant: "operator" },
      { id: "subtract", label: "\u2212", variant: "operator" },
      { id: "1", label: "1", variant: "number" },
      { id: "2", label: "2", variant: "number" },
      { id: "3", label: "3", variant: "number" },
    ],
    [
      { id: "add", label: "+", variant: "operator" },
      { id: "0", label: "0", variant: "number", className: "col-span-2" },
      { id: "decimal", label: ".", variant: "number" },
      { id: "equals", label: "=", variant: "equals" },
    ],
  ];

  const cycleTheme = useCallback(() => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("black");
    else setTheme("light");
  }, [theme, setTheme]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col gap-2.5 rounded-2xl border border-border bg-card p-3.5 shadow-2xl shadow-primary/5 sm:p-4">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <h1 className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
          SCI-CALC
        </h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowHistory(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Show history"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={cycleTheme}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : theme === "dark" ? (
              <SunMoon className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
            <span className="font-mono font-semibold uppercase text-[11px]">
              {theme}
            </span>
          </button>
        </div>
      </div>

      {/* Display */}
      <CalculatorDisplay
        expression={expression}
        result={display}
        angleMode={angleMode}
        isSecond={isSecond}
        memory={memory}
      />

      {/* Memory row */}
      <div className="grid grid-cols-6 gap-1">
        {memoryRow.map((btn) => (
          <CalculatorButton
            key={btn.id}
            label={btn.label}
            variant={btn.variant}
            onClick={() => handleButton(btn.id)}
          />
        ))}
      </div>

      {/* Scientific functions */}
      <div className="flex flex-col gap-1">
        {scientificRows.map((row, ri) => (
          <div key={`sci-${ri}`} className="grid grid-cols-6 gap-1">
            {row.map((btn) => (
              <CalculatorButton
                key={btn.id}
                label={btn.label}
                secondLabel={btn.secondLabel}
                isSecond={isSecond}
                variant={btn.variant}
                onClick={() => handleButton(btn.id)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-border/60" />

      {/* Main buttons */}
      <div className="flex flex-col gap-1.5">
        {mainRows.map((row, ri) => (
          <div key={`main-${ri}`} className="grid grid-cols-5 gap-1.5">
            {row.map((btn, bi) => (
              <CalculatorButton
                key={btn.id + bi}
                label={btn.label}
                secondLabel={btn.secondLabel}
                isSecond={isSecond}
                variant={btn.variant}
                onClick={() => handleButton(btn.id)}
                className={btn.className}
              />
            ))}
          </div>
        ))}
      </div>

      {/* History overlay */}
      {showHistory && (
        <CalculatorHistory
          history={history}
          onSelect={handleHistorySelect}
          onClear={() => setHistory([])}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}

// Helper: get operator symbol
function getOpSymbol(op: string): string {
  switch (op) {
    case "add":
      return "+";
    case "subtract":
      return "\u2212";
    case "multiply":
      return "\u00D7";
    case "divide":
      return "\u00F7";
    case "mod":
      return "mod";
    default:
      return op;
  }
}

// Helper: get function label
function getFnLabel(fn: string): string {
  const labels: Record<string, string> = {
    sin: "sin",
    cos: "cos",
    tan: "tan",
    asin: "sin\u207B\u00B9",
    acos: "cos\u207B\u00B9",
    atan: "tan\u207B\u00B9",
    sinh: "sinh",
    cosh: "cosh",
    tanh: "tanh",
    asinh: "sinh\u207B\u00B9",
    acosh: "cosh\u207B\u00B9",
    atanh: "tanh\u207B\u00B9",
    ln: "ln",
    log10: "log",
    log2: "log\u2082",
    sqrt: "\u221A",
    cbrt: "\u00B3\u221A",
    square: "sqr",
    cube: "cube",
    power: "pow",
    nthroot: "root",
    logyx: "log",
    tenx: "10^",
    twox: "2^",
    exp: "e^",
    reciprocal: "1/",
    abs: "abs",
    factorial: "fact",
    percent: "%",
    floor: "floor",
    ceil: "ceil",
    round: "round",
    deg2rad: "D\u2192R",
    rad2deg: "R\u2192D",
    npr: "nPr",
    ncr: "nCr",
    gcd: "gcd",
    lcm: "lcm",
  };
  return labels[fn] || fn;
}
