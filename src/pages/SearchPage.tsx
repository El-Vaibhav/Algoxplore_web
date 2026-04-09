import { useState, useEffect, useRef, useCallback } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import AlgoInfo from "@/components/AlgoInfo";
import SpeedControl from "@/components/SpeedControl";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Compass, Shuffle } from "lucide-react";
import { QuizToggle, QuizScoreBadge, QuizCard, QuizSummary } from "@/components/QuizMode";
import {
  binarySearchQuiz,
  aStarQuiz,
  aoStarQuiz
} from "@/lib/quizGenerators";
import {
  BinarySearchStep,
  AStarStep,
  AOStarStep,
  binarySearchSteps,
  aStarSteps,
  aoStarSteps,
  generateRandomWalls,
} from "@/lib/searchAlgorithms";
import ComplexityPanel from "@/components/ComplexityPanel";

type AlgoType = "binary-search" | "a-star" | "ao-star";

const algorithms: { key: AlgoType; label: string }[] = [
  { key: "binary-search", label: "Binary Search" },
  { key: "a-star", label: "A* Pathfinding" },
  { key: "ao-star", label: "AO* Algorithm" },
];

const algoInfo: Record<AlgoType, { name: string; explanation: string; timeComplexity: { best: string; average: string; worst: string }; code: string }> = {
  "binary-search": {
    name: "Binary Search",
    explanation: "Searches a sorted array by repeatedly dividing the search interval in half. Compares the target with the middle element and narrows the range.",
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(log n)" },
    code: "binarySearch(arr, target):\n  low = 0, high = len-1\n  while low <= high:\n    mid = (low+high) / 2\n    if arr[mid] == target: return mid\n    if arr[mid] < target: low = mid+1\n    else: high = mid-1\n  return -1",
  },
  "a-star": {
    name: "A* Pathfinding",
    explanation: "A* finds the shortest path using f(n) = g(n) + h(n), where g is the cost from start and h is a heuristic estimate to the goal. It explores the most promising nodes first.",
    timeComplexity: { best: "O(b^d)", average: "O(b^d)", worst: "O(b^d)" },
    code: "A*(start, goal):\n  openSet = {start}\n  while openSet not empty:\n    current = node with lowest f\n    if current == goal: return path\n    for neighbor of current:\n      tentG = g(current) + cost\n      if tentG < g(neighbor):\n        update neighbor\n        add to openSet",
  },
  "ao-star": {
    name: "AO* Algorithm",
    explanation: "AO* solves AND-OR graphs. OR nodes choose the cheapest child group; AND nodes require all children to be solved. It propagates costs bottom-up to find optimal solutions.",
    timeComplexity: { best: "O(b^d)", average: "O(b^d)", worst: "O(b^d)" },
    code: "AO*(root):\n  while root not solved:\n    select best leaf via OR choices\n    expand and evaluate\n    propagate costs upward:\n      OR: min of child groups\n      AND: sum of children in group\n    mark solved when all required\n    children are solved",
  },
};

const GRID_ROWS = 15;
const GRID_COLS = 25;

const SearchPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoType>("binary-search");
  const [speed, setSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [start, setStart] = useState({ row: 7, col: 2 });
  const [end, setEnd] = useState({ row: 7, col: 22 });
  const [placing, setPlacing] = useState<"start" | "end" | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [isPaused, setIsPaused] = useState(false);


  // Binary Search state
  const [bsSteps, setBsSteps] = useState<BinarySearchStep[]>([]);
  const [bsStep, setBsStep] = useState(-1);
  const [bsTarget, setBsTarget] = useState("42");
  const [bsArray, setBsArray] = useState<number[]>(
    Array.from({ length: 20 }, (_, i) => (i + 1) * 5)
  );
  const [bsArrayInput, setBsArrayInput] = useState(bsArray.join(","));

  // A* state
  const [asSteps, setAsSteps] = useState<AStarStep[]>([]);
  const [asStep, setAsStep] = useState(-1);
  const [walls, setWalls] = useState(() =>
    generateRandomWalls(GRID_ROWS, GRID_COLS, 0.25, start, end)
  );

  // AO* state
  const [aoSteps, setAoSteps] = useState<AOStarStep[]>(() => aoStarSteps());
  const [aoStep, setAoStep] = useState(0);

  const currentQuestion = (() => {
    if (!quizActive) return null;

    if (selectedAlgo === "binary-search" && bsStep >= 0) {
      return binarySearchQuiz(bsStep, bsSteps);
    }

    if (selectedAlgo === "a-star" && asStep >= 0) {
      return aStarQuiz(asStep, asSteps as any);
    }

    if (selectedAlgo === "ao-star" && aoStep >= 0) {
      return aoStarQuiz(aoStep, aoSteps as any);
    }

    return null;
  })();

  const handleAnswer = (correct: boolean) => {
    setQuizTotal(prev => prev + 1);
    if (correct) setQuizScore(prev => prev + 1);

    if (timerRef.current) clearTimeout(timerRef.current);

    setIsPaused(false);
    setIsRunning(true);
    setCurrentStep(prev => prev + 1);
  };

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const getCurrentStep = useCallback(() => {
    if (selectedAlgo === "binary-search") return bsStep;
    if (selectedAlgo === "a-star") return asStep;
    return aoStep;
  }, [selectedAlgo, bsStep, asStep, aoStep]);

  const getMaxSteps = useCallback(() => {
    if (selectedAlgo === "binary-search") return bsSteps.length;
    if (selectedAlgo === "a-star") return asSteps.length;
    return aoSteps.length;
  }, [selectedAlgo, bsSteps, asSteps, aoSteps]);

  const setCurrentStep = useCallback((fn: (prev: number) => number) => {
    if (selectedAlgo === "binary-search") setBsStep(fn);
    else if (selectedAlgo === "a-star") setAsStep(fn);
    else setAoStep(fn);
  }, [selectedAlgo]);

  useEffect(() => {
    const step = getCurrentStep();
    const max = getMaxSteps();
    if (!isRunning || step >= max - 1 || isPaused) {
      if (isRunning && step >= max - 1) setIsRunning(false);
      return;
    }
    const delay = 200 * speed;
    timerRef.current = setTimeout(() => {
      const nextStep = step + 1;

      let question = null;

      if (quizActive) {
        if (selectedAlgo === "binary-search") {
          question = binarySearchQuiz(step, bsSteps);
        }
        else if (selectedAlgo === "a-star") {
          question = aStarQuiz(step, asSteps as any);
        }
        else if (selectedAlgo === "ao-star") {
          question = aoStarQuiz(step, aoSteps as any);
        }
      }

      if (quizActive && question) {
        setCurrentStep(() => nextStep);
        setIsPaused(true);
        setIsRunning(false);
        return;
      }

      setCurrentStep(s => s + 1);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, getCurrentStep, getMaxSteps, speed, setCurrentStep]);

  const run = useCallback(() => {
    if (selectedAlgo === "binary-search") {
      const target = parseInt(bsTarget);
      if (isNaN(target)) return;
      const nums = bsArrayInput
        .split(",")
        .map(v => parseInt(v.trim()))
        .filter(v => !isNaN(v));

      if (nums.length === 0) return;

      setBsArray(nums);

      const steps = binarySearchSteps(nums, target);
      setBsSteps(steps);
      setBsStep(0);
    } else if (selectedAlgo === "a-star") {
      const steps = aStarSteps(GRID_ROWS, GRID_COLS, walls, start, end);
      setAsSteps(steps);
      setAsStep(0);
    } else {
      const steps = aoStarSteps();
      setAoSteps(steps);
      setAoStep(0);
    }
    setIsRunning(true);
  }, [selectedAlgo, bsTarget, bsArrayInput, walls, start, end]);

  const reset = () => {
    stopAnimation();

    const defaultArray = Array.from({ length: 20 }, (_, i) => (i + 1) * 5);

    // Reset binary search
    setBsSteps([]);
    setBsStep(-1);
    setBsTarget("42");
    setBsArray(defaultArray);
    setBsArrayInput(defaultArray.join(","));

    // Reset A*
    setAsSteps([]);
    setAsStep(-1);

    // AO* (always regenerate tree)
    const steps = aoStarSteps();
    setAoSteps(steps);
    setAoStep(0);

    setQuizScore(0);
    setQuizTotal(0);
    setIsPaused(false);
    setQuizActive(false);
  };

  const randomizeWalls = () => {
    setWalls(generateRandomWalls(GRID_ROWS, GRID_COLS, 0.25, start, end));
    reset();
  };

  const info = algoInfo[selectedAlgo];
  const step = getCurrentStep();
  const maxSteps = getMaxSteps();

  return (
    <AlgoLayout title="Search & Pathfinding">
      <div className="grid lg:grid-cols-[1fr_300px] gap-4 md:gap-6">
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <QuizToggle
              active={quizActive}
              onToggle={() => setQuizActive(prev => !prev)}
              accent="search"
            />
            <QuizScoreBadge
              score={quizScore}
              total={quizTotal}
              accent="search"
            />
          </div>
          <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-3 md:p-6 min-h-[420px] md:min-h-[480px] relative overflow-hidden">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-search/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-search/3 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 h-full">
              {selectedAlgo === "binary-search" && (
                <BinarySearchViz steps={bsSteps} currentStep={bsStep} array={bsArray} />
              )}
              {selectedAlgo === "a-star" && (
                <AStarViz
                  steps={asSteps}
                  currentStep={asStep}
                  walls={walls}
                  start={start}
                  end={end}
                  placing={placing}
                  setStart={setStart}
                  setEnd={setEnd}
                  setPlacing={setPlacing}
                />
              )}
              {selectedAlgo === "ao-star" && <AOStarViz steps={aoSteps} currentStep={aoStep} />}
            </div>

            {/* Message bar */}
            <AnimatePresence>
              {step >= 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 bg-card/90 backdrop-blur-md border border-border rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm text-foreground"
                >
                  {selectedAlgo === "binary-search" && bsSteps[bsStep]?.message}
                  {selectedAlgo === "a-star" && asSteps[asStep]?.message}
                  {selectedAlgo === "ao-star" && aoSteps[aoStep]?.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>


        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Compass className="w-4 h-4 text-search" />
              Algorithm
            </h3>
            <div className="space-y-1.5">
              {algorithms.map((algo) => (
                <button
                  key={algo.key}
                  onClick={() => {
                    setSelectedAlgo(algo.key);
                    reset();


                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${selectedAlgo === algo.key
                    ? "bg-search/15 text-search border border-search/30 font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                    }`}
                >
                  {algo.label}
                </button>
              ))}
            </div>
          </div>
          {quizActive && currentQuestion && (
            <QuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              accent="search"
            />
          )}
          {quizActive && !currentQuestion && quizTotal > 0 && (
            <QuizSummary
              score={quizScore}
              total={quizTotal}
              onRetry={() => {
                setQuizScore(0);
                setQuizTotal(0);
              }}
              accent="search"
            />
          )}

          {selectedAlgo === "binary-search" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">

              <h3 className="text-sm font-semibold text-foreground">Array</h3>

              <input
                type="text"
                placeholder="Example: 5,10,15,20"
                value={bsArrayInput}
                onChange={(e) => setBsArrayInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground"
              />

              <h3 className="text-sm font-semibold text-foreground">Target Value</h3>

              <input
                type="number"
                value={bsTarget}
                onChange={(e) => setBsTarget(e.target.value)}
                placeholder="Search for..."
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm text-foreground"
              />

            </div>
          )}

          {selectedAlgo === "a-star" && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">

              <Button onClick={randomizeWalls} variant="outline" className="w-full" size="sm">
                <Shuffle className="w-4 h-4" /> Randomize Walls
              </Button>

              <div className="flex gap-2">

                <Button
                  size="sm"
                  className={`w-full transition-colors ${placing === "start"
                    ? "border-border bg-secondary/30"
                    : "bg-success text-white border-success hover:bg-success/90"
                    }`}
                  onClick={() => setPlacing("start")}
                >
                  Set Start
                </Button>

                <Button
                  size="sm"
                  className={`w-full transition-colors ${placing === "end"
                    ? "border-border bg-secondary/30"
                    : "bg-search text-white border-search hover:bg-search/90"
                    }`}
                  onClick={() => setPlacing("end")}
                >
                  Set End
                </Button>

              </div>

            </div>
          )}

          <SpeedControl speed={speed} onSpeedChange={setSpeed} />

          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <Button
              onClick={isRunning ? stopAnimation : run}
              className="w-full bg-search hover:bg-search/90 text-white font-semibold"
            >
              {isRunning ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Run {info.name}</>}
            </Button>
            <Button onClick={reset} variant="outline" className="w-full">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>

          {maxSteps > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step</span>
                <span className="text-search font-mono">{step + 1} / {maxSteps}</span>
              </div>
              <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div className="h-full bg-search rounded-full" animate={{ width: `${((step + 1) / maxSteps) * 100}%` }} transition={{ duration: 0.3 }} />
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <AlgoInfo
          name={info.name}
          explanation={info.explanation}
          timeComplexity={info.timeComplexity}
          code={info.code}
          accentColor="search"
        />
      </div>
      <ComplexityPanel category="search" accentClass="text-search" />

    </AlgoLayout>
  );
};

// ===== Binary Search Visualization =====
function BinarySearchViz({
  steps,
  currentStep,
  array
}: {
  steps: BinarySearchStep[];
  currentStep: number;
  array: number[];
}) {

  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const arr = step?.array ?? array;

  return (
    <div className="flex flex-col items-center justify-start h-full gap-6 pt-10 md:pt-24 lg:pt-40">
      <div className="w-full overflow-x-auto">
        <div className="flex gap-1.5 items-end w-max mx-auto px-1">
          {arr.map((val, idx) => {
            let bgClass = "bg-secondary/60";
            let textClass = "text-muted-foreground";

            if (step) {
              if (idx === step.mid) {
                bgClass = step.found ? "bg-success" : "bg-search";
                textClass = "text-white";
              } else if (idx >= step.low && idx <= step.high) {
                bgClass = "bg-search/20 border-search/30";
                textClass = "text-search";
              } else {
                bgClass = "bg-secondary/30";
                textClass = "text-muted-foreground/40";
              }
            }

            return (
              <motion.div
                key={idx}
                layout
                className={`flex flex-col items-center gap-1`}
              >
                <motion.div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border border-border ${bgClass} flex items-center justify-center text-[10px] md:text-xs font-mono font-semibold ${textClass}`}
                  animate={{ scale: idx === step?.mid ? 1.15 : 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {val}
                </motion.div>
                <span className="text-[9px] text-muted-foreground font-mono">{idx}</span>
                {step && (
                  <div className="text-[8px] font-mono h-3">
                    {idx === step.low && <span className="text-search">low</span>}
                    {idx === step.mid && <span className="text-warning">mid</span>}
                    {idx === step.high && <span className="text-search">high</span>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      {!step && (
        <p className="text-xs md:text-sm text-muted-foreground text-center px-2">Enter a target value and click Run to start Binary Search</p>
      )}
    </div>
  );
}

// ===== A* Grid Visualization =====
function AStarViz({
  steps,
  currentStep,
  walls,
  start,
  end,
  placing,
  setStart,
  setEnd,
  setPlacing
}: {
  steps: AStarStep[];
  currentStep: number;
  walls: { row: number; col: number }[];
  start: { row: number; col: number };
  end: { row: number; col: number };
  placing: "start" | "end" | null;
  setStart: (p: { row: number; col: number }) => void;
  setEnd: (p: { row: number; col: number }) => void;
  setPlacing: (v: "start" | "end" | null) => void;
}) {
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const CELL = 26;

  return (
    <div className="flex items-center justify-center h-full overflow-auto">
      <div className="inline-grid gap-px" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, ${CELL}px)` }}>
        {Array.from({ length: GRID_ROWS }).map((_, r) =>
          Array.from({ length: GRID_COLS }).map((_, c) => {
            let bgClass = "bg-secondary/30";
            const isStart = r === start.row && c === start.col;
            const isEnd = r === end.row && c === end.col;

            if (isStart) bgClass = "bg-search";
            else if (isEnd) bgClass = "bg-success";
            else if (step) {
              const isWall = step.grid[r]?.[c]?.isWall;
              const isPath = step.path.some(p => p.row === r && p.col === c);
              const isCurrent = step.current?.row === r && step.current?.col === c;
              const isOpen = step.openSet.some(o => o.row === r && o.col === c);
              const isClosed = step.closedSet.some(o => o.row === r && o.col === c);

              if (isWall) bgClass = "bg-foreground/20";
              else if (isPath) bgClass = "bg-search";
              else if (isCurrent) bgClass = "bg-warning";
              else if (isOpen) bgClass = "bg-search/30";
              else if (isClosed) bgClass = "bg-search/10";
            } else {
              // Show initial walls
              const isWall = walls.some(w => w.row === r && w.col === c);
              if (isWall) bgClass = "bg-foreground/20";
            }

            return (
              <motion.div
                key={`${r}-${c}`}
                className={`rounded-sm ${bgClass} transition-colors duration-150`}
                style={{ width: CELL, height: CELL }}
                initial={false}
                animate={{ opacity: 1 }}
                onClick={() => {
                  if (placing === "start") {
                    setStart({ row: r, col: c });
                    setPlacing(null);
                  }
                  else if (placing === "end") {
                    setEnd({ row: r, col: c });
                    setPlacing(null);
                  }
                }}
              >
                {isStart && <span className="flex items-center justify-center h-full text-[8px] font-bold text-background">S</span>}
                {isEnd && <span className="flex items-center justify-center h-full text-[8px] font-bold text-background">E</span>}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ===== AO* Visualization =====
function AOStarViz({ steps, currentStep }: { steps: AOStarStep[]; currentStep: number }) {
  const step = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const nodes = step?.nodes ?? [];
  const edges = step?.edges ?? [];
  const solvedNodes = step?.solvedNodes ?? [];
  const currentNode = step?.currentNode;

  return (
    <div className="w-full h-full overflow-x-auto">
      <svg width="100%" height="100%" viewBox="0 0 800 320" className="min-w-[720px] overflow-visible">
        {/* Edges */}
        {edges.map((e, i) => {
          const from = nodes.find(n => n.id === e.from);
          const to = nodes.find(n => n.id === e.to);
          if (!from || !to) return null;
          const isBestPath = from.bestGroup === e.groupIdx && from.solved;
          return (
            <motion.line
              key={`edge-${i}`}
              x1={from.x} y1={from.y + 20}
              x2={to.x} y2={to.y - 20}
              stroke={isBestPath ? "hsl(var(--search))" : "hsl(var(--border))"}
              strokeWidth={isBestPath ? 2.5 : 1.5}
              strokeDasharray={from.children[e.groupIdx]?.length > 1 ? "none" : "none"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          );
        })}

        {/* AND arcs */}
        {nodes.filter(n => n.children.some(g => g.length > 1)).map(n =>
          n.children.map((group, gi) => {
            if (group.length <= 1) return null;
            const children = group.map(id => nodes.find(nd => nd.id === id)!).filter(Boolean);
            if (children.length < 2) return null;
            const midX = (children[0].x + children[children.length - 1].x) / 2;
            const midY = (n.y + children[0].y) / 2;
            return (
              <motion.path
                key={`arc-${n.id}-${gi}`}
                d={`M ${children[0].x} ${midY} Q ${midX} ${midY - 15} ${children[children.length - 1].x} ${midY}`}
                fill="none"
                stroke={n.bestGroup === gi && n.solved ? "hsl(var(--search))" : "hsl(var(--muted-foreground))"}
                strokeWidth={1.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
              />
            );
          })
        )}

        {/* Nodes */}
        {nodes.map(n => {
          const isSolved = solvedNodes.includes(n.id);
          const isCurrent = currentNode === n.id;
          return (
            <motion.g key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              {isCurrent && (
                <motion.circle cx={n.x} cy={n.y} r={28} fill="none" stroke="hsl(var(--search))" strokeWidth={2} opacity={0.4}
                  animate={{ r: [28, 34, 28], opacity: [0.4, 0.1, 0.4] }} transition={{ duration: 1, repeat: Infinity }} />
              )}
              <circle cx={n.x} cy={n.y} r={22}
                fill={isCurrent ? "hsl(var(--search))" : isSolved ? "hsl(var(--success))" : "hsl(var(--card))"}
                stroke={isCurrent ? "hsl(var(--search))" : isSolved ? "hsl(var(--success))" : "hsl(var(--border))"}
                strokeWidth={2}
              />
              <text x={n.x} y={n.y - 2} textAnchor="middle" dominantBaseline="central"
                fill={isCurrent || isSolved ? "hsl(var(--background))" : "hsl(var(--foreground))"}
                fontSize={14} fontWeight={700} fontFamily="Space Grotesk">
                {n.label}
              </text>
              <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={8}
                fill={isCurrent || isSolved ? "hsl(var(--background))" : "hsl(var(--muted-foreground))"}
                fontFamily="JetBrains Mono">
                c:{n.cost}
              </text>
              {n.type !== "LEAF" && (
                <text x={n.x + 26} y={n.y - 14} textAnchor="middle" fontSize={8}
                  fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono">
                  {n.type}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>

  );
}

export default SearchPage;
