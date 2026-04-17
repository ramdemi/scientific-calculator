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

import { CalculatorDisplay } from "./calculator-display";
import { CalculatorButton, type ButtonVariant } from "./calculator-button";
import { CalculatorHistory, type HistoryEntry } from "./calculator-history";
import { CalculatorDialogWrapper } from "./calculator-dialog-wrapper";
import { ScientificConstantDialog } from "./scientific-constants-dialog";
import { weps, fonks } from "../lib/imgs";
import {
  compute,
  FUNCTIONS,
  CONSTANTS,
  tokenize,
  parse,
  formatResult,
  type AngleMode,
} from "@/lib/rpn";
import { LayoutRouter } from "next/dist/server/app-render/entry-base";
import { set } from "date-fns";
type CalcState = "input" | "operator" | "result" | "error";

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
  var [prevResult, setprevResult] = useState(0);
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

  const handleClear = useCallback(() => {
    setDisplay("0");
    setExpression("");
    setPrevValue(null);
    setPendingOp(null);
    setPendingBinaryFn(null);
    setCalcState("input");
    setOpenParens(0);
    setParenStack([]);
    setprevResult(0);
  }, []);

  const handleDelete = useCallback(() => {
    if (calcState === "result" || calcState === "error") {
      handleClear();
      return;
    }
    if (display.length <= 1 || display === "0") {
      setDisplay("0");
    } else {
      !expression.includes("?") && setExpression(expression.slice(0, -1));
      setDisplay(formatResult(compute(expression.slice(0, -1), angleMode)));
    }
  }, [display, expression, calcState, handleClear]);

  const handleEquals = useCallback(() => {
    const current = currentValue();
    let result: number;
    let expr: string;

    result = current;
    expr = expression;

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

  const handleNegate = useCallback(() => {
    if (display === "0") return;
    if (display.startsWith("-")) {
      setDisplay(display.slice(1));
    } else {
      setDisplay("-" + display);
    }
  }, [display]);

  // Memory functions
  const handleMemoryClear = useCallback(() => setMemory(0), []);
  const handleMemoryRecall = useCallback(() => {
    setExpression(expression + formatResult(memory));
    setDisplay(
      formatResult(compute(expression + formatResult(memory), angleMode)),
    );
    //setCalcState("input");
  }, [expression, memory]);
  const handleMemoryAdd = useCallback(() => {
    setMemory((m) => m + currentValue());
  }, [currentValue]);
  const handleMemorySubtract = useCallback(() => {
    setMemory((m) => m - currentValue());
  }, [currentValue]);
  const handleMemoryStore = useCallback(() => {
    setMemory((m) => currentValue());
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
      /*      if (e.key >= "0" && e.key <= "9") appendDigit(e.key);
      else if (e.key === ".") appendDigit(".");
      else if (e.key === "+") performBinaryOp("add");
      else if (e.key === "-") performBinaryOp("subtract");
      else if (e.key === "*") performBinaryOp("multiply");
      else if (e.key === "/") {
        e.preventDefault();
        performBinaryOp("divide");} */
      if (e.key === "Enter" || e.key === "=") handleEquals();
      else if (e.key === "Escape") handleClear();
      else if (e.key === "Backspace") handleDelete();
      /*       else if (e.key === "%") handleUnary("percent");
      else if (e.key === "(") handleParen("(");
      else if (e.key === ")") handleParen(")"); */
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEquals, handleClear, handleDelete]);

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
        sqrt: "cbrt",
        Log: "tenx",
        twox: "log2",
        Ln: "exp",
        pow: "nthroot",
        XPowerBy1Negative: "fact",
        ParenthesesOpen: "percent",
        Multiply: "npr",
        Divide: "ncr",
        Exp: "pi",
        Dot: "rand",
        //rand: "floor",
        //rando: "ceil",
        MPlus: "mminus",
        TimeUnit: "Fact",
        Num7: "consts",
        Num0: "memin",
      };
      // alpha function mapping
      const alphaMap: Record<string, string> = {
        ENG: "cot",
        ParenthesesOpen: "acot",
        Multiply: "gcd",
        Divide: "lcm",
        Exp: "e",
        Dot: "ranit",
        sqrt: "mod",
        Plus: "floor",
        Minus: "ceil",
        MPlus: "mrcall",
        Num0: "memremove",
      };
      let ef = id.slice(6);
      const effectiveId =
        calcMode == "SHIFT" && shiftMap[ef]
          ? shiftMap[ef]
          : calcMode == "ALPHA" && alphaMap[ef]
            ? alphaMap[ef]
            : ef;
      let rep: string = "";
      if (effectiveId === "Exp") {
        /(\d)$/.test(expression) && setExpression(expression + "E");
        return;
      }

      if (/^[\+\-]?\d*\.?\d+(?:[Ee][\+\-]?\d+)?$/.test(effectiveId)) {
        //
      }
      // Digits
      if (/(m\d)$/.test(effectiveId)) {
        ef = effectiveId.slice(-1);
      }
      if (effectiveId === "Dot") {
        ef = ".";
      }

      //out unknown variable mode with Calculator right arrow button deletes question mark.
      if (effectiveId == "NavigateRight") {
        if (expression.indexOf("?") > -1) {
          rep = expression.replace("?", "");
          ef = "";
        }
      }

      // Basic operators
      if (["Plus", "Minus", "Multiply", "Divide", "mod"].includes(effectiveId))
        ef = getOpSymbol(effectiveId);

      //function handling
      if (effectiveId.toLowerCase() in FUNCTIONS) {
        setcalcMode("DEFAULT");
        if (effectiveId === "Squared" || effectiveId === "cube") {
          ef = /(\d)$/.test(expression)
            ? getFnLabel(effectiveId)
            : "?" + getFnLabel(effectiveId);
        }
        effectiveId === "pow" ? (ef = "(?)^?") : "";
        if (effectiveId === "XPowerBy1Negative") {
          ef = /(\d)$/.test(expression)
            ? getFnLabel(effectiveId)
            : "?" + getFnLabel(effectiveId);
        }

        if (
          [
            "XPowerByY",
            "nthroot",
            "logb",
            "npr",
            "ncr",
            "gcd",
            "lcm",
            "ranit",
            "mod",
          ].includes(effectiveId)
        ) {
          ef = effectiveId + "(?,?)";
        } else {
          ["pow", "cube", "Squared", "XPowerBy1Negative"].indexOf(effectiveId) <
            0 && (ef = effectiveId + "(?)");
          if (effectiveId === "rand") ef = "rand()";
        }
        setExpression(`${expression}${ef}`);
      }

      // add values to unkkwon variables
      if (expression.indexOf("?") > -1 && ef != "" && ef !== "Delete") {
        rep = expression.replace("?", ef + "?");
        ef = "";
      }

      ef == "" && setExpression(() => `${rep}`);
      ef.length == 1 && setExpression(`${expression}${ef}`);

      // Hamdle builtin constants
      if (effectiveId == "pi" || effectiveId == "e") {
        ef = effectiveId;
        setExpression(`${expression}${ef}`);
      }
      if (ef == "" || ef.length <= 2 || ["\^ -1", "rand()"].includes(ef)) {
        try {
          const result = compute(
            ef == "" ? `${rep}` : `${expression}${ef}`,
            angleMode,
          );
          if (!isNaN(result)) setprevResult(result);
          setcalcMode(isNaN(result) ? "ERROR" : "DEFAULT");
          const formatted = formatResult(isNaN(result) ? prevResult : result);
          setDisplay(formatted);
        } catch (error) {
          console.log(error);
          setcalcMode("Error ");
        }
      }

      /*Hyperbolic Functions  Dialogs */
      if (effectiveId === "Hyp") {
        //dilog();
        diaName = "hypDialog";
        const dialog = document.getElementById(diaName);
        if (dialog && typeof dialog.showModal === "function")
          dialog.showModal();
      }

      /*Hyperbolic Constants Dialogs */
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
          //handleScientificNotation();
          break;
        case "ParenthesesOpen":
          //handleParen("(");
          break;
        case "ParenthesesClose":
          //handleParen(")");
          break;
        case "Shift":
        case "Alpha":
          calcMode === "DEFAULT"
            ? setcalcMode(effectiveId.toUpperCase())
            : setcalcMode("DEFAULT");
          break;
        case "memremove":
          handleMemoryClear();
          break;
        case "mrcall":
          handleMemoryRecall();
          break;
        case "MPlus":
          handleMemoryAdd();
          break;
        case "mminus":
          handleMemorySubtract();
          break;
        case "memin":
          handleMemoryStore();
          break;
        case "Mode":
          handleAngleMode();
          break;
      }
    },
    [
      prevResult,
      expression,
      calcMode,
      handleClear,
      handleDelete,
      handleEquals,
      handleNegate,
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
        <div className="flex justify-between items-center border-[3px] gap-1">
          <h1
            className="font-mono text-xs font-bold text-primary tracking-widest uppercase"
            title="out unknown variable mode with Calculator right arrow button deletes question mark."
            onClick={() => document.getElementById("guppy1")?.focus()}
          >
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
        <div id="keyboardWrapper" className="calculator-surface">
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
      return "-"; //"\u2212";
    case "Multiply":
      return "*"; //"\u00D7";
    case "Divide":
      return "/"; //"\u00F7";
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
    sqrt: "sqrt",
    cbrt: "cbrt",
    Squared: "^2", //"sqr",
    cube: "^3", //"cube",
    power: "pow",
    nthroot: "root",
    logyx: "log",
    tenx: "10^",
    twox: "2^",
    exp: "e^",
    XPowerBy1Negative: "^ -1",
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
