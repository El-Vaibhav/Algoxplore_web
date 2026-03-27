import { useState, useEffect, useRef, useCallback } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import AlgoInfo from "@/components/AlgoInfo";
import SpeedControl from "@/components/SpeedControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Brain, Shuffle, PenLine } from "lucide-react";
import {
  KnapsackStep, KnapsackItem, knapsackSteps,
  FractionalStep, fractionalKnapsackSteps,
  LCSStep, lcsSteps,
  MCMStep, mcmSteps,
} from "@/lib/dpAlgorithms";
import KnapsackViz from "@/components/dp/KnapsackViz";
import FractionalKnapsackViz from "@/components/dp/FractionalKnapsackViz";
import LCSViz from "@/components/dp/LCSViz";
import MCMViz from "@/components/dp/MCMViz";

type AlgoType = "knapsack" | "fractional" | "lcs" | "mcm";

const algorithms: { key: AlgoType; label: string }[] = [
  { key: "knapsack", label: "0/1 Knapsack" },
  { key: "fractional", label: "Fractional Knapsack" },
  { key: "lcs", label: "LCS" },
  { key: "mcm", label: "Matrix Chain" },
];

const algoInfoMap: Record<AlgoType, { name: string; explanation: string; timeComplexity: { best: string; average: string; worst: string }; code: string }> = {
  knapsack: {
    name: "0/1 Knapsack",
    explanation: "Given items with weights and values, find the combination that maximizes total value without exceeding capacity. Uses a 2D DP table where dp[i][w] = max value using first i items with capacity w.",
    timeComplexity: { best: "O(n·W)", average: "O(n·W)", worst: "O(n·W)" },
    code: "knapsack(items, W):\n  dp[0..n][0..W] = 0\n  for i = 1 to n:\n    for w = 0 to W:\n      if items[i].wt <= w:\n        dp[i][w] = max(dp[i-1][w],\n          items[i].val + dp[i-1][w-items[i].wt])\n      else: dp[i][w] = dp[i-1][w]\n  return dp[n][W]",
  },
  fractional: {
    name: "Fractional Knapsack",
    explanation: "A greedy approach where items can be broken into fractions. Sort items by value/weight ratio and greedily take items with the highest ratio first. Unlike 0/1 Knapsack, this guarantees optimal results with greedy.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    code: "fractional_knapsack(items, W):\n  sort items by value/weight DESC\n  remaining = W\n  for item in sorted_items:\n    if item.weight <= remaining:\n      take all, remaining -= weight\n    else:\n      take remaining/weight fraction\n      break",
  },
  lcs: {
    name: "Longest Common Subsequence",
    explanation: "Find the longest subsequence common to two strings. Uses a 2D DP table: if characters match, dp[i][j] = dp[i-1][j-1] + 1; otherwise max(dp[i-1][j], dp[i][j-1]). Backtrack to reconstruct the LCS.",
    timeComplexity: { best: "O(m·n)", average: "O(m·n)", worst: "O(m·n)" },
    code: "lcs(s1, s2):\n  for i = 1 to m:\n    for j = 1 to n:\n      if s1[i] == s2[j]:\n        dp[i][j] = dp[i-1][j-1] + 1\n      else:\n        dp[i][j] = max(dp[i-1][j], dp[i][j-1])\n  backtrack to find LCS string",
  },
  mcm: {
    name: "Matrix Chain Multiplication",
    explanation: "Find the optimal way to parenthesize a chain of matrices to minimize scalar multiplications. Uses interval DP: for each subchain length, try all split points and pick the one with minimum cost.",
    timeComplexity: { best: "O(n³)", average: "O(n³)", worst: "O(n³)" },
    code: "mcm(dims):\n  for len = 2 to n:\n    for i = 0 to n-len:\n      j = i + len - 1\n      dp[i][j] = INF\n      for k = i to j-1:\n        cost = dp[i][k] + dp[k+1][j]\n             + dims[i]*dims[k+1]*dims[j+1]\n        dp[i][j] = min(dp[i][j], cost)",
  },
};

// ---- Random generators ----
const NAMES = "ABCDEFGHIJKLMNOP";

function randomKnapsackItems(): { items: KnapsackItem[]; capacity: number } {
  const count = 4 + Math.floor(Math.random() * 3); // 4-6
  const items: KnapsackItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({ name: NAMES[i], weight: 1 + Math.floor(Math.random() * 6), value: 2 + Math.floor(Math.random() * 14) });
  }
  const totalW = items.reduce((s, it) => s + it.weight, 0);
  const capacity = Math.max(4, Math.floor(totalW * (0.4 + Math.random() * 0.3)));
  return { items, capacity: Math.min(capacity, 15) };
}

function randomFractionalItems(): { items: KnapsackItem[]; capacity: number } {
  const count = 4 + Math.floor(Math.random() * 3);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < count; i++) {
    items.push({ name: NAMES[i], weight: 5 + Math.floor(Math.random() * 26), value: 10 + Math.floor(Math.random() * 100) });
  }
  const totalW = items.reduce((s, it) => s + it.weight, 0);
  const capacity = Math.max(10, Math.floor(totalW * (0.35 + Math.random() * 0.3)));
  return { items, capacity };
}

function randomLCSStrings(): { s1: string; s2: string } {
  const chars = "ABCDEFGHIJKLM";
  const len1 = 4 + Math.floor(Math.random() * 4);
  const len2 = 4 + Math.floor(Math.random() * 4);
  let s1 = "", s2 = "";
  for (let i = 0; i < len1; i++) s1 += chars[Math.floor(Math.random() * 8)];
  for (let i = 0; i < len2; i++) s2 += chars[Math.floor(Math.random() * 8)];
  return { s1, s2 };
}

function randomMCMDimensions(): number[] {
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 matrices
  const dims: number[] = [];
  for (let i = 0; i <= count; i++) {
    dims.push(5 + Math.floor(Math.random() * 46)); // 5-50
  }
  return dims;
}

// ---- Input panel component ----
interface InputPanelProps {
  algo: AlgoType;
  knapsackItems: KnapsackItem[];
  knapsackCapacity: number;
  fractionalItems: KnapsackItem[];
  fractionalCapacity: number;
  lcsS1: string;
  lcsS2: string;
  mcmDims: number[];
  onKnapsackChange: (items: KnapsackItem[], cap: number) => void;
  onFractionalChange: (items: KnapsackItem[], cap: number) => void;
  onLCSChange: (s1: string, s2: string) => void;
  onMCMChange: (dims: number[]) => void;
  disabled: boolean;
}

const InputPanel = ({ algo, knapsackItems, knapsackCapacity, fractionalItems, fractionalCapacity, lcsS1, lcsS2, mcmDims, onKnapsackChange, onFractionalChange, onLCSChange, onMCMChange, disabled }: InputPanelProps) => {
  const [mcmInput, setMcmInput] = useState(mcmDims.join(","));
  const [mcmError, setMcmError] = useState("");
  const renderKnapsackInputs = (items: KnapsackItem[], cap: number, onChange: (items: KnapsackItem[], cap: number) => void) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-16">Capacity</span>
        <Input
          type="number"
          value={cap === 0 ? "" : cap}
          disabled={disabled}
          className="h-7 text-xs font-mono w-20 bg-secondary/50 border-border"
          onChange={(e) => {
            const val = e.target.value;

            // allow empty while typing
            if (val === "") {
              onChange(items, 0);
              return;
            }

            const num = parseInt(val);
            if (!isNaN(num)) {
              onChange(items, num);
            }
          }}
        />
      </div>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-muted-foreground w-5">
              {String.fromCharCode(65 + i)}
            </span>

            <span className="text-[10px] text-muted-foreground">w:</span>
            <Input
              type="number"
              value={item.weight === 0 ? "" : item.weight}
              disabled={disabled}
              className="h-6 text-[11px] font-mono w-14 bg-secondary/50 border-border px-1.5"
              onChange={(e) => {
                const val = e.target.value;
                const ni = [...items];

                if (val === "") {
                  ni[i] = { ...ni[i], weight: 0 };
                  onChange(ni, cap);
                  return;
                }

                const num = parseInt(val);
                if (!isNaN(num)) {
                  ni[i] = { ...ni[i], weight: num };
                  onChange(ni, cap);
                }
              }}
            />

            <span className="text-[10px] text-muted-foreground">v:</span>
            <Input
              type="number"
              value={item.value === 0 ? "" : item.value}
              disabled={disabled}
              className="h-6 text-[11px] font-mono w-14 bg-secondary/50 border-border px-1.5"
              onChange={(e) => {
                const val = e.target.value;
                const ni = [...items];

                if (val === "") {
                  ni[i] = { ...ni[i], value: 0 };
                  onChange(ni, cap);
                  return;
                }

                const num = parseInt(val);
                if (!isNaN(num)) {
                  ni[i] = { ...ni[i], value: num };
                  onChange(ni, cap);
                }
              }}
            />

            {/* Remove button */}
            {!disabled && items.length > 1 && (
              <button
                onClick={() => {
                  const ni = items.filter((_, idx) => idx !== i);
                  onChange(ni, cap);
                }}
                className="text-red-400 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Add item button */}
        {!disabled && (
          <button
            onClick={() => {
              const ni = [
                ...items,
                {
                  name: String.fromCharCode(65 + items.length),
                  weight: 1,
                  value: 1,
                },
              ];
              onChange(ni, cap);
            }}
            className="text-xs text-dp mt-2"
          >
            + Add Item
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
        <PenLine className="w-3 h-3" /> Custom Input
      </h3>

      {algo === "knapsack" && renderKnapsackInputs(knapsackItems, knapsackCapacity, onKnapsackChange)}

      {algo === "fractional" && renderKnapsackInputs(fractionalItems, fractionalCapacity, onFractionalChange)}

      {algo === "lcs" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-8">S1</span>
            <Input value={lcsS1} maxLength={30} disabled={disabled}
              className="h-7 text-xs font-mono bg-secondary/50 border-border uppercase"
              onChange={e => onLCSChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 30), lcsS2)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-8">S2</span>
            <Input value={lcsS2} maxLength={30} disabled={disabled}
              className="h-7 text-xs font-mono bg-secondary/50 border-border uppercase"
              onChange={e => onLCSChange(lcsS1, e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 30))}
            />
          </div>
        </div>
      )}

      {algo === "mcm" && (
        <div className="space-y-2">
          <span className="text-[10px] text-muted-foreground">
            Dimensions (comma-separated)
          </span>

          <Input
            value={mcmInput}
            disabled={disabled}
            placeholder="e.g. 30,35,15,5,10"
            className={`h-7 text-xs font-mono bg-secondary/50 ${mcmError ? "border-red-500" : "border-border"
              }`}
            onChange={(e) => {
              const raw = e.target.value;

              setMcmInput(raw);

              const vals = raw
                .split(",")
                .map((v) => parseInt(v.trim()))
                .filter((v) => !isNaN(v));

              if (vals.length < 3) {
                setMcmError("Enter at least 3 numbers (2 matrices)");
              } else {
                setMcmError("");
                onMCMChange(vals);
              }
            }}
          />

          {mcmError && (
            <span className="text-[10px] text-red-400">
              {mcmError}
            </span>
          )}

          <span className="text-[10px] text-muted-foreground/60">
            {mcmDims.length - 1} matrices
          </span>
        </div>
      )}
    </div>
  );
};

// ---- Main Page ----
const DPPage = () => {
  const [algo, setAlgo] = useState<AlgoType>("knapsack");
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Inputs state
  const [knapsackItems, setKnapsackItems] = useState<KnapsackItem[]>(() => randomKnapsackItems().items);
  const [knapsackCap, setKnapsackCap] = useState(() => { const r = randomKnapsackItems(); return r.capacity; });
  const [fractionalItems, setFractionalItems] = useState<KnapsackItem[]>(() => randomFractionalItems().items);
  const [fractionalCap, setFractionalCap] = useState(() => randomFractionalItems().capacity);
  const [lcsS1, setLcsS1] = useState(() => randomLCSStrings().s1);
  const [lcsS2, setLcsS2] = useState(() => randomLCSStrings().s2);
  const [mcmDims, setMcmDims] = useState(() => randomMCMDimensions());

  // Initialize with consistent random data
  useEffect(() => {
    const k = randomKnapsackItems();
    setKnapsackItems(k.items);
    setKnapsackCap(k.capacity);
    const f = randomFractionalItems();
    setFractionalItems(f.items);
    setFractionalCap(f.capacity);
    const l = randomLCSStrings();
    setLcsS1(l.s1);
    setLcsS2(l.s2);
    setMcmDims(randomMCMDimensions());
  }, []);

  const stepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);


  useEffect(() => {
    if (!isRunning || currentStep >= steps.length - 1) {
      if (isRunning && currentStep >= steps.length - 1) setIsRunning(false);
      return;
    }
    const delay = 600 * speed;
    timerRef.current = setTimeout(() => setCurrentStep(s => s + 1), delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, currentStep, steps.length, speed]);

  const run = () => {
    let s: any[];
    switch (algo) {
      case "knapsack": s = knapsackSteps(knapsackItems, knapsackCap); break;
      case "fractional": s = fractionalKnapsackSteps(fractionalItems, fractionalCap); break;
      case "lcs": s = lcsSteps(lcsS1, lcsS2); break;
      case "mcm": s = mcmSteps(mcmDims); break;
      default: s = [];
    }
    setSteps(s);
    setCurrentStep(0);
    setIsRunning(true);
  };

  const reset = () => {
    stopAnimation();
    setSteps([]);
    setCurrentStep(-1);
    // Generate new random inputs for current algo
    switch (algo) {
      case "knapsack": { const r = randomKnapsackItems(); setKnapsackItems(r.items); setKnapsackCap(r.capacity); break; }
      case "fractional": { const r = randomFractionalItems(); setFractionalItems(r.items); setFractionalCap(r.capacity); break; }
      case "lcs": { const r = randomLCSStrings(); setLcsS1(r.s1); setLcsS2(r.s2); break; }
      case "mcm": { setMcmDims(randomMCMDimensions()); break; }
    }
  };

  const switchAlgo = (key: AlgoType) => {
    stopAnimation();
    setSteps([]);
    setCurrentStep(-1);
    setAlgo(key);
  };

  const info = algoInfoMap[algo];
  const isAnimating = isRunning || steps.length > 0;

  return (
    <AlgoLayout title="Dynamic Programming">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {algorithms.map(a => (
              <button key={a.key} onClick={() => switchAlgo(a.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${algo === a.key ? "bg-dp text-background shadow-lg shadow-dp/25" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
                {a.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 min-h-[480px] relative overflow-hidden flex items-center justify-center">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-dp/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-dp/3 rounded-full blur-[80px] pointer-events-none" />
            {algo === "knapsack" && (
              <KnapsackViz
                stepData={
                  stepData ?? {
                    table: Array.from({ length: knapsackItems.length + 1 }, () =>
                      Array(knapsackCap + 1).fill(0)
                    ),
                    selectedItems: [],
                    currentRow: -1,
                    currentCol: -1,
                    message: "",
                    done: false,
                  }
                }
                items={knapsackItems}
                capacity={knapsackCap}
              />
            )}
            {algo === "fractional" && (
              <FractionalKnapsackViz stepData={stepData as FractionalStep | null} />
            )}
            {algo === "lcs" && (
              <LCSViz
                stepData={
                  stepData ?? {
                    str1: lcsS1,
                    str2: lcsS2,
                    table: Array.from({ length: lcsS1.length + 1 }, () =>
                      Array(lcsS2.length + 1).fill(0)
                    ),
                    currentRow: -1,
                    currentCol: -1,
                    lcs: "",
                    lcsPath: [],
                    message: "",
                    done: false,
                  }
                }
              />
            )}
            {algo === "mcm" && (
              <MCMViz
                stepData={
                  stepData ?? {
                    dimensions: mcmDims,
                    table: Array.from({ length: mcmDims.length - 1 }, (_, i) =>
                      Array.from({ length: mcmDims.length - 1 }, (_, j) =>
                        i === j ? 0 : 0
                      )
                    ),
                    currentRow: -1,
                    currentCol: -1,
                    chainLength: 0,
                    optimalOrder: "",
                    message: "",
                    done: false,
                  }
                }
              />
            )}
          </div>

          <AlgoInfo name={info.name} explanation={info.explanation} timeComplexity={info.timeComplexity} code={info.code} accentColor="graph" />
        </div>

        <div className="space-y-8 mt-14">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Brain className="w-4 h-4 text-dp" />
              {info.name}
            </h3>
            <div className="text-xs text-muted-foreground">
              {algo === "knapsack" && <><div>Capacity: <span className="text-foreground font-mono">{knapsackCap}</span></div><div>Items: <span className="text-foreground font-mono">{knapsackItems.length}</span></div></>}
              {algo === "fractional" && <><div>Capacity: <span className="text-foreground font-mono">{fractionalCap}</span></div><div>Items: <span className="text-foreground font-mono">{fractionalItems.length}</span></div><div>Strategy: <span className="text-foreground font-mono">Greedy by ratio</span></div></>}
              {algo === "lcs" && <><div>String 1: <span className="text-foreground font-mono">{lcsS1}</span></div><div>String 2: <span className="text-foreground font-mono">{lcsS2}</span></div></>}
              {algo === "mcm" && <><div>Matrices: <span className="text-foreground font-mono">{mcmDims.length - 1}</span></div><div>Dims: <span className="text-foreground font-mono">{mcmDims.join("×")}</span></div></>}
            </div>
          </div>

          <InputPanel
            algo={algo}
            knapsackItems={knapsackItems} knapsackCapacity={knapsackCap}
            fractionalItems={fractionalItems} fractionalCapacity={fractionalCap}
            lcsS1={lcsS1} lcsS2={lcsS2} mcmDims={mcmDims}
            onKnapsackChange={(items, cap) => { setKnapsackItems(items); setKnapsackCap(cap); }}
            onFractionalChange={(items, cap) => { setFractionalItems(items); setFractionalCap(cap); }}
            onLCSChange={(s1, s2) => { setLcsS1(s1); setLcsS2(s2); }}
            onMCMChange={setMcmDims}
            disabled={isAnimating}
          />

          <SpeedControl speed={speed} onSpeedChange={setSpeed} />

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Button onClick={isRunning ? stopAnimation : run} className="w-full bg-dp hover:bg-dp/90 text-white font-semibold">
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Run {algorithms.find(a => a.key === algo)?.label}</>}
            </Button>
            <Button onClick={reset} variant="outline" className="w-full">
              <Shuffle className="w-4 h-4" /> Reset & Randomize
            </Button>
          </div>

          {steps.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step</span>
                <span className="text-dp font-mono">{currentStep + 1} / {steps.length}</span>
              </div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full bg-dp rounded-full" animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
              {stepData?.done && (
                <div className="mt-3 p-2 bg-dp/10 rounded-lg border border-dp/30 text-center">
                  <div className="text-xs text-muted-foreground">
                    {algo === "knapsack" ? "Optimal Value" : algo === "fractional" ? "Max Value" : algo === "lcs" ? "LCS Length" : "Min Multiplications"}
                  </div>
                  <div className="text-lg font-bold text-dp font-mono">
                    {algo === "knapsack" && (stepData as KnapsackStep).maxValue}
                    {algo === "fractional" && (stepData as FractionalStep).totalValue}
                    {algo === "lcs" && (stepData as LCSStep).lcs.length}
                    {algo === "mcm" && (stepData as MCMStep).table[0][(stepData as MCMStep).table.length - 1].toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AlgoLayout>
  );
};

export default DPPage;
