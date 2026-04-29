// ─── Types ────────────────────────────────────────────────────────────────────
export type AngleMode = "deg" | "rad" | "grad";
type Assoc = "L" | "R";

import { storage } from "./storage";

interface NumToken {
  type: "num";
  value: number;
}
interface OpToken {
  type: "op";
  value: string;
  precedence: number;
  assoc: Assoc;
  fn: (a: number, b: number) => number;
}
interface FuncToken {
  type: "func";
  value: string;
  arity?: number;
}
interface UnaryToken {
  type: "unary";
  value: "-";
  precedence: number;
  assoc: Assoc;
}
interface LParenToken {
  type: "lparen";
}
interface RParenToken {
  type: "rparen";
}
interface CommaToken {
  type: "comma";
}

type Token =
  | NumToken
  | OpToken
  | FuncToken
  | UnaryToken
  | LParenToken
  | RParenToken
  | CommaToken;
type RPNToken = NumToken | OpToken | FuncToken | UnaryToken | CommaToken;

// ─── Constants ────────────────────────────────────────────────────────────────
export const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
  phi: (1 + Math.sqrt(5)) / 2,
  inf: Infinity,
  tau: 2 * Math.PI,
  degto: Math.PI / 180,
  gradto: Math.PI / 200,
  radto: 1,
  x: 0,
};

let anglemul: number = 1;
// ─── Operators ────────────────────────────────────────────────────────────────
const OPERATORS: Record<
  string,
  { precedence: number; assoc: Assoc; fn: (a: number, b: number) => number }
> = {
  "+": { precedence: 2, assoc: "L", fn: (a, b) => a + b },
  "-": { precedence: 2, assoc: "L", fn: (a, b) => a - b },
  "*": { precedence: 3, assoc: "L", fn: (a, b) => a * b },
  "/": { precedence: 3, assoc: "L", fn: (a, b) => a / b },
  "%": { precedence: 3, assoc: "L", fn: (a, b) => a % b },
  "^": { precedence: 4, assoc: "R", fn: (a, b) => Math.pow(a, b) },
  "//": { precedence: 3, assoc: "L", fn: (a, b) => Math.floor(a / b) },
};

// ─── Custom Functions ────────────────────────────────────────────────────────────
export function addCustomFunction(
  name: string,
  args: string[],
  fn: string,
): void {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    throw new Error("Invalid function name");
  }

  // Create a function that takes an array of arguments and maps them to parameter names
  FUNCTIONS[name] = (argArray: number[]) => {
    // Create parameter bindings
    const paramBindings: Record<string, number> = {};
    args.forEach((param, index) => {
      paramBindings[param] = argArray[index] ?? 0;
    });

    // Replace parameter names in the formula with their values
    let processedFormula = fn;
    for (const [param, value] of Object.entries(paramBindings)) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${param}\\b`, "g");
      processedFormula = processedFormula.replace(regex, value.toString());
    }

    // Evaluate the processed formula
    return compute(processedFormula);
  };

  // Persist to storage
  const customFns = storage.getCustomFns();
  const existing = customFns.findIndex((f) => f.name === name);
  const fnDef = { name, params: args, body: fn };

  if (existing !== -1) {
    customFns[existing] = fnDef;
  } else {
    customFns.push(fnDef);
  }
  storage.setCustomFns(customFns);
}

export function removeCustomFunction(name: string): boolean {
  const removed = delete FUNCTIONS[name];

  // Remove from storage
  const customFns = storage.getCustomFns();
  const filtered = customFns.filter((f) => f.name !== name);
  storage.setCustomFns(filtered);

  return removed;
}

export function loadCustomFunctions(): void {
  const customFns = storage.getCustomFns();
  for (const fn of customFns) {
    try {
      // Create a function that takes an array of arguments and maps them to parameter names
      FUNCTIONS[fn.name] = (argArray: number[]) => {
        // Create parameter bindings
        const paramBindings: Record<string, number> = {};
        fn.params.forEach((param, index) => {
          paramBindings[param] = argArray[index] ?? 0;
        });

        // Replace parameter names in the formula with their values
        let processedFormula = fn.body;
        for (const [param, value] of Object.entries(paramBindings)) {
          // Use word boundaries to avoid partial matches
          const regex = new RegExp(`\\b${param}\\b`, "g");
          processedFormula = processedFormula.replace(regex, value.toString());
        }

        // Evaluate the processed formula
        return compute(processedFormula);
      };
    } catch (error) {
      console.error(`Failed to load custom function "${fn.name}":`, error);
    }
  }
}

// ─── 52 Scientific Functions ──────────────────────────────────────────────────
export const FUNCTIONS: Record<string, (args: number[]) => number> = {
  // Trigonometry (degrees)
  sin: ([x]) => Math.sin(x * anglemul),
  cos: ([x]) => Math.cos(x * anglemul),
  tan: ([x]) => Math.tan(x * anglemul),
  cot: ([x]) => 1 / Math.tan(x * anglemul),
  sec: ([x]) => 1 / Math.cos(x * anglemul),
  csc: ([x]) => 1 / Math.sin(x * anglemul),
  // Inverse trig (returns degrees)
  asin: ([x]) => Math.asin(x) / anglemul,
  acos: ([x]) => Math.acos(x) / anglemul,
  atan: ([x]) => Math.atan(x) / anglemul,
  acot: ([x]) => Math.atan(1 / x) / anglemul,
  atan2: ([y, x]) => Math.atan2(y, x) / anglemul,
  // Hyperbolic
  sinh: ([x]) => Math.sinh(x),
  cosh: ([x]) => Math.cosh(x),
  tanh: ([x]) => Math.tanh(x),
  asinh: ([x]) => Math.asinh(x),
  acosh: ([x]) => Math.acosh(x),
  atanh: ([x]) => Math.atanh(x),
  // Logarithms & exponentials
  log: ([x]) => Math.log10(x),
  log2: ([x]) => Math.log2(x),
  ln: ([x]) => Math.log(x),
  logb: ([b, x]) => Math.log(x) / Math.log(b),
  exp: ([x]) => Math.exp(x),
  exp2: ([x]) => Math.pow(2, x),
  pow: ([b, e]) => Math.pow(b, e),
  // Roots & powers
  sqrt: ([x]) => Math.sqrt(x),
  cbrt: ([x]) => Math.cbrt(x),
  nthroot: ([n, x]) => Math.pow(x, 1 / n),
  xpowerby1negative: ([x]) => Math.pow(x, -1),
  squared: ([x]) => x * x,
  cube: ([x]) => x * x * x,
  tenx: ([x]) => Math.pow(10, x),
  hypot: ([a, b]) => Math.hypot(a, b),
  // Rounding
  abs: ([x]) => Math.abs(x),
  ceil: ([x]) => Math.ceil(x),
  floor: ([x]) => Math.floor(x),
  round: ([x]) => Math.round(x),
  trunc: ([x]) => Math.trunc(x),
  frac: ([x]) => x - Math.trunc(x),
  sign: ([x]) => Math.sign(x),
  // Number theory
  gcd: ([a, b]) => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  },
  lcm: ([a, b]) => {
    let x = Math.abs(a),
      y = Math.abs(b);
    while (y) {
      [x, y] = [y, x % y];
    }
    return Math.abs(a * b) / x;
  },
  fact: ([n]) => {
    if (n < 0 || !Number.isInteger(n)) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  },
  npr: ([n, r]) => {
    let res = 1;
    for (let i = 0; i < r; i++) res *= n - i;
    return res;
  },
  ncr: ([n, r]) => {
    let num = 1,
      den = 1;
    for (let i = 0; i < r; i++) {
      num *= n - i;
      den *= i + 1;
    }
    return num / den;
  },
  mod: ([a, b]) => ((a % b) + b) % b,
  // Statistics & misc
  max: (args) => Math.max(...args),
  min: (args) => Math.min(...args),
  sum: (args) => args.reduce((a, b) => a + b, 0),
  avg: (args) => args.reduce((a, b) => a + b, 0) / args.length,
  clamp: ([x, lo, hi]) => Math.max(lo, Math.min(hi, x)),
  lerp: ([a, b, t]) => a + (b - a) * t,
  // Conversion
  deg: ([r]) => r / anglemul,
  rad: ([d]) => d * anglemul,
  // Random
  rand: ([]) => Math.random(),
  ranit: ([a, b]) => Math.floor(Math.random() * (b - a + 1)) + a,
};

// ─── Tokenizer ────────────────────────────────────────────────────────────────
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = expr.trim();

  while (i < src.length) {
    if (/\s/.test(src[i])) {
      i++;
      continue;
    }

    // Floor division
    if (src.slice(i, i + 2) === "//") {
      tokens.push({ type: "op", value: "//", ...OPERATORS["//"] });
      i += 2;
      continue;
    }

    // Numbers (including scientific notation)
    if (/[0-9]/.test(src[i]) || (src[i] === "." && /[0-9]/.test(src[i + 1]))) {
      let num = "";
      while (i < src.length && /[0-9._]/.test(src[i])) {
        num += src[i] === "_" ? "" : src[i];
        i++;
      }
      if (i < src.length && (src[i] === "e" || src[i] === "E")) {
        num += src[i++];
        if (i < src.length && (src[i] === "+" || src[i] === "-"))
          num += src[i++];
        while (i < src.length && /[0-9]/.test(src[i])) num += src[i++];
      }
      tokens.push({ type: "num", value: parseFloat(num) });
      continue;
    }

    // Identifiers (functions and constants)
    if (/[a-zA-Z_]/.test(src[i])) {
      let word = "";
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) word += src[i++];
      if (FUNCTIONS[word]) tokens.push({ type: "func", value: word });
      else if (CONSTANTS[word] !== undefined)
        tokens.push({ type: "num", value: CONSTANTS[word] });
      else throw new Error(`Unknown identifier: "${word}"`);
      continue;
    }

    if (src[i] === "(") {
      tokens.push({ type: "lparen" });
      i++;
      continue;
    }
    if (src[i] === ")") {
      tokens.push({ type: "rparen" });
      i++;
      continue;
    }
    if (src[i] === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }

    if (OPERATORS[src[i]]) {
      const prev = tokens[tokens.length - 1];
      const isUnary =
        !prev ||
        prev.type === "op" ||
        prev.type === "lparen" ||
        prev.type === "comma";
      if (isUnary && src[i] === "-") {
        tokens.push({ type: "unary", value: "-", precedence: 5, assoc: "R" });
      } else if (isUnary && src[i] === "+") {
        // ignore unary plus
      } else {
        tokens.push({ type: "op", value: src[i], ...OPERATORS[src[i]] });
      }
      i++;
      continue;
    }

    throw new Error(`Unexpected character: "${src[i]}"`);
  }
  return tokens;
}

// ─── Shunting-Yard with arity tracking ───────────────────────────────────────
function toRPNWithArity(tokens: Token[]): RPNToken[] {
  const output: RPNToken[] = [];
  const opStack: Token[] = [];
  const arityStack: [number][] = [];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];

    if (tok.type === "num") {
      output.push(tok);
      if (arityStack.length > 0)
        arityStack[arityStack.length - 1][0] = Math.max(
          arityStack[arityStack.length - 1][0],
          1,
        );
    } else if (tok.type === "func") {
      opStack.push({ ...tok });
    } else if (tok.type === "unary") {
      opStack.push({ type: "unary", value: "-", precedence: 5, assoc: "R" });
    } else if (tok.type === "op") {
      const op = OPERATORS[tok.value];
      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === "lparen") break;
        const topOp =
          top.type === "unary"
            ? { precedence: 5 }
            : top.type === "op"
              ? OPERATORS[top.value]
              : null;
        if (!topOp) break;
        if (
          topOp.precedence > op.precedence ||
          (topOp.precedence === op.precedence && op.assoc === "L")
        ) {
          output.push(opStack.pop() as RPNToken);
        } else break;
      }
      opStack.push({ ...tok, ...op });
    } else if (tok.type === "lparen") {
      opStack.push(tok);
      const prev = tokens[i - 1];
      if (prev && prev.type === "func") arityStack.push([1]);
    } else if (tok.type === "rparen") {
      const prev = tokens[i - 1];
      const isEmpty = prev && prev.type === "lparen";
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].type !== "lparen"
      ) {
        output.push(opStack.pop() as RPNToken);
      }
      if (opStack.length === 0) throw new Error("Mismatched parentheses");
      opStack.pop();
      if (opStack.length > 0 && opStack[opStack.length - 1].type === "func") {
        const funcTok = opStack.pop() as FuncToken;
        const arity = isEmpty
          ? 0
          : arityStack.length > 0
            ? arityStack.pop()![0]
            : 1;
        output.push({ ...funcTok, arity });
      } else if (arityStack.length > 0) {
        arityStack.pop();
      }
    } else if (tok.type === "comma") {
      while (
        opStack.length > 0 &&
        opStack[opStack.length - 1].type !== "lparen"
      ) {
        output.push(opStack.pop() as RPNToken);
      }
      if (arityStack.length > 0) arityStack[arityStack.length - 1][0]++;
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === "lparen") throw new Error("Mismatched parentheses");
    output.push(top as RPNToken);
  }

  return output;
}

// ─── RPN Evaluator ────────────────────────────────────────────────────────────
function evalRPNFull(rpn: RPNToken[]): number {
  const stack: number[] = [];

  for (const tok of rpn) {
    if (tok.type === "num") {
      stack.push(tok.value);
    } else if (tok.type === "comma") {
      // separator — no-op
    } else if (tok.type === "unary") {
      stack.push(-stack.pop()!);
    } else if (tok.type === "op") {
      const b = stack.pop()!;
      const a = stack.pop()!;
      stack.push(OPERATORS[tok.value].fn(a, b));
    } else if (tok.type === "func") {
      const fn = FUNCTIONS[tok.value];
      if (!fn) throw new Error(`Unknown function: ${tok.value}`);
      const arity = tok.arity ?? 1;
      const args: number[] = [];
      for (let j = 0; j < arity; j++) args.unshift(stack.pop()!);
      stack.push(fn(args));
    }
  }

  if (stack.length !== 1) throw new Error("Invalid expression");
  return stack[0];
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function parse(expr: string): RPNToken[] {
  return toRPNWithArity(tokenize(expr));
}

export function compute(expr: string, anglemode: string = "deg"): number {
  if (!expr.trim()) throw new Error("Empty expression");
  anglemul =
    anglemode === "deg"
      ? CONSTANTS.degto
      : anglemode === "rad"
        ? CONSTANTS.radto
        : CONSTANTS.gradto;

  return evalRPNFull(parse(expr.replaceAll("?", "").toLowerCase()));
}
export function formatResult(value: number): string {
  if (Number.isNaN(value)) return "Error";
  if (!Number.isFinite(value)) return value > 0 ? "Infinity" : "-Infinity";

  // Very large or very small numbers: scientific notation
  if (Math.abs(value) >= 1e15 || (Math.abs(value) < 1e-10 && value !== 0)) {
    return value.toExponential(10).replace(/\.?0+e/, "e");
  }

  // Regular numbers: up to 12 significant digits
  const str = value.toPrecision(12);
  // Remove trailing zeros after decimal point
  if (str.includes(".")) {
    return str.replace(/\.?0+$/, "");
  }
  return str;
}
