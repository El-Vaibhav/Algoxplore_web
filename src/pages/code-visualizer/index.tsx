import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import CodeEditor from "./components/CodeEditor";
import GraphInput from "./components/AlgoInput";
import ControlPanel from "./components/ControlPanel";
import VisualizationCanvas from "./components/VisualizationCanvas";
import ExecutionPanel from "./components/ExecutionPanel";
import { useExecution } from "./hooks/useExecution";
import type { GraphData, AlgorithmCategory, Algorithm, SchedulingInput, TreeInput } from "./types";

const DEFAULT_ALGOS: Record<AlgorithmCategory, Algorithm> = {
  graph: "bfs",
  sorting: "bubble",
  scheduling: "fcfs",
  tree: "insert",
  dp: "knapsack",
};

const CODE_DEFAULTS: Record<string, string> = {
  bfs: `function bfs(graph, start) {
  const visited = new Set();
  const queue = [start];

  while (queue.length) {
    const node = queue.shift();

    if (!visited.has(node)) {
      visited.add(node);
      logStep("visit", node);

      for (const neighbor of graph[node] || []) {
        queue.push(neighbor);
      }
    }
  }

  logStep("result", "All Nodes Visited");
}`,

  bubble: `function bubble(array) {
  for (let i = 0; i < array.length - 1; i++) {
    for (let j = 0; j < array.length - 1 - i; j++) {
      logStep("compare", [j, j + 1]);
      if (array[j] > array[j + 1]) {
        logStep("swap", [j, j + 1]);
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
}`,

  fcfs: `function fcfs(arrival, burst) {
  const n = arrival.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  indices.sort((a, b) => arrival[a] - arrival[b]);
  const gantt = [];
  let time = 0;
  const completion = Array(n).fill(0);

  for (const i of indices) {
    if (time < arrival[i]) time = arrival[i];
    logStep("visit", i);
    gantt.push({ processId: i, start: time, end: time + burst[i] });
    logStep("gantt", [...gantt]);
    time += burst[i];
    completion[i] = time;
  }

  const tat = Array(n).fill(0);
  const wt = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    tat[i] = completion[i] - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  logStep("schedule_done", { gantt, waitingTime: wt, turnaroundTime: tat });
}`,

  insert: `function insert(values) {
  let root = null;

  function insert(root, val) {
    if (!root) {
      logStep("tree_state", { tree: null, highlightNode: val });
      return { value: val, left: null, right: null };
    }
    logStep("tree_state", { tree: copyTree(root), highlightNode: root.value });
    if (val < root.value) {
      logStep("compare", [val, root.value]);
      root.left = insert(root.left, val);
    } else if (val > root.value) {
      logStep("compare", [val, root.value]);
      root.right = insert(root.right, val);
    }
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) {
    root = insert(root, val);
    logStep("tree_state", { tree: copyTree(root), highlightNode: val });
  }
}`,
  knapsack: `function knapsack() {
  logStep("result", "Knapsack coming soon...");
}`,
};

const CodeVisualizerPage = () => {
  const [category, setCategory] = useState<AlgorithmCategory>("graph");
  const [algorithm, setAlgorithm] = useState<Algorithm>("bfs");
  const [code, setCode] = useState(CODE_DEFAULTS.bfs);
  const [graph, setGraph] = useState<GraphData>({ "0": [1, 2], "1": [3], "2": [], "3": [] });
  const [startNode, setStartNode] = useState(0);
  const [array, setArray] = useState<number[]>([38, 27, 43, 3, 9, 82, 10]);
  const [schedulingInput, setSchedulingInput] = useState<SchedulingInput>({
    arrival: [0, 1, 2, 3],
    burst: [5, 3, 8, 2],
    priority: [2, 1, 4, 3],
    quantum: 2,
  });
  const [treeInput, setTreeInput] = useState<TreeInput>({
    values: [50, 30, 70, 20, 40, 60, 80],
    operation: "insert",
    searchValue: 40,
    deleteValue: 30,
  });
  const [dpInput, setDPInput] = useState({
    weights: [1, 3, 4],
    values: [15, 20, 30],
    capacity: 4,
  });

  const { state, run, pause, resume, nextStep, prevStep, reset, setSpeed } = useExecution();

  const handleCategoryChange = useCallback((c: AlgorithmCategory) => {
    setCategory(c);
    const algo = DEFAULT_ALGOS[c];
    setAlgorithm(algo);
    setCode(CODE_DEFAULTS[algo] || "");
    reset();
  }, [reset]);


  const handleAlgorithmChange = useCallback((a: Algorithm) => {
    setAlgorithm(a);
    setCode(CODE_DEFAULTS[a] || "");
  }, []);

  const handleGraphChange = useCallback((g: GraphData, s: number) => { setGraph(g); setStartNode(s); }, []);
  const handleArrayChange = useCallback((a: any) => {
    const parsed = typeof a === "string"
      ? a.split(",").map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x))
      : a;
    setArray(parsed);
  }, []);

  const handleSchedulingChange = useCallback((input: SchedulingInput) => {
    setSchedulingInput(input);
  }, []);

  const handleTreeChange = useCallback((input: TreeInput) => {
    setTreeInput(input);
  }, []);
  const handleDPChange = useCallback((input: {
    weights: number[];
    values: number[];
    capacity: number;
  }) => {
    setDPInput(input);
  }, []);

  const handleRun = useCallback(() => {
    if (category === "sorting") {
      const parsed = Array.isArray(array) ? array : [];
      run(code, category, algorithm, graph, startNode, parsed, undefined, undefined);

    } else if (category === "scheduling") {
      run(code, category, algorithm, graph, startNode, array, schedulingInput, undefined);

    } else if (category === "tree") {
      run(code, category, algorithm, graph, startNode, array, undefined, treeInput);

    } else if (category === "dp") {
      run(code, category, algorithm, graph, startNode, array, undefined, undefined, dpInput);

    } else {
      run(code, category, algorithm, graph, startNode, array, undefined, undefined);
    }
  }, [run, code, category, algorithm, graph, startNode, array, schedulingInput, treeInput, dpInput]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-5 py-3 flex items-center gap-4 bg-card/50 backdrop-blur-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
            <span className="text-primary">{"</>"}</span>
            Code Visualizer Playground
          </h1>
          <p className="text-xs text-muted-foreground">
            Write · Run · Visualize algorithms step-by-step
          </p>
        </div>
      </header>

      <div className="flex-1 px-5 py-4 max-w-[1400px] w-full mx-auto flex flex-col gap-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-stretch">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <CodeEditor code={code} onChange={setCode} category={category} algorithm={algorithm} />
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <GraphInput
                category={category}
                algorithm={algorithm}
                onGraphChange={handleGraphChange}
                onArrayChange={handleArrayChange}
                onSchedulingChange={handleSchedulingChange}
                onTreeChange={handleTreeChange}
                onDPChange={handleDPChange}
                error={state.error}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <ControlPanel
                category={category}
                onCategoryChange={handleCategoryChange}
                algorithm={algorithm}
                onAlgorithmChange={handleAlgorithmChange}
                onRun={handleRun}
                onReset={reset}
                onPause={pause}
                onResume={resume}
                onNext={nextStep}
                onPrev={prevStep}
                speed={state.speed}
                onSpeedChange={setSpeed}
                isRunning={state.isRunning}
                isPaused={state.isPaused}
                isLoading={state.isLoading}
                totalSteps={state.steps.length}
                currentStep={state.currentStepIndex}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 flex-1 min-h-[420px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <div className="text-xs text-muted-foreground mb-2">Visualization</div>
            <div className="flex-1 flex items-center justify-center">
              <VisualizationCanvas category={category} graph={graph} steps={state.steps} currentStepIndex={state.currentStepIndex} />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col">
            <ExecutionPanel steps={state.steps} currentStepIndex={state.currentStepIndex} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeVisualizerPage;
