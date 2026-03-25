import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import SpeedControl from "@/components/SpeedControl";
import {
  generateRandomGraph, bfs, dfs, dijkstra,
  graphAlgoInfo, type GraphNode, type GraphEdge, type GraphStep,
  kosaraju,
  bellmanFord,
  prim,
  kruskal,
  topologicalSort,
} from "@/lib/graphAlgorithms";

const algorithms = Object.keys(graphAlgoInfo);
const algoFns: Record<
  string,
  (n: GraphNode[], e: GraphEdge[], s: number, end?: number) => GraphStep[]
> = {
  BFS: bfs,
  DFS: dfs,
  Dijkstra: dijkstra,
  "Bellman-Ford": bellmanFord,
  "Prim's": (n, e) => prim(n, e),
  "Kruskal's": (n, e) => kruskal(n, e),
  "Topological Sort": (n, e) => topologicalSort(n, e),
  "Kosaraju's": (n, e) => kosaraju(n, e),
};

interface PanelState {
  algo: string;
  steps: GraphStep[];
  stepIndex: number;
  currentStep: GraphStep | null;
  totalSteps: number;
  done: boolean;
}

const GraphComparePage = () => {
  const [nodeCount, setNodeCount] = useState(8);
  const [graph, setGraph] = useState(() => generateRandomGraph(8, false));
  const [algoA, setAlgoA] = useState("BFS");
  const [algoB, setAlgoB] = useState("DFS");
  const [startNode, setStartNode] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [panelA, setPanelA] = useState<PanelState>({ algo: "BFS", steps: [], stepIndex: 0, currentStep: null, totalSteps: 0, done: false });
  const [panelB, setPanelB] = useState<PanelState>({ algo: "DFS", steps: [], stepIndex: 0, currentStep: null, totalSteps: 0, done: false });

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
    if (a.stepIndex >= a.steps.length && b.stepIndex >= b.steps.length) {
      setPanelA(prev => ({ ...prev, done: true }));
      setPanelB(prev => ({ ...prev, done: true }));
      setIsRunning(false);
      return;
    }
    if (a.stepIndex < a.steps.length) {
      setPanelA(prev => ({ ...prev, currentStep: prev.steps[prev.stepIndex], stepIndex: prev.stepIndex + 1, done: prev.stepIndex + 1 >= prev.steps.length }));
    }
    if (b.stepIndex < b.steps.length) {
      setPanelB(prev => ({ ...prev, currentStep: prev.steps[prev.stepIndex], stepIndex: prev.stepIndex + 1, done: prev.stepIndex + 1 >= prev.steps.length }));
    }
    timerRef.current = window.setTimeout(animate, 200 * speed);
  }, [speed]);

  const startCompare = useCallback(() => {
    stopAnimation();
    const weighted = graphAlgoInfo[algoA]?.weighted || graphAlgoInfo[algoB]?.weighted;
    const g = generateRandomGraph(nodeCount, weighted);
    setGraph(g);
    const fnA = algoFns[algoA] || bfs;
    const fnB = algoFns[algoB] || bfs;
    const endNode = Math.floor(Math.random() * nodeCount);
    const stepsA = fnA(g.nodes, g.edges, startNode, endNode);
    const stepsB = fnB(g.nodes, g.edges, startNode, endNode);
    const newA: PanelState = { algo: algoA, steps: stepsA, stepIndex: 0, currentStep: null, totalSteps: stepsA.length, done: false };
    const newB: PanelState = { algo: algoB, steps: stepsB, stepIndex: 0, currentStep: null, totalSteps: stepsB.length, done: false };
    setPanelA(newA);
    setPanelB(newB);
    setIsRunning(true);
    setTimeout(() => {
      panelARef.current = newA;
      panelBRef.current = newB;
      animate();
    }, 50);
  }, [algoA, algoB, nodeCount, startNode, animate, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();
    setPanelA(prev => ({ ...prev, currentStep: null, stepIndex: 0, done: false, steps: [], totalSteps: 0 }));
    setPanelB(prev => ({ ...prev, currentStep: null, stepIndex: 0, done: false, steps: [], totalSteps: 0 }));
  }, [stopAnimation]);

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const svgW = 320;
  const svgH = 220;

  const renderGraphPanel = (panel: PanelState, color: string) => {
    // Scale nodes to fit panel
    const scaleX = svgW / 550;
    const scaleY = svgH / 490;

    return (
      <div className="flex-1 min-w-0 space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 h-[360px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-sm font-bold ${color}`}>{panel.algo}</h3>
            <div className="flex items-center gap-2">
              {panel.done && (
                <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full">✓ {panel.totalSteps} steps</span>
              )}
              {panel.currentStep && !panel.done && (
                <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {panel.currentStep.description}
                </span>
              )}
            </div>
          </div>
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="mx-auto w-[90%] h-[240px] rounded-lg bg-secondary/20"
          >
            {graph.edges.map((e, i) => {
              const from = graph.nodes[e.from];
              const to = graph.nodes[e.to];
              if (!from || !to) return null;
              const isVisited = panel.currentStep?.visitedEdges.some(
                ([a, b]) => (a === e.from && b === e.to) || (a === e.to && b === e.from)
              );
              return (
                <g key={i}>
                  <line x1={from.x * scaleX} y1={from.y * scaleY} x2={to.x * scaleX} y2={to.y * scaleY}
                    stroke={isVisited ? "hsl(174, 72%, 50%)" : "hsl(240, 10%, 25%)"} strokeWidth={isVisited ? 3 : 1.5} opacity={isVisited ? 1 : 0.5} />
                  {e.weight !== undefined && (
                    <text x={(from.x + to.x) / 2 * scaleX} y={(from.y + to.y) / 2 * scaleY - 6}
                      fill="hsl(33, 100%, 60%)" fontSize={10} textAnchor="middle" fontFamily="JetBrains Mono">{e.weight}</text>
                  )}
                </g>
              );
            })}
            {graph.nodes.map(node => {
              const isVisited = panel.currentStep?.visitedNodes.includes(node.id);
              const isCurrent = panel.currentStep?.currentNode === node.id;
              let fill = "hsl(240, 10%, 18%)";
              if (isCurrent) fill = "hsl(262, 83%, 65%)";
              else if (isVisited) fill = "hsl(174, 72%, 50%)";
              return (
                <g key={node.id}>
                  {isCurrent && <circle cx={node.x * scaleX} cy={node.y * scaleY} r={22} fill="none" stroke="hsl(262, 83%, 65%)" strokeWidth={2} opacity={0.5} />}
                  <circle cx={node.x * scaleX} cy={node.y * scaleY} r={16} fill={fill} stroke="hsl(174, 72%, 50%)" strokeWidth={1.5} />
                  <text x={node.x * scaleX} y={node.y * scaleY + 4} fill="hsl(0, 0%, 93%)" fontSize={11} textAnchor="middle" fontWeight="bold" fontFamily="Space Grotesk">{node.id}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(["best", "average", "worst"] as const).map(k => (
              <div key={k} className="p-2 rounded-lg bg-secondary/50">
                <div className="text-[10px] text-muted-foreground capitalize">{k}</div>
                <div className={`text-xs font-mono mt-0.5 ${color}`}>{graphAlgoInfo[panel.algo].timeComplexity[k]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AlgoLayout title="Graph — Compare">
      <div className="w-full rounded-xl border border-border bg-card p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm A</label>
            <select value={algoA} onChange={e => setAlgoA(e.target.value)} disabled={isRunning}
              className="block w-40 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <span className="text-muted-foreground text-lg font-bold pb-1">vs</span>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm B</label>
            <select value={algoB} onChange={e => setAlgoB(e.target.value)} disabled={isRunning}
              className="block w-40 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nodes: {nodeCount}</label>
            <input type="range" min={4} max={12} value={nodeCount} onChange={e => setNodeCount(+e.target.value)} className="w-24 accent-graph" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Start</label>
            <input type="number" min={0} max={nodeCount - 1} value={startNode} onChange={e => setStartNode(+e.target.value)}
              className="w-16 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none" />
          </div>
          <div className="w-36">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button onClick={startCompare} disabled={isRunning}
              className="px-5 py-2 text-sm rounded-lg bg-graph text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50">
              {isRunning ? "Running..." : "▶ Compare"}
            </button>
            <button onClick={reset} className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80">Reset</button>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {renderGraphPanel(panelA, "text-graph")}
        <div className="w-px bg-border self-stretch" />
        {renderGraphPanel(panelB, "text-accent")}
      </div>

      {panelA.done && panelB.done && (
        <div className="mt-5 rounded-xl border border-border bg-card p-5 text-center animate-fade-in">
          <h3 className="text-lg font-bold text-foreground mb-1">
            {panelA.totalSteps < panelB.totalSteps ? `🏆 ${panelA.algo} finished first!` : panelA.totalSteps > panelB.totalSteps ? `🏆 ${panelB.algo} finished first!` : "🤝 Both finished together!"}
          </h3>
          <p className="text-sm text-muted-foreground">
            <span className="text-graph font-mono">{panelA.algo}: {panelA.totalSteps} steps</span>{" vs "}
            <span className="text-accent font-mono">{panelB.algo}: {panelB.totalSteps} steps</span>
          </p>
        </div>
      )}
    </AlgoLayout>
  );
};

export default GraphComparePage;
