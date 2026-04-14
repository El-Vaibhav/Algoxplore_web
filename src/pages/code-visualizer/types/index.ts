export type AlgorithmCategory = "graph" | "sorting" | "scheduling" | "tree" | "dp";
export type DPAlgorithm = "knapsack" | "lcs" | "mcm";
export type GraphAlgorithm = "bfs" | "dfs" | "prims" | "kruskal" | "toposort" | "dijkstra";
export type SortingAlgorithm = "bubble" | "selection" | "insertion" | "merge" | "quick";
export type SchedulingAlgorithm = "fcfs" | "sjf" | "srtf" | "roundrobin" | "priority";
export type TreeAlgorithm = "insert" | "search" | "inorder" | "preorder" | "postorder" | "delete";
export type Algorithm = GraphAlgorithm | SortingAlgorithm | SchedulingAlgorithm | TreeAlgorithm | DPAlgorithm;

export interface GraphData {
  [key: string]: (number | [number, number])[];
}

export interface SchedulingInput {
  arrival: number[];
  burst: number[];
  priority?: number[];
  quantum?: number;
}

export interface TreeInput {
  values: number[];
  operation: "insert" | "search" | "delete" | "inorder" | "preorder" | "postorder";
  searchValue?: number;
  deleteValue?: number;
}

export interface GanttBlock {
  processId: number;
  start: number;
  end: number;
}

export interface TreeNode {
  value: number;
  left?: TreeNode | null;
  right?: TreeNode | null;
  x?: number;
  y?: number;
  highlight?: "visit" | "found" | "insert" | "delete" | "compare" | null;
}

export interface ExecutionStep {
  type: "visit" | "compare" | "edge" | "update" | "enqueue" | "dequeue" | "push" | "pop" | "swap" | "sorted" | "set" | "result" | "gantt" | "schedule_done" | "tree_state";
  node?: number;
  description: string;
  // Sorting-specific fields
  array?: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  sortedIndices?: number[];
  highlightLine?: number;
  edge?: [number, number];
  // Scheduling-specific fields
  gantt?: GanttBlock[];
  waitingTime?: number[];
  turnaroundTime?: number[];
  // Tree-specific fields
  treeRoot?: TreeNode | null;
  highlightNode?: number | null;
  highlightPath?: number[];
  traversalComplete?: boolean;
  dpTable?: number[][];
  dpCell?: { i: number; j: number };
  dpCompare?: { from: [number, number][] };
}

export interface ExecutionPayload {
  code: string;
  category: AlgorithmCategory;
  algorithm: Algorithm;
  input: {
    graph?: GraphData;
    start?: number;
    array?: number[];
    scheduling?: SchedulingInput;
    tree?: TreeInput;
    dp?: {
      weights: number[];
      values: number[];
      capacity: number;
    };
  };
}

export interface ExecutionState {
  steps: ExecutionStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  isLoading: boolean;
  speed: number;
  error: string | null;
}
