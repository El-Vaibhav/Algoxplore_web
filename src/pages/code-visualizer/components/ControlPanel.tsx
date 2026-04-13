import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Loader2 } from "lucide-react";
import type { AlgorithmCategory, Algorithm } from "../types";

const ALGO_OPTIONS: Record<AlgorithmCategory, { value: Algorithm; label: string }[]> = {
  graph: [
    { value: "bfs", label: "BFS" },
    { value: "dfs", label: "DFS" },
    { value: "prims", label: "Prim's" },
    { value: "kruskal", label: "Kruskal's" },
    { value: "toposort", label: "Topo Sort" },
    { value: "dijkstra", label: "Dijkstra" },
  ],
  sorting: [
    { value: "bubble", label: "Bubble" },
    { value: "selection", label: "Selection" },
    { value: "insertion", label: "Insertion" },
    { value: "merge", label: "Merge" },
    { value: "quick", label: "Quick" },
  ],
  scheduling: [
    { value: "fcfs", label: "FCFS" },
    { value: "sjf", label: "SJF" },
    { value: "srtf", label: "SRTF" },
    { value: "roundrobin", label: "Round Robin" },
    { value: "priority", label: "Priority" },
  ],
  tree: [
    { value: "bst_insert", label: "BST_Insert" },
    { value: "bst_search", label: "Search" },
    { value: "bst_delete", label: "Delete" },
    { value: "bst_inorder", label: "Inorder" },
    { value: "bst_preorder", label: "Preorder" },
    { value: "bst_postorder", label: "Postorder" },
  ],
  dp: [
    { value: "knapsack", label: "Knapsack" },
    { value: "lcs", label: "LCS" },
    { value: "mcm", label: "MCM" },
  ],

};

const CATEGORY_LABELS: Record<AlgorithmCategory, string> = {
  graph: "Graph",
  sorting: "Sorting",
  scheduling: "Scheduling",
  tree: "Tree",
  dp: "DP",
};

interface ControlPanelProps {
  category: AlgorithmCategory;
  onCategoryChange: (c: AlgorithmCategory) => void;
  algorithm: Algorithm;
  onAlgorithmChange: (a: Algorithm) => void;
  onRun: () => void;
  onReset: () => void;
  onPause: () => void;
  onResume: () => void;
  onNext: () => void;
  onPrev: () => void;
  speed: number;
  onSpeedChange: (s: number) => void;
  isRunning: boolean;
  isPaused: boolean;
  isLoading: boolean;
  totalSteps: number;
  currentStep: number;
}

const ControlPanel = ({
  category,
  onCategoryChange,
  algorithm,
  onAlgorithmChange,
  onRun,
  onReset,
  onPause,
  onResume,
  onNext,
  onPrev,
  speed,
  onSpeedChange,
  isRunning,
  isPaused,
  isLoading,
  totalSteps,
  currentStep,
}: ControlPanelProps) => {
  const options = ALGO_OPTIONS[category];

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-primary">▶</span> Controls
      </h3>

      {/* Category selector */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {(["graph", "sorting", "scheduling", "tree" , "dp"] as const).map((c) => (
          <button
            key={c}
            onClick={() => onCategoryChange(c)}
            className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors capitalize ${
              category === c ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-1 p-1 bg-muted rounded-lg">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onAlgorithmChange(o.value)}
            className={`flex-1 min-w-[60px] text-xs font-medium py-1.5 rounded-md transition-colors ${
              algorithm === o.value ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Main actions */}
      <div className="flex gap-2">
        <Button onClick={onRun} disabled={isLoading || (isRunning && !isPaused)} className="flex-1 gap-2 text-xs">
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          Run & Visualize
        </Button>
        <Button variant="outline" size="icon" onClick={onReset} className="shrink-0">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Playback */}
      {totalSteps > 0 && (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPrev} disabled={currentStep <= 0} className="h-8 w-8">
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          {isPaused ? (
            <Button variant="ghost" size="icon" onClick={onResume} className="h-8 w-8">
              <Play className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={onPause} disabled={!isRunning} className="h-8 w-8">
              <Pause className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onNext} disabled={currentStep >= totalSteps - 1} className="h-8 w-8">
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Speed */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Speed</span>
          <span className="font-mono">{speed}x</span>
        </div>
        <Slider value={[speed]} onValueChange={([v]) => onSpeedChange(v)} min={0.25} max={4} step={0.25} />
      </div>

      {/* Progress */}
      {totalSteps > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Step {currentStep + 1} / {totalSteps}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
