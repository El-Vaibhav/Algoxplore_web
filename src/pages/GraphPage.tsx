import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import AlgoInfo from "@/components/AlgoInfo";
import SpeedControl from "@/components/SpeedControl";
import StepPanel from "@/components/steppanel";
import { useNavigate } from "react-router-dom";
import ComplexityPanel from "@/components/ComplexityPanel";
import { QuizToggle, QuizScoreBadge, QuizCard, QuizSummary } from "@/components/QuizMode";
import { graphQuiz, QuizQuestion } from "@/lib/quizGenerators";

import {
  generateRandomGraph,
  generateKosarajuGraph,
  bfs,
  dfs,
  dijkstra,
  bellmanFord,
  prim,
  kruskal,
  topologicalSort,
  kosaraju,
  graphAlgoInfo,
  type GraphNode,
  type GraphEdge,
  type GraphStep,
} from "@/lib/graphAlgorithms";

const algorithms = Object.keys(graphAlgoInfo);
const algoFns: Record<string, (...args: any[]) => GraphStep[]> = {
  BFS: bfs,
  DFS: dfs,
  Dijkstra: dijkstra,
  "Bellman-Ford": bellmanFord,
  "Prim's": prim,
  "Kruskal's": kruskal,
  "Topological Sort": topologicalSort,
  "Kosaraju's": kosaraju,
};


const GraphPage = () => {
  const navigate = useNavigate();
  const [algo, setAlgo] = useState("BFS");
  const [nodeCount, setNodeCount] = useState(8);
  const [startNode, setStartNode] = useState(0);
  const [endNode, setEndNode] = useState(0);
  const [graph, setGraph] = useState(() =>
    generateRandomGraph(
      8,
      graphAlgoInfo["BFS"].weighted,
      false
    )
  );
  const [currentStep, setCurrentStep] = useState<GraphStep | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [inputMode, setInputMode] = useState<"random" | "custom">("random");
  const [customEdges, setCustomEdges] = useState("");
  const timerRef = useRef<number | null>(null);
  const stepsRef = useRef<GraphStep[]>([]);
  const stepIdxRef = useRef(0);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);
  const [isAlgoFinished, setIsAlgoFinished] = useState(false);
  const currentQuestion =
    quizActive && stepIndex >= 0 && stepIndex < stepsRef.current.length
      ? graphQuiz(stepIndex, stepsRef.current)
      : null;
  const handleAnswer = (correct: boolean) => {
    setQuizTotal(prev => prev + 1);
    if (correct) setQuizScore(prev => prev + 1);

    // clear old timer (VERY IMPORTANT)
    if (timerRef.current) clearTimeout(timerRef.current);

    stepIdxRef.current++;

    // resume animation
    timerRef.current = window.setTimeout(() => {
      animate();
    }, 300);
  };

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  }, []);

  const animate = useCallback(() => {
    if (stepIdxRef.current >= stepsRef.current.length) {
      const lastIdx = stepsRef.current.length - 1;
      setCurrentStep(stepsRef.current[lastIdx]);
      setStepIndex(lastIdx);

      setIsAlgoFinished(true);
      stopAnimation();
      return;
    }

    const idx = stepIdxRef.current;

    setCurrentStep(stepsRef.current[idx]);
    setStepIndex(idx);

    // ✅ compute question BEFORE increment
    let nextQuestion = null;

    if (quizActive) {
      nextQuestion = graphQuiz(idx, stepsRef.current);

      // 🔥 KEEP MOVING until you find a valid question
      while (
        quizActive &&
        !nextQuestion &&
        stepIdxRef.current < stepsRef.current.length - 1
      ) {
        stepIdxRef.current++;
        nextQuestion = graphQuiz(stepIdxRef.current, stepsRef.current);
      }
    }

    // pause ONLY if valid question found
    if (quizActive && nextQuestion) {
      setCurrentStep(stepsRef.current[stepIdxRef.current]);
      setStepIndex(stepIdxRef.current);
      return;
    }

    // ✅ NOW increment (only when continuing)
    stepIdxRef.current++;

    timerRef.current = window.setTimeout(animate, 600 * speed);
  }, [speed, stopAnimation, quizActive]);

  const startAlgo = useCallback(() => {
    stopAnimation();

    let steps: GraphStep[];

    if (algo === "Dijkstra") {
      steps = dijkstra(graph.nodes, graph.edges, startNode, endNode);
    } else {
      const fn = algoFns[algo] || bfs;
      steps = fn(graph.nodes, graph.edges, startNode, endNode);
    }

    stepsRef.current = steps;
    stepIdxRef.current = 0;

    setIsRunning(true);
    animate();

  }, [algo, graph, startNode, endNode, animate, stopAnimation]);

  const reset = useCallback(() => {
    stopAnimation();

    // ✅ Clear refs safely
    stepsRef.current = [];
    stepIdxRef.current = 0;

    setCurrentStep(null);
    setStepIndex(-1);
    setIsRunning(false);

    // quiz reset
    setQuizScore(0);
    setQuizTotal(0);
    setIsAlgoFinished(false);

  }, [stopAnimation]);

  const generateNewGraph = () => {

    const weighted = graphAlgoInfo[algo]?.weighted ?? false

    if (algo === "Kosaraju's") {

      setGraph(generateKosarajuGraph(nodeCount))

    } else {

      setGraph(
        generateRandomGraph(
          nodeCount,
          weighted,
          algo === "Topological Sort"
        )
      )

    }

    reset()

  }

  const parseCustomEdges = () => {
    try {
      const matches = customEdges.match(/\([\d,\s]+\)/g);
      if (!matches) return;
      const edges: GraphEdge[] = [];
      let maxNode = 0;
      for (const m of matches) {
        const nums = m.replace(/[()]/g, "").split(",").map(Number);
        if (nums.length >= 2) {
          edges.push({ from: nums[0], to: nums[1], weight: nums[2] });
          maxNode = Math.max(maxNode, nums[0], nums[1]);
        }
      }
      const nodes: GraphNode[] = [];
      const cnt = maxNode + 1;
      for (let i = 0; i < cnt; i++) {
        const angle = (2 * Math.PI * i) / cnt;
        const r = 160;
        nodes.push({ id: i, x: 300 + r * Math.cos(angle), y: 250 + r * Math.sin(angle) });
      }
      setGraph({ nodes, edges });
      reset();
    } catch { /* ignore */ }
  };

  const info = graphAlgoInfo[algo];
  const svgW = 620;
  const svgH = 520;

  const levelColors = [
    "#1D4ED8",
    "#991B1B",
    "#F97316",
    "#22C55E",
    "#9333EA",
    "#EAB308",
    "#14B8A6"
  ];

  const compColors = [
    "#22C55E",
    "#86EFAC",
    "#6D4C6D",
    "#4FD1C5",
    "#D9F01A",
    "#F97316",
    "#A855F7"
  ]

  return (
    <AlgoLayout title="Graph Algorithms">
      {/* Top: Visualization + Controls side by side */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-5">
        {/* Graph Visualization - takes most space */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-3 md:p-4 min-h-[500px] flex flex-col items-center justify-center">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 w-full">
              <h3 className="text-sm font-semibold text-foreground">

                {currentStep?.description === "All Nodes Visited"
                  ? `${algo} Algorithm Visualization - All Nodes Visited`
                  : algo === "BFS"
                    ? `${algo} Algorithm Visualization - Level ${currentStep?.currentLevel ?? 0}`
                    : `${algo} Algorithm Visualization`
                }

              </h3>
              {currentStep && (
                <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  <span className="text-graph font-mono">Step {stepIndex + 1}</span> — {currentStep.description}
                </span>
              )}
            </div>
            <div className="flex flex-col xl:flex-row gap-4 md:gap-6 items-stretch xl:items-start w-full">
              <StepPanel
                steps={[...stepsRef.current]}
                currentStep={stepIndex}
              />
              <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full xl:w-[620px] h-auto rounded-lg bg-secondary/20">
                {graph.edges.map((e, i) => {
                  const from = graph.nodes[e.from];
                  const to = graph.nodes[e.to];
                  if (!from || !to) return null;
                  const isVisited = currentStep?.visitedEdges.some(
                    ([a, b]) => (a === e.from && b === e.to) || (a === e.to && b === e.from)
                  );
                  return (
                    <g key={i}>
                      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={isVisited ? "hsl(174, 72%, 50%)" : "hsl(240, 10%, 25%)"}
                        strokeWidth={isVisited ? 3 : 1.5} opacity={isVisited ? 1 : 0.5} />
                      {e.weight !== undefined && (
                        <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 8}
                          fill="hsl(33, 100%, 60%)" fontSize={12} textAnchor="middle" fontFamily="JetBrains Mono">
                          {e.weight}
                        </text>
                      )}
                    </g>
                  );
                })}

                {graph.nodes.map(node => {
                  const isCurrent = currentStep?.currentNode === node.id;
                  const isVisited = currentStep?.visitedNodes?.includes(node.id);

                  let fill = "hsl(240, 10%, 18%)";

                  const level = currentStep?.levels?.[node.id]

                  if (algo === "BFS" && level !== undefined && level >= 0) {
                    fill = levelColors[level % levelColors.length]
                  }

                  const comp = currentStep?.components?.[node.id]



                  if (comp !== undefined) {
                    fill = compColors[comp % compColors.length]
                  }

                  if (isVisited && algo !== "BFS" && algo !== "Kosaraju's") {
                    fill = "#22C55E"; // node already in topo order (green)
                  }

                  if (isCurrent) {
                    fill = "#F97316"; // current node being processed (orange)
                  }

                  return (
                    <g key={node.id}>
                      {isCurrent && <circle cx={node.x} cy={node.y} r={26} fill="none" stroke="hsl(262, 83%, 65%)" strokeWidth={2} opacity={0.5} />}
                      <circle cx={node.x} cy={node.y} r={20} fill={fill} stroke="hsl(174, 72%, 50%)" strokeWidth={1.5} />
                      <text x={node.x} y={node.y + 5} fill="hsl(0, 0%, 93%)" fontSize={13} textAnchor="middle" fontWeight="bold" fontFamily="Space Grotesk">
                        {node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {algo === "BFS" && currentStep?.levels && (
              <div className="flex gap-4 mt-3 flex-wrap justify-center">

                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  Current Node
                </div>

                {[...new Set(Object.values(currentStep.levels))]
                  .filter(l => l >= 0)
                  .map(level => (

                    <div key={level} className="flex items-center gap-2 text-xs">

                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: levelColors[level % levelColors.length] }}
                      />

                      Level {level}

                    </div>

                  ))}


              </div>
            )}
            {algo === "Kosaraju's" && currentStep?.components && (
              <div className="flex gap-4 mt-3 flex-wrap justify-center">

                <div className="flex items-center gap-2 text-xs">
                  <div className="w-4 h-4 bg-pink-500 rounded"></div>
                  Current Node
                </div>

                {[...new Set(Object.values(currentStep.components))].map(comp => (

                  <div key={comp} className="flex items-center gap-2 text-xs">

                    <div
                      className="w-4 h-4 rounded"
                      style={{ background: compColors[comp % compColors.length] }}
                    />

                    Component {comp + 1}

                  </div>

                ))}

              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Controls stacked */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
            <QuizToggle
              active={quizActive}
              onToggle={() => setQuizActive(prev => !prev)}
              accent="graph"
            />
            <QuizScoreBadge
              score={quizScore}
              total={quizTotal}
              accent="graph"
            />
          </div>
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Algorithm</h3>
            <div className="flex flex-wrap gap-1.5">
              {algorithms.map(a => (
                <button key={a} onClick={() => { setAlgo(a); stopAnimation(); setCurrentStep(null); setStepIndex(-1); }}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${algo === a ? "bg-graph/20 text-graph border border-graph/30 font-medium" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          {quizActive && currentQuestion && (
            <QuizCard
              question={currentQuestion}
              onAnswer={handleAnswer}
              accent="graph"
            />
          )}

          {quizActive && isAlgoFinished && quizTotal > 0 && (
            <QuizSummary
              score={quizScore}
              total={quizTotal}
              onRetry={() => {
                setQuizScore(0);
                setQuizTotal(0);
                setIsAlgoFinished(false);
              }}
              accent="graph"
            />
          )}

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Graph Input</h3>
            <div className="flex gap-2">
              <button onClick={() => setInputMode("random")} className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${inputMode === "random" ? "bg-graph/20 text-graph border border-graph/30" : "bg-secondary text-secondary-foreground"}`}>Random</button>
              <button onClick={() => setInputMode("custom")} className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${inputMode === "custom" ? "bg-graph/20 text-graph border border-graph/30" : "bg-secondary text-secondary-foreground"}`}>Custom</button>
            </div>
            {inputMode === "random" ? (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Nodes: {nodeCount}</label>
                <input type="range" min={4} max={12} value={nodeCount} onChange={e => setNodeCount(+e.target.value)} className="w-full accent-graph" />
                <button onClick={generateNewGraph} className="w-full py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Generate</button>
              </div>
            ) : (
              <div className="space-y-2">
                <input value={customEdges} onChange={e => setCustomEdges(e.target.value)}
                  placeholder={info.weighted ? "(0,1,5),(1,2,3)" : "(0,1),(1,2)"}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:border-graph/50 focus:outline-none transition-colors" />
                <button onClick={parseCustomEdges} className="w-full py-1.5 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Set Graph</button>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Start Node</label>
              <input type="number" min={0} max={graph.nodes.length - 1} value={startNode}
                onChange={e => setStartNode(Math.min(+e.target.value, graph.nodes.length - 1))}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-graph/50 focus:outline-none transition-colors" />
            </div>
            {(algo === "Dijkstra" || algo === "Bellman-Ford") && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">End Node</label>
                <input
                  type="number"
                  min={0}
                  max={graph.nodes.length - 1}
                  value={endNode}
                  onChange={(e) => setEndNode(Math.min(+e.target.value, graph.nodes.length - 1))}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-graph/50 focus:outline-none transition-colors"
                />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
            <div className="flex gap-2">
              <button onClick={startAlgo} disabled={isRunning}
                className="flex-1 py-2 text-sm rounded-lg bg-graph text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {isRunning ? "Running..." : "▶ Start"}
              </button>
              <button onClick={reset} className="flex-1 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Reset</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Algorithm Info spanning full width */}
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
                <div className="text-sm font-mono mt-1 text-graph">{info.timeComplexity[k]}</div>
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
      <ComplexityPanel category="graph" accentClass="text-graph" />

    </AlgoLayout >
  );
};



export default GraphPage;
