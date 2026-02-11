// Scientific Calculator Engine - 52 functions

export type AngleMode = "deg" | "rad" | "grad";

export function toRadians(value: number, mode: AngleMode): number {
  switch (mode) {
    case "deg":
      return (value * Math.PI) / 180;
    case "grad":
      return (value * Math.PI) / 200;
    case "rad":
    default:
      return value;
  }
}

export function fromRadians(value: number, mode: AngleMode): number {
  switch (mode) {
    case "deg":
      return (value * 180) / Math.PI;
    case "grad":
      return (value * 200) / Math.PI;
    case "rad":
    default:
      return value;
  }
}

// Factorial
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  if (!Number.isInteger(n)) return gamma(n + 1);
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Gamma function (Lanczos approximation)
function gamma(z: number): number {
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) {
    x += c[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

// Permutation nPr
export function permutation(n: number, r: number): number {
  return factorial(n) / factorial(n - r);
}

// Combination nCr
export function combination(n: number, r: number): number {
  return factorial(n) / (factorial(r) * factorial(n - r));
}

// All 52 calculator functions:
// 1. sin, 2. cos, 3. tan, 4. asin, 5. acos, 6. atan
// 7. sinh, 8. cosh, 9. tanh, 10. asinh, 11. acosh, 12. atanh
// 13. ln, 14. log10, 15. log2, 16. exp, 17. sqrt, 18. cbrt
// 19. x^2, 20. x^3, 21. x^y, 22. 10^x, 23. 2^x, 24. e^x
// 25. 1/x, 26. |x|, 27. n!, 28. % (mod), 29. +/-, 30. pi
// 31. e, 32. ans, 33. rand, 34. floor, 35. ceil, 36. round
// 37. nPr, 38. nCr, 39. gcd, 40. lcm, 41. deg>rad, 42. rad>deg
// 43. (, 44. ), 45. +, 46. -, 47. *, 48. /
// 49. EXP (scientific notation), 50. x^(1/y) (yth root)
// 51. log_y(x) (log base y), 52. % (percentage)

export interface CalcFunction {
  id: string;
  label: string;
  secondLabel?: string;
  category: "trig" | "hyp" | "log" | "power" | "util" | "const" | "op" | "num";
  action: "unary" | "binary" | "constant" | "input" | "special";
}

export const CALC_FUNCTIONS: CalcFunction[] = [
  // Trig (6)
  { id: "sin", label: "sin", secondLabel: "sin\u207B\u00B9", category: "trig", action: "unary" },
  { id: "cos", label: "cos", secondLabel: "cos\u207B\u00B9", category: "trig", action: "unary" },
  { id: "tan", label: "tan", secondLabel: "tan\u207B\u00B9", category: "trig", action: "unary" },
  { id: "asin", label: "sin\u207B\u00B9", category: "trig", action: "unary" },
  { id: "acos", label: "cos\u207B\u00B9", category: "trig", action: "unary" },
  { id: "atan", label: "tan\u207B\u00B9", category: "trig", action: "unary" },

  // Hyperbolic (6)
  { id: "sinh", label: "sinh", secondLabel: "sinh\u207B\u00B9", category: "hyp", action: "unary" },
  { id: "cosh", label: "cosh", secondLabel: "cosh\u207B\u00B9", category: "hyp", action: "unary" },
  { id: "tanh", label: "tanh", secondLabel: "tanh\u207B\u00B9", category: "hyp", action: "unary" },
  { id: "asinh", label: "sinh\u207B\u00B9", category: "hyp", action: "unary" },
  { id: "acosh", label: "cosh\u207B\u00B9", category: "hyp", action: "unary" },
  { id: "atanh", label: "tanh\u207B\u00B9", category: "hyp", action: "unary" },

  // Logarithmic (4)
  { id: "ln", label: "ln", category: "log", action: "unary" },
  { id: "log10", label: "log", category: "log", action: "unary" },
  { id: "log2", label: "log\u2082", category: "log", action: "unary" },
  { id: "logyx", label: "log\u2099x", category: "log", action: "binary" },

  // Power & Root (8)
  { id: "sqrt", label: "\u221A", category: "power", action: "unary" },
  { id: "cbrt", label: "\u00B3\u221A", category: "power", action: "unary" },
  { id: "square", label: "x\u00B2", category: "power", action: "unary" },
  { id: "cube", label: "x\u00B3", category: "power", action: "unary" },
  { id: "power", label: "x\u02B8", category: "power", action: "binary" },
  { id: "nthroot", label: "\u02B8\u221Ax", category: "power", action: "binary" },
  { id: "tenx", label: "10\u02E3", category: "power", action: "unary" },
  { id: "twox", label: "2\u02E3", category: "power", action: "unary" },

  // Utility (10)
  { id: "exp", label: "e\u02E3", category: "util", action: "unary" },
  { id: "reciprocal", label: "1/x", category: "util", action: "unary" },
  { id: "abs", label: "|x|", category: "util", action: "unary" },
  { id: "factorial", label: "n!", category: "util", action: "unary" },
  { id: "percent", label: "%", category: "util", action: "unary" },
  { id: "negate", label: "+/-", category: "util", action: "special" },
  { id: "floor", label: "\u230A\u230B", category: "util", action: "unary" },
  { id: "ceil", label: "\u2308\u2309", category: "util", action: "unary" },
  { id: "round", label: "rnd", category: "util", action: "unary" },
  { id: "scinotation", label: "EXP", category: "util", action: "special" },

  // Combinatorics (4)
  { id: "npr", label: "nPr", category: "util", action: "binary" },
  { id: "ncr", label: "nCr", category: "util", action: "binary" },
  { id: "gcd", label: "gcd", category: "util", action: "binary" },
  { id: "lcm", label: "lcm", category: "util", action: "binary" },

  // Angle conversion (2)
  { id: "deg2rad", label: "D\u2192R", category: "util", action: "unary" },
  { id: "rad2deg", label: "R\u2192D", category: "util", action: "unary" },

  // Constants (4)
  { id: "pi", label: "\u03C0", category: "const", action: "constant" },
  { id: "e", label: "e", category: "const", action: "constant" },
  { id: "ans", label: "Ans", category: "const", action: "constant" },
  { id: "rand", label: "Rand", category: "const", action: "constant" },

  // Parentheses (2)
  { id: "lparen", label: "(", category: "op", action: "input" },
  { id: "rparen", label: ")", category: "op", action: "input" },

  // Basic operators (4)
  { id: "add", label: "+", category: "op", action: "binary" },
  { id: "subtract", label: "\u2212", category: "op", action: "binary" },
  { id: "multiply", label: "\u00D7", category: "op", action: "binary" },
  { id: "divide", label: "\u00F7", category: "op", action: "binary" },

  // Modulo (1)
  { id: "mod", label: "mod", category: "op", action: "binary" },
];

export function evaluateUnary(
  fn: string,
  value: number,
  angleMode: AngleMode
): number {
  switch (fn) {
    case "sin":
      return Math.sin(toRadians(value, angleMode));
    case "cos":
      return Math.cos(toRadians(value, angleMode));
    case "tan":
      return Math.tan(toRadians(value, angleMode));
    case "asin":
      return fromRadians(Math.asin(value), angleMode);
    case "acos":
      return fromRadians(Math.acos(value), angleMode);
    case "atan":
      return fromRadians(Math.atan(value), angleMode);
    case "sinh":
      return Math.sinh(value);
    case "cosh":
      return Math.cosh(value);
    case "tanh":
      return Math.tanh(value);
    case "asinh":
      return Math.asinh(value);
    case "acosh":
      return Math.acosh(value);
    case "atanh":
      return Math.atanh(value);
    case "ln":
      return Math.log(value);
    case "log10":
      return Math.log10(value);
    case "log2":
      return Math.log2(value);
    case "sqrt":
      return Math.sqrt(value);
    case "cbrt":
      return Math.cbrt(value);
    case "square":
      return value * value;
    case "cube":
      return value * value * value;
    case "tenx":
      return Math.pow(10, value);
    case "twox":
      return Math.pow(2, value);
    case "exp":
      return Math.exp(value);
    case "reciprocal":
      return 1 / value;
    case "abs":
      return Math.abs(value);
    case "factorial":
      return factorial(value);
    case "percent":
      return value / 100;
    case "floor":
      return Math.floor(value);
    case "ceil":
      return Math.ceil(value);
    case "round":
      return Math.round(value);
    case "deg2rad":
      return (value * Math.PI) / 180;
    case "rad2deg":
      return (value * 180) / Math.PI;
    default:
      return NaN;
  }
}

export function evaluateBinary(
  fn: string,
  a: number,
  b: number
): number {
  switch (fn) {
    case "power":
      return Math.pow(a, b);
    case "nthroot":
      return Math.pow(a, 1 / b);
    case "logyx":
      return Math.log(a) / Math.log(b);
    case "npr":
      return permutation(a, b);
    case "ncr":
      return combination(a, b);
    case "gcd":
      return gcd(a, b);
    case "lcm":
      return lcm(a, b);
    case "mod":
      return a % b;
    case "add":
      return a + b;
    case "subtract":
      return a - b;
    case "multiply":
      return a * b;
    case "divide":
      return a / b;
    default:
      return NaN;
  }
}

function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a: number, b: number): number {
  return Math.abs(a * b) / gcd(a, b);
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
