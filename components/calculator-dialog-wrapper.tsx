"use client";

import { useRef } from "react";
import { HypDialog } from "./hyp-dialog";
import { ScientificConstantsDialog } from "./scientific-constants-dialog";

interface CalculatorDialogWrapperProps {
  dialogOpen: string;
  onResult?: (value: string) => void;
}

export function CalculatorDialogWrapper({
  dialogOpen,
  onResult,
}: CalculatorDialogWrapperProps) {
  const dialogRef = useRef<any>(null);

  const handleDataReceived = (value: string) => {
    onResult?.(value); // send result to calculator
    dialogRef.current?.close();
  };

  return (
    <>
      {dialogOpen === "HypDialog" && (
        <HypDialog
          ref={dialogRef}
          ispen={true}
          onDataReceived={handleDataReceived}
        />
      )}

      {dialogOpen === "ScientificConstantsDialog" && (
        <ScientificConstantsDialog
          ref={dialogRef}
          isOpen={true}
          onDataReceived={handleDataReceived}
        />
      )}

      {/* Add more dialogs here */}
      {/* 
      {dialogOpen === "TrigDialog" && <TrigDialog ... />}
      {dialogOpen === "UnitsDialog" && <UnitsDialog ... />}
      */}
    </>
  );
}
