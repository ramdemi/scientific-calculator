"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, FunctionSquare } from "lucide-react";
import {
  addCustomFunction,
  removeCustomFunction,
  FUNCTIONS,
  compute,
  formatResult,
  type AngleMode,
} from "@/lib/rpn";
import { storage } from "@/lib/storage";
import { Label } from "@radix-ui/react-label";
import { se } from "date-fns/locale";

interface CustomFunction {
  name: string;
  params: string;
  body: string;
}
interface CustomFunctionsDialogProps {
  onSelect?: (name: string) => void;
}
const builtInFunctions = Object.keys(FUNCTIONS);

export function CustomFunctionsDialog({
  onSelect,
}: CustomFunctionsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [funcs, setFuncs] = useState<CustomFunction[]>([]);
  const [newName, setNewName] = useState("");
  const [newParams, setNewParams] = useState("");
  const [newBody, setNewBody] = useState("");
  const [error, setError] = useState("");
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");

  useEffect(() => {
    const fun = storage.getCustomFns() || [];
    setFuncs(
      fun.map((fn) => ({
        name: fn.name,
        params: fn.params.join(","),
        body: fn.body,
      })),
    );
  }, []);

  const refreshFunctions = () => {
    const custom = Object.keys(FUNCTIONS).filter(
      (name) => !builtInFunctions.includes(name),
    );
    setFuncs(
      custom.map((name, i) => ({
        name,
        params: i < funcs.length ? funcs[i].params : newParams,
        body: i < funcs.length ? funcs[i].body : newBody,
      })),
    );
  };

  const handleAdd = () => {
    setError("");
    if (!newName.trim()) {
      setError("Function name is required");
      return;
    }
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newName)) {
      setError("Invalid name. Use letters, numbers, underscores only");
      return;
    }
    if (!newBody.trim()) {
      setError("Function body is required");
      return;
    }
    try {
      /*       const testResult = compute(newFormula, angleMode);
      if (isNaN(testResult)) {
        setError("Formula evaluation failed");
        return;
      }
      const fn = (args: number[]) => {
        let formula = newFormula;
        const vars = ["x", "y", "z"];
        vars.forEach((v, i) => {
          if (args[i] !== undefined) {
            formula = formula.replace(
              new RegExp(`\\b${v}\\b`, "g"),
              String(args[i]),
            );
          }
        });
        return compute(formula, angleMode); 
      };*/
      const paramArr = newParams
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      const fn = newBody; // Store formula as string, compute on test
      addCustomFunction(newName, paramArr, fn);
      setNewName("");
      setNewBody("");
      refreshFunctions();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleDelete = (name: string) => {
    removeCustomFunction(name);
    refreshFunctions();
  };

  const handleTest = (formula: string) => {
    try {
      return formatResult(compute(formula, angleMode));
    } catch {
      return "Error";
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        aria-label="Custom functions"
      >
        <FunctionSquare className="h-3.5 w-3.5" />
        <span className="font-mono font-semibold uppercase text-[11px]">
          fn
        </span>
      </button>

      {isOpen && (
        <dialog
          id="customFunctionsDialog"
          open
          className="fixed inset-0 z-50 m-auto flex h-[80vh] w-[90vw] max-w-lg flex-col rounded-xl  p-6 shadow-2xl dark:border dark:border-border"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="flex items-center justify-between mb-4 ">
            <h2 className="text-lg font-semibold">Custom Functions</h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex gap-2 mx-2 mb-4">
            <input
              type="text"
              placeholder="Function name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-1/4 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              name="Parameters"
              placeholder="Params (x, y)"
              value={newParams}
              onChange={(e) => setNewParams(e.target.value)}
              className="w-1/4 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Formula (e.g., x^2 + 1)"
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
              className="w-23/50 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive mx-2 mb-2">{error}</p>
          )}

          <div className="flex gap-2 mx-2 mb-4">
            <select
              value={angleMode}
              onChange={(e) => setAngleMode(e.target.value as AngleMode)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="deg">Degrees</option>
              <option value="rad">Radians</option>
              <option value="grad">Gradians</option>
            </select>
            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
            {newBody && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">Test:</span>
                <span className="font-mono">{handleTest(newBody)}</span>
              </div>
            )}
          </div>

          <div className="flex-1 mx-2 overflow-auto">
            {funcs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No custom functions yet
              </p>
            ) : (
              <table className="w-full  text-sm">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Params</th>
                    <th className="pb-2 font-medium">Formula</th>
                    <th className="pb-2 font-medium w-20">Test</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {funcs.map((fn) => (
                    <tr
                      key={fn.name}
                      onClick={() => {
                        setIsOpen(false);
                        onSelect && onSelect("button" + fn.name);
                      }}
                      className="border-b"
                    >
                      <td className="py-2 font-mono">{fn.name}</td>
                      <td className="py-2 font-mono">{fn.params}</td>
                      <td className="py-2 font-mono text-muted-foreground">
                        {fn.body || "(x)"}
                      </td>
                      <td className="py-2 font-mono">
                        {fn.body ? handleTest(fn.body) : "-"}
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => handleDelete(fn.name)}
                          className="rounded-md p-1 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
