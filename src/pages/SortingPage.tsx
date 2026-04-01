import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import SpeedControl from "@/components/SpeedControl";
import {
  bubbleSort, insertionSort, selectionSort, mergeSort, quickSort,
  sortingAlgoInfo, type SortStep,
} from "@/lib/sortingAlgorithms";
import { useNavigate } from "react-router-dom";
import ComplexityPanel from "@/components/ComplexityPanel";
const algorithms = ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort", "Quick Sort"];
const algoFns: Record<string, (arr: number[]) => SortStep[]> = {
  "Bubble Sort": bubbleSort, "Insertion Sort": insertionSort, "Selection Sort": selectionSort,
  "Merge Sort": mergeSort, "Quick Sort": quickSort,
};

function generateRandomArray(size: number, max: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}

const SortingPage = () => {
  const [algo, setAlgo] = useState("Bubble Sort");
  const [array, setArray] = useState<number[]>(() => generateRandomArray(20, 100));
  const [currentStep, setCurrentStep] = useState<SortStep | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [customInput, setCustomInput] = useState("");
  const [inputMode, setInputMode] = useState<"random" | "custom">("random");
  const [arraySize, setArraySize] = useState(20);
  const timerRef = useRef<number | null>(null);
  const stepsRef = useRef<SortStep[]>([]);
  const stepIndexRef = useRef(0);
  const navigate = useNavigate();

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  }, []);

  const animate = useCallback(() => {
    if (stepIndexRef.current >= stepsRef.current.length) { stopAnimation(); return; }
    setCurrentStep(stepsRef.current[stepIndexRef.current]);
    stepIndexRef.current++;
    timerRef.current = window.setTimeout(animate, 50 * speed);
  }, [speed, stopAnimation]);

  const startSort = useCallback(() => {
    stopAnimation();
    const steps = algoFns[algo](array);
    stepsRef.current = steps;
    stepIndexRef.current = 0;
    setIsRunning(true);
    animate();
  }, [algo, array, animate, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setCurrentStep(null);
    if (inputMode === "random") setArray(generateRandomArray(arraySize, 100));
  }, [stopAnimation, inputMode, arraySize]);

  const handleCustomInput = () => {
    const parsed = customInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (parsed.length > 0) { setArray(parsed); setCurrentStep(null); }
  };

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const displayArray = currentStep?.array ?? array;
  const maxVal = Math.max(...displayArray, 1);
  const info = sortingAlgoInfo[algo];

  return (
    <AlgoLayout title="Sorting Algorithms">
      {/* Top: Controls bar */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Visualization - large area */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-5 h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Array Visualization</h3>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-warning inline-block" /> Comparing</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-destructive inline-block" /> Swapping</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-success inline-block" /> Sorted</span>
              </div>
            </div>
            <div className="flex-1 flex items-end gap-[2px] min-h-0">
              {displayArray.map((val, idx) => {
                const isComparing = currentStep?.comparing.includes(idx);
                const isSwapping = currentStep?.swapping.includes(idx);
                const isSorted = currentStep?.sorted.includes(idx);
                let barColor = "bg-sorting/40";
                if (isSorted) barColor = "bg-success";
                else if (isSwapping) barColor = "bg-destructive";
                else if (isComparing) barColor = "bg-warning";
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className={`w-full rounded-t-sm transition-all duration-100 ${barColor}`}
                      style={{ height: `${(val / maxVal) * 92}%` }} />
                    {displayArray.length <= 30 && (
                      <span className="text-[9px] text-muted-foreground mt-1 font-mono">{val}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right sidebar: controls */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Algorithm</h3>
            <div className="flex flex-wrap gap-1.5">
              {algorithms.map(a => (
                <button key={a} onClick={() => { setAlgo(a); stopAnimation(); setCurrentStep(null); }}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${algo === a ? "bg-sorting/20 text-sorting border border-sorting/30 font-medium" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Input</h3>
            <div className="flex gap-2">
              <button onClick={() => setInputMode("random")} className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${inputMode === "random" ? "bg-sorting/20 text-sorting border border-sorting/30" : "bg-secondary text-secondary-foreground"}`}>Random</button>
              <button onClick={() => setInputMode("custom")} className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${inputMode === "custom" ? "bg-sorting/20 text-sorting border border-sorting/30" : "bg-secondary text-secondary-foreground"}`}>Custom</button>
            </div>
            {inputMode === "random" ? (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Size: {arraySize}</label>
                <input type="range" min={5} max={50} value={arraySize} onChange={e => setArraySize(+e.target.value)} className="w-full accent-sorting" />
                <button onClick={() => { setArray(generateRandomArray(arraySize, 100)); setCurrentStep(null); }}
                  className="w-full py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Generate</button>
              </div>
            ) : (
              <div className="space-y-2">
                <input value={customInput} onChange={e => setCustomInput(e.target.value)} placeholder="e.g. 5,3,8,1,2"
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:border-sorting/50 focus:outline-none transition-colors" />
                <button onClick={handleCustomInput} className="w-full py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Set Array</button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
            <div className="flex gap-2">
              <button onClick={startSort} disabled={isRunning}
                className="flex-1 py-2 text-sm rounded-lg bg-sorting text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {isRunning ? "Running..." : "▶ Start"}
              </button>
              <button onClick={reset} className="flex-1 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Algorithm info full width */}
      <div className="mt-5 grid md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <h3 className="text-base font-semibold text-foreground">{algo}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{info.explanation}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Time Complexity</h4>
          <div className="grid grid-cols-3 gap-3">
            {(["best", "average", "worst"] as const).map(k => (
              <div key={k} className="text-center p-3 rounded-lg bg-secondary/50">
                <div className="text-xs text-muted-foreground capitalize">{k}</div>
                <div className="text-sm font-mono mt-1 text-sorting">{info.timeComplexity[k]}</div>
              </div>
            ))}
          </div>
        </div>
        {info.code && (
          <div className="rounded-xl border border-border bg-card p-5">
            <h4 className="text-sm font-semibold text-foreground mb-2">Pseudocode</h4>
            <pre className="text-[11px] font-mono text-muted-foreground bg-secondary/50 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">{info.code}</pre>
          </div>
        )}
      </div>
        <ComplexityPanel category="sorting" accentClass="text-sorting" />
    </AlgoLayout>
  );
};

export default SortingPage;
