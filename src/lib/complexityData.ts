// Big-O complexity data for all algorithms, with growth-rate sample points for charting

export interface ComplexityEntry {
  name: string;
  category: string;
  time: { best: string; average: string; worst: string };
  space: string;
  stable?: boolean;
  notes?: string;
}

export const complexityData: Record<string, ComplexityEntry[]> = {
  graph: [
    { name: "BFS", category: "graph", time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)", notes: "Level-order traversal, unweighted shortest path" },
    { name: "DFS", category: "graph", time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)", notes: "Depth-first traversal, cycle detection" },
    { name: "Dijkstra", category: "graph", time: { best: "O((V+E)logV)", average: "O((V+E)logV)", worst: "O((V+E)logV)" }, space: "O(V)", notes: "Single-source shortest path, non-negative weights" },
    { name: "Bellman-Ford", category: "graph", time: { best: "O(V·E)", average: "O(V·E)", worst: "O(V·E)" }, space: "O(V)", notes: "Handles negative weights, detects negative cycles" },
    { name: "Prim's", category: "graph", time: { best: "O(E logV)", average: "O(E logV)", worst: "O(E logV)" }, space: "O(V)", notes: "Minimum spanning tree, greedy" },
    { name: "Kruskal's", category: "graph", time: { best: "O(E logE)", average: "O(E logE)", worst: "O(E logE)" }, space: "O(V)", notes: "MST using Union-Find" },
    { name: "Topological Sort", category: "graph", time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)", notes: "DAG ordering" },
    { name: "Kosaraju's", category: "graph", time: { best: "O(V+E)", average: "O(V+E)", worst: "O(V+E)" }, space: "O(V)", notes: "Strongly connected components" },
  ],
  sorting: [
    { name: "Bubble Sort", category: "sorting", time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" }, space: "O(1)", stable: true },
    { name: "Insertion Sort", category: "sorting", time: { best: "O(n)", average: "O(n²)", worst: "O(n²)" }, space: "O(1)", stable: true },
    { name: "Selection Sort", category: "sorting", time: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" }, space: "O(1)", stable: false },
    { name: "Merge Sort", category: "sorting", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", stable: true },
    { name: "Quick Sort", category: "sorting", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" }, space: "O(log n)", stable: false },
  ],
  scheduling: [
    { name: "FCFS", category: "scheduling", time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(n)", notes: "First Come First Served, non-preemptive" },
    { name: "SJF", category: "scheduling", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", notes: "Shortest Job First, optimal avg waiting time" },
    { name: "SRTF", category: "scheduling", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", notes: "Preemptive SJF" },
    { name: "Round Robin", category: "scheduling", time: { best: "O(n)", average: "O(n·q)", worst: "O(n·q)" }, space: "O(n)", notes: "Time-sliced, fair scheduling" },
    { name: "Priority", category: "scheduling", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", notes: "Priority-based, risk of starvation" },
  ],
  tree: [
    { name: "BST Insert", category: "tree", time: { best: "O(log n)", average: "O(log n)", worst: "O(n)" }, space: "O(1)", notes: "Degrades to O(n) for skewed trees" },
    { name: "BST Search", category: "tree", time: { best: "O(1)", average: "O(log n)", worst: "O(n)" }, space: "O(1)" },
    { name: "BST Delete", category: "tree", time: { best: "O(log n)", average: "O(log n)", worst: "O(n)" }, space: "O(1)" },
    { name: "In-Order", category: "tree", time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(h)", notes: "h = height of tree" },
    { name: "Pre-Order", category: "tree", time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(h)" },
    { name: "Post-Order", category: "tree", time: { best: "O(n)", average: "O(n)", worst: "O(n)" }, space: "O(h)" },
    { name: "AVL Construction", category: "tree", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", notes: "Built by repeated AVL insertions, maintains balance after each insertion" },

    {
      name: "Min Heap Construction",
      category: "heap",
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
      notes: "Built using bottom-up heapify (optimal approach)"
    },

    {
      name: "Max Heap Construction",
      category: "heap",
      time: { best: "O(n)", average: "O(n)", worst: "O(n)" },
      space: "O(1)",
      notes: "Built using bottom-up heapify (optimal approach)"
    }],
  search: [
    { name: "Binary Search", category: "search", time: { best: "O(1)", average: "O(log n)", worst: "O(log n)" }, space: "O(1)", notes: "Requires sorted array" },
    { name: "A* Pathfinding", category: "search", time: { best: "O(E)", average: "O(E log V)", worst: "O(V²)" }, space: "O(V)", notes: "Heuristic-based, optimal if admissible" },
    { name: "AO* Algorithm", category: "search", time: { best: "O(V)", average: "O(V·E)", worst: "O(V·E)" }, space: "O(V)", notes: "AND-OR graph search" },
  ],
  dp: [
    { name: "0/1 Knapsack", category: "dp", time: { best: "O(n·W)", average: "O(n·W)", worst: "O(n·W)" }, space: "O(n·W)", notes: "Pseudo-polynomial, W = capacity" },
    { name: "Fractional Knapsack", category: "dp", time: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" }, space: "O(n)", notes: "Greedy approach, not true DP" },
    { name: "LCS", category: "dp", time: { best: "O(m·n)", average: "O(m·n)", worst: "O(m·n)" }, space: "O(m·n)", notes: "m, n = string lengths" },
    { name: "Matrix Chain", category: "dp", time: { best: "O(n³)", average: "O(n³)", worst: "O(n³)" }, space: "O(n²)", notes: "Interval DP, n = number of matrices" },
    {
      name: "N-Queens",
      category: "backtracking",
      time: { best: "O(n!)", average: "O(n!)", worst: "O(n!)" },
      space: "O(n)",
      notes: "Place queens row by row with pruning using column and diagonal checks"
    },

    {
      name: "Rat in a Maze",
      category: "backtracking",
      time: { best: "O(n²)", average: "O(4^(n²))", worst: "O(4^(n²))" },
      space: "O(n²)",
      notes: "Explore all possible paths (4 directions) with backtracking and visited tracking"
    },

    {
      name: "Sudoku Solver",
      category: "backtracking",
      time: { best: "O(1)", average: "O(9^(n²))", worst: "O(9^(n²))" },
      space: "O(n²)",
      notes: "Try digits 1–9 in empty cells with constraint checks (row, column, subgrid)"
    },
  ],
};

// Generate growth-rate data points for charting
type GrowthFn = (n: number) => number;

const growthFunctions: Record<string, GrowthFn> = {
  "O(1)": () => 1,
  "O(log n)": (n) => Math.log2(n),
  "O(n)": (n) => n,
  "O(n log n)": (n) => n * Math.log2(n),
  "O(n²)": (n) => n * n,
  "O(n³)": (n) => n * n * n,
  "O(V+E)": (n) => n * 2,
  "O((V+E)logV)": (n) => n * 2 * Math.log2(n),
  "O(V·E)": (n) => n * n,
  "O(E logV)": (n) => n * Math.log2(n),
  "O(E logE)": (n) => n * Math.log2(n),
  "O(E)": (n) => n,
  "O(E log V)": (n) => n * Math.log2(n),
  "O(V²)": (n) => n * n,
  "O(V)": (n) => n,
  "O(h)": (n) => Math.log2(n),
  "O(n·W)": (n) => n * n,
  "O(n·q)": (n) => n * n,
  "O(m·n)": (n) => n * n,
};

function getGrowth(notation: string): GrowthFn {
  return growthFunctions[notation] || ((n) => n);
}

export interface GrowthPoint {
  n: number;
  [algoName: string]: number;
}

export function generateGrowthData(
  entries: ComplexityEntry[],
  complexityType: "best" | "average" | "worst" = "worst",
  maxN = 64,
  points = 16
): GrowthPoint[] {
  const data: GrowthPoint[] = [];
  for (let i = 1; i <= points; i++) {
    const n = Math.round((maxN / points) * i);
    const point: GrowthPoint = { n };
    entries.forEach((e) => {
      const fn = getGrowth(e.time[complexityType]);
      point[e.name] = Math.round(fn(n) * 100) / 100;
    });
    data.push(point);
  }
  return data;
}

// Colors for chart lines per category
export const categoryChartColors: Record<string, string[]> = {
  graph: [
    "hsl(174, 72%, 50%)", "hsl(174, 72%, 35%)", "hsl(33, 100%, 60%)",
    "hsl(262, 83%, 65%)", "hsl(0, 84%, 60%)", "hsl(142, 76%, 46%)",
    "hsl(199, 89%, 48%)", "hsl(330, 70%, 55%)",
  ],
  sorting: [
    "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)", "hsl(0, 84%, 60%)",
    "hsl(142, 76%, 46%)", "hsl(199, 89%, 48%)",
  ],
  scheduling: [
    "hsl(174, 72%, 50%)", "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)",
    "hsl(0, 84%, 60%)", "hsl(142, 76%, 46%)",
  ],
  tree: [
    "hsl(142, 76%, 46%)", "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)",
    "hsl(0, 84%, 60%)", "hsl(199, 89%, 48%)", "hsl(330, 70%, 55%)", "hsl(174, 72%, 50%)",
  ],
  search: [
    "hsl(0, 84%, 60%)", "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)",
  ],
  dp: [
    "hsl(262, 83%, 65%)", "hsl(33, 100%, 60%)", "hsl(0, 84%, 60%)", "hsl(142, 76%, 46%)",
  ],
};
