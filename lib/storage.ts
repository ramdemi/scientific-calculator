import { type AngleMode } from "@/lib/rpn";
/**
 * LocalStorage-backed persistence for calculator state.
 */

export interface CustomFnDef {
  name: string;
  params: string[];
  body: string;
}

export interface HistoryEntry {
  expression: string;
  result: string;
}

const KEYS = {
  memory: "calc_memory",
  customFns: "calc_custom_fns",
  history: "calc_history",
  theme: "calc_theme",
  angleMode: "calc_angle_mode",
} as const;

export const storage = {
  getMemory: (): number => parseFloat(localStorage.getItem(KEYS.memory) || "0"),
  setMemory: (v: number): void => {
    localStorage.setItem(KEYS.memory, String(v));
  },

  getCustomFns: (): CustomFnDef[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.customFns) || "[]");
    } catch {
      return [];
    }
  },
  setCustomFns: (fns: CustomFnDef[]): void => {
    localStorage.setItem(KEYS.customFns, JSON.stringify(fns));
  },

  getHistory: (): HistoryEntry[] => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.history) || "[]");
    } catch {
      return [];
    }
  },
  addHistory: (exp: string, res: string): void => {
    const h = storage.getHistory();
    const entry = { expression: exp, result: res };
    h.unshift(entry);
    if (h.length > 50) h.length = 50;
    localStorage.setItem(KEYS.history, JSON.stringify(h));
  },
  clearHistory: (): void => {
    localStorage.removeItem(KEYS.history);
  },

  /*   getTheme: (): string => localStorage.getItem(KEYS.theme) || "dark",
  setTheme: (t: string): void => { localStorage.setItem(KEYS.theme, t); },
 */
  getAngleMode: (): string =>
    (localStorage.getItem(KEYS.angleMode) || "deg") as AngleMode,
  setAngleMode: (m: string): void => {
    localStorage.setItem(KEYS.angleMode, m);
  },
};
