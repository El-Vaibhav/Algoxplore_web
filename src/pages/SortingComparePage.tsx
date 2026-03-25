import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import SpeedControl from "@/components/SpeedControl";
import {
  bubbleSort, insertionSort, selectionSort, mergeSort, quickSort,
  sortingAlgoInfo, type SortStep,
} from "@/lib/sortingAlgorithms";

const algorithms = ["Bubble Sort", "Insertion Sort", "Selection Sort", "Merge Sort", "Quick Sort"];
const algoFns: Record<string, (arr: number[]) => SortStep[]> = {
  "Bubble Sort": bubbleSort, "Insertion Sort": insertionSort, "Selection Sort": selectionSort,
  "Merge Sort": mergeSort, "Quick Sort": quickSort,
};

function generateRandomArray(size: number, max: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}

interface PanelState {
  algo: string;
  steps: SortStep[];
  stepIndex: number;
  currentStep: SortStep | null;
  totalSteps: number;
  done: boolean;
}

const SortingComparePage = () => {
  const [array, setArray] = useState<number[]>(() => generateRandomArray(20, 100));
  const [algoA, setAlgoA] = useState("Bubble Sort");
  const [algoB, setAlgoB] = useState("Quick Sort");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [arraySize, setArraySize] = useState(20);

  const [panelA, setPanelA] = useState<PanelState>({ algo: "Bubble Sort", steps: [], stepIndex: 0, currentStep: null, totalSteps: 0, done: false });
  const [panelB, setPanelB] = useState<PanelState>({ algo: "Quick Sort", steps: [], stepIndex: 0, currentStep: null, totalSteps: 0, done: false });

  const timerRef = useRef<number | null>(null);
  const panelARef = useRef<PanelState>(panelA);
  const panelBRef = useRef<PanelState>(panelB);
  panelARef.current = panelA;
  panelBRef.current = panelB;

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  }, []);

  const animate = useCallback(() => {
    const a = panelARef.current;
    const b = panelBRef.current;
    const aDone = a.stepIndex >= a.steps.length;
    const bDone = b.stepIndex >= b.steps.length;

    if (aDone && bDone) {
      setPanelA(prev => ({ ...prev, done: true }));
      setPanelB(prev => ({ ...prev, done: true }));
      setIsRunning(false);
      return;
    }

    if (!aDone) {
      setPanelA(prev => ({
        ...prev,
        currentStep: prev.steps[prev.stepIndex],
        stepIndex: prev.stepIndex + 1,
        done: prev.stepIndex + 1 >= prev.steps.length,
      }));
    }
    if (!bDone) {
      setPanelB(prev => ({
        ...prev,
        currentStep: prev.steps[prev.stepIndex],
        stepIndex: prev.stepIndex + 1,
        done: prev.stepIndex + 1 >= prev.steps.length,
      }));
    }

    timerRef.current = window.setTimeout(animate, 50 * speed);
  }, [speed]);

  const startCompare = useCallback(() => {
    stopAnimation();
    const stepsA = algoFns[algoA](array);
    const stepsB = algoFns[algoB](array);
    setPanelA({ algo: algoA, steps: stepsA, stepIndex: 0, currentStep: null, totalSteps: stepsA.length, done: false });
    setPanelB({ algo: algoB, steps: stepsB, stepIndex: 0, currentStep: null, totalSteps: stepsB.length, done: false });
    setIsRunning(true);
    // Small delay so refs update
    setTimeout(() => {
      panelARef.current = { algo: algoA, steps: stepsA, stepIndex: 0, currentStep: null, totalSteps: stepsA.length, done: false };
      panelBRef.current = { algo: algoB, steps: stepsB, stepIndex: 0, currentStep: null, totalSteps: stepsB.length, done: false };
      animate();
    }, 50);
  }, [algoA, algoB, array, animate, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setArray(generateRandomArray(arraySize, 100));
    setPanelA(prev => ({ ...prev, currentStep: null, stepIndex: 0, done: false, steps: [], totalSteps: 0 }));
    setPanelB(prev => ({ ...prev, currentStep: null, stepIndex: 0, done: false, steps: [], totalSteps: 0 }));
  }, [stopAnimation, arraySize]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const renderPanel = (panel: PanelState, color: string, label: string) => {
    const displayArray = panel.currentStep?.array ?? array;
    const maxVal = Math.max(...displayArray, 1);
    const info = sortingAlgoInfo[panel.algo];

    return (
      <div className="flex-1 min-w-0 space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 h-[380px] flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${color}`}>{panel.algo}</h3>
            <div className="flex items-center gap-2">
              {panel.done && (
                <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full">
                  ✓ {panel.totalSteps} steps
                </span>
              )}
              {!panel.done && panel.stepIndex > 0 && (
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  Step {panel.stepIndex}/{panel.totalSteps}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 flex items-end gap-[2px] min-h-0">
            {displayArray.map((val, idx) => {
              const isComparing = panel.currentStep?.comparing.includes(idx);
              const isSwapping = panel.currentStep?.swapping.includes(idx);
              const isSorted = panel.currentStep?.sorted.includes(idx);
              let barColor = "bg-sorting/40";
              if (isSorted) barColor = "bg-success";
              else if (isSwapping) barColor = "bg-destructive";
              else if (isComparing) barColor = "bg-warning";
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className={`w-full rounded-t-sm transition-all duration-100 ${barColor}`}
                    style={{ height: `${(val / maxVal) * 90}%` }} />
                </div>
              );
            })}
          </div>
        </div>
        {/* Complexity info */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(["best", "average", "worst"] as const).map(k => (
              <div key={k} className="p-2 rounded-lg bg-secondary/50">
                <div className="text-[10px] text-muted-foreground capitalize">{k}</div>
                <div className={`text-xs font-mono mt-0.5 ${color}`}>{info.timeComplexity[k]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AlgoLayout title="Sorting — Compare">
      {/* Controls bar */}
      <div className="w-full rounded-xl border border-border bg-card p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm A</label>
            <select value={algoA} onChange={e => setAlgoA(e.target.value)} disabled={isRunning}
              className="block w-44 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <span className="text-muted-foreground text-lg font-bold pb-1">vs</span>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm B</label>
            <select value={algoB} onChange={e => setAlgoB(e.target.value)} disabled={isRunning}
              className="block w-44 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Size: {arraySize}</label>
            <input type="range" min={5} max={50} value={arraySize}
              onChange={e => { setArraySize(+e.target.value); setArray(generateRandomArray(+e.target.value, 100)); }}
              className="w-28 accent-sorting" />
          </div>
          <div className="w-36">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button onClick={startCompare} disabled={isRunning}
              className="px-5 py-2 text-sm rounded-lg bg-sorting text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
              {isRunning ? "Running..." : "▶ Compare"}
            </button>
            <button onClick={reset}
              className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Side by side panels */}
      <div className="flex gap-5">
        {renderPanel(panelA, "text-sorting", "A")}
        <div className="w-px bg-border self-stretch" />
        {renderPanel(panelB, "text-accent", "B")}
      </div>

      {/* Winner banner */}
      {panelA.done && panelB.done && (
        <div className="mt-5 rounded-xl border border-border bg-card p-5 text-center animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {panelA.totalSteps < panelB.totalSteps
              ? `🏆 ${panelA.algo} wins!`
              : panelA.totalSteps > panelB.totalSteps
                ? `🏆 ${panelB.algo} wins!`
                : "🤝 It's a tie!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="text-sorting font-mono">{panelA.algo}: {panelA.totalSteps} steps</span>
            {" vs "}
            <span className="text-accent font-mono">{panelB.algo}: {panelB.totalSteps} steps</span>
          </p>
        </div>
      )}
    </AlgoLayout>
  );
};

export default SortingComparePage;
