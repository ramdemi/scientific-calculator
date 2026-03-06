import { eventNames } from "node:cluster";
type Props = {
  onDataReceived: (dataToSend: string) => void;
};
export function HypDialog() {
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

  return (
    <div id="hyp-dialog">
      <dialog
        className="bg-transparent text-inherit undefined xs"
        data-position="center"
        data-set="tt"
        id="hypDialog"
      >
        <div className="dialog-box py-4 rounded-container">
          <header className="font-bold px-4 mb-2">
            <div>Hyperbolic</div>
          </header>
          <main className="px-4">
            <ul className="">
              {coms.map((hyp, i) => (
                <li key={"hyp" + i} data-code={hyp.id} className="list-item">
                  <div className="list-item-index">{i + 1} </div>
                  <div>
                    <div className="list-item-display">{hyp.id}(value)</div>
                    <div className="list-item-description">{hyp.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </main>
          <footer className="mt-3 px-4 flex items-center justify-end gap-2.5">
            <div>
              <button
                className="relative font-medium overflow-clip rounded inline-flex items-center justify-center !leading-[0.1rem] [&amp;>svg]:stroke-icon transition-all duration-element-react select-none focus-visible:ring-2 outline-none bg-neutral-token-4 text-neutral-token-13 border-neutral-token-4 border hover:bg-neutral-token-5 focus:ring-neutral-token-7 h-8 px-3 gap-1.5 [&amp;>svg]:size-icon-sm"
                value="close"
                onClick={() => document.getElementById("hypDialog")?.close()}
              >
                close
              </button>
            </div>
          </footer>
        </div>
      </dialog>
    </div>
  );
}
