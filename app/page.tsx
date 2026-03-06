import { ScientificCalculator } from "@/components/scientific-calculator";

export default function Home() {
  return (
    <main
      className="flex  min-h-screen max-h-full items-center justify-center bg-background"
      id="calculatorPage"
    >
      <div id="MainFunctionContainer">
        <ScientificCalculator />
      </div>
    </main>
  );
}
