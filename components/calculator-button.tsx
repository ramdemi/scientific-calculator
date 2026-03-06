"use client";

export type ButtonVariant =
  | "button-number"
  | "button-mode"
  | "button-function"
  | "button-shift"
  | "button-alpha"
  | "button-clear";

interface CalculatorButtonProps {
  bid: string;
  variant?: string;
  img1?: string;
  img2?: string;
  img3?: string;
  dataCalcId?: string;
  dataBind?: boolean;
  onClick: () => void;
}

export function CalculatorButton({
  bid,
  variant,
  img1,
  img2,
  img3,
  onClick,
}: CalculatorButtonProps) {
  return (
    <section
      id={bid}
      onClick={onClick}
      data-calc-id={bid}
      data-bind="true"
      className="flex flex-col select-none text-white"
    >
      <div className="flex justify-around button-top-label font-semibold">
        {img1 === "" ? (
          <img className="h-full" alt="" />
        ) : (
          <img
            className="h-full"
            alt=""
            src={`data:image/webp;base64, ${img1}`}
          />
        )}
        {img2 === "" ? (
          <img className="h-full" alt="" />
        ) : (
          <img
            className="h-full"
            alt=""
            src={`data:image/webp;base64, ${img2}`}
          />
        )}
      </div>
      <button aria-label={bid} className={`relative ${variant}`}>
        <img className="" alt="" src={`data:image/webp;base64,${img3}`} />
      </button>
    </section>
  );
}
