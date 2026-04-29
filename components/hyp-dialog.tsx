"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";

type HypDialogProps = {
  ispen?: boolean;
  onDataReceived: (data: string) => void;
};

export const HypDialog = forwardRef(function HypDialog(
  { ispen, onDataReceived }: HypDialogProps,
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const coms = [
    { id: "Sinh", desc: "Hyperbolic sine" },
    { id: "Cosh", desc: "Hyperbolic cosine" },
    { id: "Tanh", desc: "Hyperbolic tangent" },
    { id: "Coth", desc: "Hyperbolic cotangent" },
    { id: "ArcSinh", desc: "Hyperbolic arcsine" },
    { id: "ArcCosh", desc: "Hyperbolic arccosine" },
    { id: "ArcTanh", desc: "Hyperbolic arctangent" },
    { id: "ArcCoth", desc: "Hyperbolic Arccotangent" },
  ];

  // Parent can call functions on this dialog
  useImperativeHandle(ref, () => ({
    close() {
      dialogRef.current?.close();
    },
    open() {
      dialogRef.current?.showModal();
    },
  }));

  // Sync dialog open/close with parent prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (ispen) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [ispen]);

  // When user clicks an item
  const handleSelect = (value: string) => {
    onDataReceived(value); // send clicked item back to parent
    dialogRef.current?.close(); // optional auto-close
  };

  return (
    <div id="hyp-dialog">
      <dialog
        ref={dialogRef}
        className="bg-transparent text-inherit xs"
        data-position="center"
        data-set="tt"
      >
        <div className="dialog-box py-4 rounded-container">
          <header className="font-bold px-4 mb-2">
            <div>Hyperbolic</div>
          </header>

          <main className="px-4">
            <ul>
              {coms.map((hyp, i) => (
                <li
                  key={hyp.id}
                  className="list-item cursor-pointer"
                  onClick={() => handleSelect(hyp.id)}
                >
                  <div className="list-item-index">{i + 1}</div>
                  <div>
                    <div className="list-item-display">{hyp.id}(value)</div>
                    <div className="list-item-description">{hyp.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </main>

          <footer className="mt-3 px-4 flex items-center justify-end gap-2.5">
            <button
              className="relative font-medium rounded inline-flex items-center justify-center h-8 px-3"
              onClick={() => dialogRef.current?.close()}
            >
              close
            </button>
          </footer>
        </div>
      </dialog>
    </div>
  );
});
