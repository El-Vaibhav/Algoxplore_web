import { useMemo } from "react";
import type { GraphData, ExecutionStep, AlgorithmCategory, GanttBlock, TreeNode } from "../types";

interface VisualizationCanvasProps {
  category: AlgorithmCategory;
  graph: GraphData;
  steps: ExecutionStep[];
  currentStepIndex: number;
  algorithm?: string;
}

// ─── Graph visualization ─────────────────────────────
const GraphCanvas = ({ graph, steps, currentStepIndex }: { graph: GraphData; steps: ExecutionStep[]; currentStepIndex: number }) => {
  const nodeIds = useMemo(() => Object.keys(graph).map(Number), [graph]);

  const positions = useMemo(() => {
    const map: Record<number, { x: number; y: number }> = {};
    const n = nodeIds.length;
    if (n === 0) return map;
    const cx = 250, cy = 180, r = Math.min(140, 60 + n * 15);
    nodeIds.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      map[id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    return map;
  }, [nodeIds]);

  const currentStep = steps[currentStepIndex] || null;

  const visitedSet = useMemo(() => {
    const s = new Set<number>();
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      if (steps[i].node != null) s.add(steps[i].node!);
    }
    return s;
  }, [steps, currentStepIndex]);

  const currentNode = currentStep?.node ?? null;

  const mstEdges = useMemo(() => {
    const edges = [];
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      if (steps[i].type === "edge" && steps[i].edge) edges.push(steps[i].edge);
    }
    return edges;
  }, [steps, currentStepIndex]);

  const comparingEdge = currentStep?.type === "compare" ? currentStep.edge : null;

  const edges = useMemo(() => {
    const list: { from: number; to: number; weight: number | null }[] = [];
    const seen = new Set();
    for (const [key, neighbors] of Object.entries(graph)) {
      for (const item of neighbors) {
        const from = Number(key);
        const to = Array.isArray(item) ? item[0] : item;
        const weight = Array.isArray(item) ? item[1] : null;
        const edgeKey = from < to ? `${from}-${to}` : `${to}-${from}`;
        if (!seen.has(edgeKey)) { seen.add(edgeKey); list.push({ from, to, weight }); }
      }
    }
    return list;
  }, [graph]);

  if (nodeIds.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Apply a graph to begin</div>;
  }

  return (
    <svg viewBox="0 0 500 360" className="w-full h-full">
      {edges.map((e, i) => {
        const from = positions[e.from];
        const to = positions[e.to];
        if (!from || !to) return null;
        const dx = to.x - from.x, dy = to.y - from.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const r = 22;

        let edgeClass = "stroke-border";
        const matchEdge = (edge: any) => edge && ((e.from === edge[0] && e.to === edge[1]) || (e.from === edge[1] && e.to === edge[0]));
        if (mstEdges.some(ed => matchEdge(ed))) edgeClass = "stroke-accent";
        else if (matchEdge(comparingEdge)) edgeClass = "stroke-primary";

        return (
          <g key={i}>
            <line x1={from.x + (dx / len) * r} y1={from.y + (dy / len) * r} x2={to.x - (dx / len) * r} y2={to.y - (dy / len) * r} className={`${edgeClass} transition-all duration-300`} strokeWidth={2} />
            {e.weight !== null && (() => {
              const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
              const offset = 12, nx = -dy / len, ny = dx / len;
              return <text x={mx + nx * offset} y={my + ny * offset} textAnchor="middle" dominantBaseline="central" className="text-[10px] fill-muted-foreground">{e.weight}</text>;
            })()}
          </g>
        );
      })}

      {nodeIds.map((id) => {
        const pos = positions[id];
        if (!pos) return null;
        const isCurrent = id === currentNode;
        const isVisited = visitedSet.has(id);
        return (
          <g key={id} style={{ transition: "all 0.3s ease" }}>
            <circle cx={pos.x} cy={pos.y} r={20} className={isCurrent ? "fill-primary stroke-primary" : isVisited ? "fill-accent/30 stroke-accent" : "fill-muted stroke-border"} strokeWidth={2} />
            <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="central" className={`text-xs font-semibold ${isCurrent ? "fill-primary-foreground" : "fill-foreground"}`}>{id}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Sorting visualization (bar chart) ───────────────
const SortingCanvas = ({ steps, currentStepIndex }: { steps: ExecutionStep[]; currentStepIndex: number }) => {
  const step = currentStepIndex >= 0 && currentStepIndex < steps.length ? steps[currentStepIndex] : null;
  const arr = step?.array || [];
  const comparing = step?.comparing || null;
  const swapping = step?.swapping || null;
  const sortedIndices = new Set(step?.sortedIndices || []);

  if (arr.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Apply an array to begin</div>;
  }

  const WIDTH = 500, HEIGHT = 300, PADDING_TOP = 30, PADDING_BOTTOM = 30;
  const usableHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const maxVal = Math.max(...arr, 1);
  const barWidth = Math.min(50, Math.max(20, (WIDTH - 40) / arr.length));
  const gap = Math.min(6, Math.max(2, (WIDTH - arr.length * barWidth) / (arr.length + 1)));
  const totalWidth = arr.length * barWidth + (arr.length + 1) * gap;
  const offsetX = (WIDTH - totalWidth) / 2;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
      <g>
        {[{ label: "Comparing", cls: "fill-primary" }, { label: "Swapping", cls: "fill-destructive" }, { label: "Sorted", cls: "fill-accent" }].map((item, i) => (
          <g key={item.label} transform={`translate(${20 + i * 120}, 10)`}>
            <rect width={10} height={10} rx={2} className={item.cls} />
            <text x={14} y={9} className="fill-muted-foreground text-[10px]">{item.label}</text>
          </g>
        ))}
      </g>

      {arr.map((val, i) => {
        const height = (val / maxVal) * usableHeight;
        const x = offsetX + gap + i * (barWidth + gap);
        const y = HEIGHT - PADDING_BOTTOM - height;
        const isComparing = Array.isArray(comparing) && comparing.includes(i);
        const isSwapping = Array.isArray(swapping) && swapping.includes(i);
        const isSorted = sortedIndices.has(i);

        let fillClass = "fill-muted-foreground/40";
        if (isSorted) fillClass = "fill-accent";
        else if (isSwapping) fillClass = "fill-destructive";
        else if (isComparing) fillClass = "fill-primary";

        return (
          <g key={i}>
            <rect x={x} y={y} width={barWidth} height={height} rx={4} className={`${fillClass} transition-all duration-300 ease-in-out`} />
            <text x={x + barWidth / 2} y={HEIGHT - 5} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">{val}</text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Scheduling visualization (Gantt chart) ──────────
const PROCESS_COLORS = [
  "fill-primary", "fill-accent", "fill-destructive", "fill-warning",
  "fill-secondary", "fill-primary/70", "fill-accent/70", "fill-destructive/70",
];

const SchedulingCanvas = ({ steps, currentStepIndex }: { steps: ExecutionStep[]; currentStepIndex: number }) => {
  // Find the latest gantt data up to current step
  const { gantt, waitingTime, turnaroundTime } = useMemo(() => {
    let g: GanttBlock[] = [];
    let wt: number[] = [];
    let tat: number[] = [];
    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
      if (steps[i].gantt && Array.isArray(steps[i].gantt)) {
        g = steps[i].gantt;
      }
      if (steps[i].waitingTime) wt = steps[i].waitingTime!;
      if (steps[i].turnaroundTime) tat = steps[i].turnaroundTime!;
    }
    return { gantt: g, waitingTime: wt, turnaroundTime: tat };
  }, [steps, currentStepIndex]);

  if (gantt.length === 0) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Run a scheduling algorithm to see the Gantt chart</div>;
  }

  const maxTime = Math.max(...gantt.map((b) => b.end), 1);
  const WIDTH = 500, HEIGHT = 300;
  const CHART_Y = 60, CHART_H = 50;
  const LEFT = 40, RIGHT = 20;
  const chartW = WIDTH - LEFT - RIGHT;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
      {/* Title */}
      <text x={WIDTH / 2} y={20} textAnchor="middle" className="fill-foreground text-xs font-semibold">Gantt Chart</text>

      {/* Legend */}
      {Array.from(new Set(gantt.map((b) => b.processId))).map((pid, i) => (
        <g key={pid} transform={`translate(${20 + i * 65}, 32)`}>
          <rect width={10} height={10} rx={2} className={PROCESS_COLORS[pid % PROCESS_COLORS.length]} />
          <text x={14} y={9} className="fill-muted-foreground text-[9px]">P{pid}</text>
        </g>
      ))}

      {/* Gantt blocks */}
      {gantt.map((block, i) => {
        const x = LEFT + (block.start / maxTime) * chartW;
        const w = ((block.end - block.start) / maxTime) * chartW;
        return (
          <g key={i}>
            <rect x={x} y={CHART_Y} width={Math.max(w - 1, 2)} height={CHART_H} rx={4} className={`${PROCESS_COLORS[block.processId % PROCESS_COLORS.length]} transition-all duration-300`} />
            <text x={x + Math.max(w - 1, 2) / 2} y={CHART_Y + CHART_H / 2} textAnchor="middle" dominantBaseline="central" className="fill-primary-foreground text-[10px] font-bold">
              P{block.processId}
            </text>
          </g>
        );
      })}

      {/* Time axis */}
      {Array.from(new Set([0, ...gantt.map((b) => b.start), ...gantt.map((b) => b.end)])).sort((a, b) => a - b).map((t) => {
        const x = LEFT + (t / maxTime) * chartW;
        return (
          <g key={t}>
            <line x1={x} y1={CHART_Y + CHART_H} x2={x} y2={CHART_Y + CHART_H + 5} className="stroke-muted-foreground" strokeWidth={1} />
            <text x={x} y={CHART_Y + CHART_H + 15} textAnchor="middle" className="fill-muted-foreground text-[9px] font-mono">{t}</text>
          </g>
        );
      })}

      {/* Stats table */}
      {waitingTime.length > 0 && (
        <g>
          <text x={LEFT} y={CHART_Y + CHART_H + 40} className="fill-foreground text-[10px] font-semibold">Process Stats</text>
          {["Process", "WT", "TAT"].map((h, i) => (
            <text key={h} x={LEFT + i * 80} y={CHART_Y + CHART_H + 55} className="fill-muted-foreground text-[9px] font-semibold">{h}</text>
          ))}
          {waitingTime.map((wt, i) => (
            <g key={i}>
              <text x={LEFT} y={CHART_Y + CHART_H + 70 + i * 14} className="fill-foreground text-[9px]">P{i}</text>
              <text x={LEFT + 80} y={CHART_Y + CHART_H + 70 + i * 14} className="fill-foreground text-[9px] font-mono">{wt}</text>
              <text x={LEFT + 160} y={CHART_Y + CHART_H + 70 + i * 14} className="fill-foreground text-[9px] font-mono">{turnaroundTime[i]}</text>
            </g>
          ))}
          <text x={LEFT} y={CHART_Y + CHART_H + 75 + waitingTime.length * 14} className="fill-primary text-[9px] font-semibold">
            Avg WT: {(waitingTime.reduce((a, b) => a + b, 0) / waitingTime.length).toFixed(1)} | Avg TAT: {(turnaroundTime.reduce((a, b) => a + b, 0) / turnaroundTime.length).toFixed(1)}
          </text>
        </g>
      )}
    </svg>
  );
};

const DPCanvas = ({ steps, currentStepIndex, algorithm }: any) => {
  let table = [];
  let current = null;
  let compare = [];
  let step = null;


  for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {
    if (steps[i].dpTable) {
      table = steps[i].dpTable;
    }

    if (i === currentStepIndex) {
      current = steps[i].dpCell;
      compare = steps[i].dpCompare || [];
      step = steps[i];
    }
  }


  if (!table || table.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        Run DP algorithm to see table
      </div>
    );
  }

  const cols = table[0].length;
  const rows = table.length;

  // 🔥 Fit inside container (both width + height)
  const maxWidth = 500;
  const maxHeight = 500;

  const cellSize = Math.min(
    80,
    Math.floor(maxWidth / cols),
    Math.floor(maxHeight / rows)
  );

  return (
    <div className="w-full h-full flex items-center justify-center p-22 md:p-40">
      <svg
        viewBox={`0 0 ${cols * cellSize} ${rows * cellSize}`}
        className="w-auto h-auto max-w-full max-h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {table.map((row: number[], i: number) =>
          row.map((val: number, j: number) => {
            let fill = "fill-muted";

            if (step?.type === "result") {
              if (algorithm?.toLowerCase() === "mcm") {
                if (i === 1 && j === table.length - 1) {
                  fill = "fill-green-500";
                }
              } else {
                if (
                  i === table.length - 1 &&
                  j === table[0].length - 1
                ) {
                  fill = "fill-green-500";
                }
              }
            }

            else if (current && current.i === i && current.j === j) {
              fill = "fill-primary";
            } else if (
              compare.some(
                (c: any) => c[0] === i && c[1] === j
              )
            ) {
              fill = "fill-accent";
            }

            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={j * cellSize}
                  y={i * cellSize}
                  width={cellSize}
                  height={cellSize}
                  className={`${fill} stroke-border transition-all duration-300`}
                  strokeWidth={1}
                />
                <text
                  x={j * cellSize + cellSize / 2}
                  y={i * cellSize + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-xs fill-foreground"
                >
                  {val}
                </text>
              </g>
            );
          })
        )}
      </svg>
    </div>
  );
};

// ─── Tree visualization (SVG BST) ───────────────────
const TreeCanvas = ({ steps, currentStepIndex }: { steps: ExecutionStep[]; currentStepIndex: number }) => {
  // Find latest tree state
  const { tree, highlightNode, highlightPath, traversalComplete } = useMemo(() => {
    let lastValidTree: TreeNode | null = null;
    let hn: number | null = null;
    let hp: number[] = [];
    let tc = false;

    for (let i = 0; i <= currentStepIndex && i < steps.length; i++) {

      // ✅ ONLY update if NOT null
      if (steps[i].treeRoot !== undefined && steps[i].treeRoot !== null) {
        lastValidTree = steps[i].treeRoot;
      }

      if (steps[i].highlightNode !== undefined) {
        hn = steps[i].highlightNode;
      }

      if (steps[i].highlightPath) {
        hp = steps[i].highlightPath;
      }

      if (steps[i].traversalComplete !== undefined) {
        tc = steps[i].traversalComplete;
      }
    }

    return {
      tree: lastValidTree,
      highlightNode: hn,
      highlightPath: new Set(hp),
      traversalComplete: tc,
    };
  }, [steps, currentStepIndex]);

  if (!tree) {
    return <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Run a tree algorithm to see the visualization</div>;
  }

  // Lay out the tree
  const WIDTH = 500, HEIGHT = 360;
  const nodes: { value: number; x: number; y: number; parent?: { x: number; y: number } }[] = [];

  function layoutTree(node: TreeNode | null, depth: number, left: number, right: number, parentPos?: { x: number; y: number }) {
    if (!node) return;
    const x = (left + right) / 2;
    const y = 40 + depth * 60;
    nodes.push({ value: node.value, x, y, parent: parentPos });
    layoutTree(node.left || null, depth + 1, left, x, { x, y });
    layoutTree(node.right || null, depth + 1, x, right, { x, y });
  }

  layoutTree(tree, 0, 20, WIDTH - 20);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full">
      {/* Edges */}
      {nodes.map((n, i) => {
        if (!n.parent) return null;
        return (
          <line
            key={`e-${i}`}
            x1={n.parent.x} y1={n.parent.y}
            x2={n.x} y2={n.y}
            className="stroke-border transition-all duration-300"
            strokeWidth={2}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isHighlight = n.value === highlightNode;
        const inPath = highlightPath.has(n.value);
        return (
          <g key={`n-${i}`} style={{ transition: "all 0.3s ease" }}>
            <circle
              cx={n.x} cy={n.y} r={18}
              className={
                isHighlight ? "fill-primary stroke-primary" :
                  inPath && traversalComplete ? "fill-violet-500/35 stroke-violet-400" :
                    inPath ? "fill-accent/30 stroke-accent" :
                    "fill-muted stroke-border"
              }
              strokeWidth={2}
            />
            <text
              x={n.x} y={n.y}
              textAnchor="middle" dominantBaseline="central"
              className={`text-xs font-semibold ${isHighlight ? "fill-primary-foreground" : "fill-foreground"}`}
            >
              {n.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};



const VisualizationCanvas = ({ category, graph, steps, currentStepIndex, algorithm }: VisualizationCanvasProps) => {
  if (category === "sorting") return <SortingCanvas steps={steps} currentStepIndex={currentStepIndex} />;
  if (category === "scheduling") return <SchedulingCanvas steps={steps} currentStepIndex={currentStepIndex} />;
  if (category === "tree") return <TreeCanvas steps={steps} currentStepIndex={currentStepIndex} />;
  if (category === "dp") return <DPCanvas steps={steps} currentStepIndex={currentStepIndex} algorithm={algorithm} />;
  return <GraphCanvas graph={graph} steps={steps} currentStepIndex={currentStepIndex} />;
};

export default VisualizationCanvas;
