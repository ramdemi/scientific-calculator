"use client";

import { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  SunMoon,
  History,
  FlipVertical,
  FlipHorizontal,
  Square,
} from "lucide-react";
import {
  evaluateUnary,
  evaluateBinary,
  formatResult,
  type AngleMode,
} from "@/lib/calculator";
import { CalculatorDisplay } from "./calculator-display";
import { CalculatorButton, type ButtonVariant } from "./calculator-button";
import { CalculatorHistory, type HistoryEntry } from "./calculator-history";
import { CalculatorDialogWrapper } from "./calculator-dialog-wrapper";
import { ScientificConstantDialog } from "./scientific-constants-dialog";
import { weps, fonks } from "../lib/imgs";
import { LayoutRouter } from "next/dist/server/app-render/entry-base";

type CalcState = "input" | "operator" | "result" | "error";

/* const dilog = (id: string) => {
  let dia = document.getElementById("hypDialog");
  if (dia?.hasAttribute("data-set")) {
    dia?.addEventListener(onmMouseDown, (e: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
      let cod =
        e.target.closest("li") != null &&
        e.target.closest("li").getAttribute("data-code");
      document.getElementById("hypDialog").close(); 
      console.log(cod);
      cod && handleButton("button" + cod);
    });

    console.log(id);
    //dia?.addEventListener(close,()=>console.log(value))
    dia?.removeAttribute("data-set");
  } 
};*/
export function ScientificCalculator() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState("AUTO");
  // Calculator state
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<string | null>(null);
  const [pendingBinaryFn, setPendingBinaryFn] = useState<string | null>(null);
  const [calcState, setCalcState] = useState<CalcState>("input");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  var [calcMode, setcalcMode] = useState("DEFAULT");
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

  let diaName: string = "";

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
    [display, calcState],
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
    [currentValue, pendingOp, prevValue, display, calcState],
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
    [currentValue],
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

    if (
      formatted === "Error" ||
      formatted === "Infinity" ||
      formatted === "-Infinity"
    ) {
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
    setHistory((prev) => [
      ...prev,
      { expression: `${expr} =`, result: formatted },
    ]);
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
    [currentValue, angleMode],
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
      if (id.length > 5) {
        value = eval(id);
      } else {
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
      }

      const formatted = formatResult(value);
      setDisplay(formatted);
      if (calcState === "result" || calcState === "error") {
        setExpression("");
      }
      setCalcState("input");
    },
    [lastAnswer, calcState],
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
        setParenStack((prev) => [
          ...prev,
          { value: prevValue ?? 0, op: pendingOp },
        ]);
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
    [openParens, currentValue, pendingOp, prevValue, parenStack],
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
      } else if (e.key === "Enter" || e.key === "=") handleEquals();
      else if (e.key === "Escape") handleClear();
      else if (e.key === "Backspace") handleDelete();
      else if (e.key === "%") handleUnary("percent");
      else if (e.key === "(") handleParen("(");
      else if (e.key === ")") handleParen(")");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    appendDigit,
    performBinaryOp,
    handleEquals,
    handleClear,
    handleDelete,
    handleUnary,
    handleParen,
  ]);

  // Button click handler
  const handleButton = useCallback(
    (id: string) => {
      if (document.getElementById(diaName)?.hasAttribute("open"))
        document.getElementById(diaName).close();
      // Second function mappings
      const shiftMap: Record<string, string> = {
        Sin: "asin",
        Cos: "acos",
        Tan: "atan",
        Hyp: "abs",
        sinh: "asinh",
        cosh: "acosh",
        tanh: "atanh",
        Squared: "cube",
        Root: "cbrt",
        Log: "tenx",
        twox: "log2",
        Ln: "exp",
        XPowerByY: "nthroot",
        XPowerBy1Negative: "factorial",
        ParenthesesOpen: "percent",
        Multiply: "npr",
        Divide: "ncr",
        Exp: "pi",
        Dot: "rand",
        rand: "floor",
        rando: "ceil",
        MPlus: "mminus",
        TimeUnit: "Fact",
        Num7: "consts",
      };

      const alphaMap: Record<string, string> = {
        ENG: "cot",
        ParenthesesOpen: "acot",
        Multiply: "gcd",
        Divide: "lcm",
        Exp: "e",
        Dot: "RanInt",
        Root: "mod",
      };
      let ef = id.slice(6);
      const effectiveId =
        calcMode == "SHIFT" && shiftMap[ef]
          ? shiftMap[ef]
          : calcMode == "ALPHA" && alphaMap[ef]
            ? alphaMap[ef]
            : ef;

      if (/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(effectiveId)) {
        handleConstant(effectiveId);
      }
      // Digits
      if (/(m\d)$/.test(effectiveId)) {
        appendDigit(effectiveId.slice(-1));
        return;
      }
      if (effectiveId === "Dot") {
        appendDigit(".");
        return;
      }

      // Basic operators
      if (
        ["Plus", "Minus", "Multiply", "Divide", "mod"].includes(effectiveId)
      ) {
        performBinaryOp(effectiveId);
        return;
      }

      // Binary functions
      if (
        [
          "XPowerByY",
          "nthroot",
          "LogAOfX",
          "npr",
          "ncr",
          "gcd",
          "lcm",
          "RanInt",
        ].includes(effectiveId)
      ) {
        handleBinaryFunction(effectiveId);
        return;
      }

      // Unary functions
      const unaryFns = [
        "Sin",
        "Cos",
        "Tan",
        "cot",
        "asin",
        "acos",
        "atan",
        "acot",
        "sinh",
        "cosh",
        "tanh",
        "coth",
        "arcsinh",
        "arccosh",
        "arctanh",
        "arccoth",
        "Ln",
        "Log",
        "log2",
        "Root",
        "cbrt",
        "Squared",
        "cube",
        "tenx",
        "twox",
        "exp",
        "XPowerBy1Negative",
        "abs",
        "factorial",
        "percent",
        "floor",
        "ceil",
        "round",
        "deg2rad",
        "rad2deg",
        "Fact",
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

      if (effectiveId === "Hyp") {
        //dilog();
        diaName = "hypDialog";
        const dialog = document.getElementById(diaName);
        if (dialog && typeof dialog.showModal === "function")
          dialog.showModal();
      }
      if (effectiveId === "consts") {
        //dilog();
        diaName = "scientificConstantDialog";
        const dialog = document.getElementById(diaName);
        if (dialog && typeof dialog.showModal === "function")
          dialog.showModal();
      }
      // Special
      switch (effectiveId) {
        case "Clear":
          handleClear();
          break;
        case "Delete":
          handleDelete();
          break;
        case "Equal":
          handleEquals();
          break;
        case "ChangeNumberSign":
          handleNegate();
          break;
        case "scinotation":
          handleScientificNotation();
          break;
        case "ParenthesesOpen":
          handleParen("(");
          break;
        case "ParenthesesClose":
          handleParen(")");
          break;
        case "Shift":
        case "Alpha":
          calcMode === "DEFAULT"
            ? setcalcMode(effectiveId.toUpperCase())
            : setcalcMode("DEFAULT");
          break;
        case "mc":
          handleMemoryClear();
          break;
        case "mr":
          handleMemoryRecall();
          break;
        case "MPlus":
          handleMemoryAdd();
          break;
        case "mminus":
          handleMemorySubtract();
          break;
        case "Mode":
          handleAngleMode();
          break;
      }
    },
    [
      calcMode,
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
    ],
  );
  function handleDataFromChild(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    console.log(e.clientX);
  }
  // Button config
  type Btn = {
    id: string;
    label: string;
    secondLabel?: string;
    variant: ButtonVariant;
    className?: string;
  };

  const cycleTheme = useCallback(() => {
    if (theme === "light") setTheme("dark");
    else setTheme("light");
  }, [theme, setTheme]);

  const cycleLayout = useCallback(() => {
    if (layout === "AUTO") setLayout("VERTICAL");
    else if (layout === "VERTICAL") {
      setLayout("HORIZONTAL");
    } else setLayout("AUTO");
    document
      .getElementById("calculatorPage")
      ?.setAttribute("data-calculator-layout", layout);
  }, [layout, setLayout]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div id="CalculatorContainer" className="">
      {/* Header */}
      <div
        id="calculator"
        className="calculator-container"
        calculator-mode={calcMode}
      >
        <div className="flex justify-between items-center  gap-1">
          <h1 className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
            SCI-CALC
          </h1>
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
            onClick={cycleLayout}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {layout === "VERTICAL" ? (
              <FlipVertical className="h-5 w-5" />
            ) : layout === "HORIZONTAL" ? (
              <FlipHorizontal className="h-5 w-5" />
            ) : (
              <Square className="h-5 w-5" />
            )}
            <span className="font-mono font-semibold uppercase text-[11px]">
              {layout}
            </span>
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

        {/* Display */}
        <CalculatorDisplay
          expression={expression}
          result={display}
          angleMode={angleMode}
          Modeis={calcMode}
          memory={memory}
        />
        <div id="keyboardWrapper">
          {/* Scientific functions */}
          <div className="grid grid-cols-6 gap-x-1.5 function-button-container">
            {fonks.slice(0, 30).map((btn, i) => (
              <CalculatorButton
                key={btn.id}
                bid={btn.id}
                variant={btn.variant}
                img1={weps[i * 3 + 0]}
                img2={weps[i * 3 + 1]}
                img3={weps[i * 3 + 2]}
                onClick={() => handleButton(btn.id)}
              />
            ))}
          </div>
          <div className="grid grid-cols-5 gap-1.5 number-button-container">
            {fonks.slice(30, 50).map((btn, i) => (
              <CalculatorButton
                key={btn.id}
                bid={btn.id}
                variant={btn.variant}
                img1={weps[i * 3 + 90]}
                img2={weps[i * 3 + 91]}
                img3={weps[i * 3 + 92]}
                onClick={() => handleButton(btn.id)}
              />
            ))}
          </div>
        </div>
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
      <div
        id="calculator-dialog-wrapper"
        className="z-10"
        onMouseDown={(e) => {
          let cod = "button";
          if (e.target.closest("li") !== null) {
            cod += e.target.closest("li").getAttribute("data-code");

            handleButton(cod.toLowerCase());
          }
        }}
      >
        <CalculatorDialogWrapper />
        <ScientificConstantDialog />
      </div>
    </div>
  );
}

// Helper: get operator symbol
function getOpSymbol(op: string): string {
  switch (op) {
    case "Plus":
      return "+";
    case "Minus":
      return "\u2212";
    case "Multiply":
      return "\u00D7";
    case "Divide":
      return "\u00F7";
    case "Mod":
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
    Root: "\u221A",
    cbrt: "\u00B3\u221A",
    Squared: "sqr",
    cube: "cube",
    power: "pow",
    nthroot: "root",
    logyx: "log",
    tenx: "10^",
    twox: "2^",
    exp: "e^",
    XPowerBy1Negative: "1/",
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
function keyMode(arg0: string, isit: boolean) {
  console.log(isit);
}

// The callback function that receives data from the child
