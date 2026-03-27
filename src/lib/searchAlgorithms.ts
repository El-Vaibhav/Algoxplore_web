// ===== Binary Search, A*, AO* Algorithm Logic =====

// ===== Binary Search =====
export interface BinarySearchStep {
  array: number[];
  low: number;
  high: number;
  mid: number;
  found: boolean;
  message: string;
  target: number;
}

export function binarySearchSteps(arr: number[], target: number): BinarySearchStep[] {
  const sorted = [...arr].sort((a, b) => a - b);
  const steps: BinarySearchStep[] = [];
  let low = 0;
  let high = sorted.length - 1;

  steps.push({ array: sorted, low, high, mid: -1, found: false, message: `Searching for ${target} in sorted array`, target });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    steps.push({ array: sorted, low, high, mid, found: false, message: `Check mid=${mid}: arr[${mid}]=${sorted[mid]}`, target });

    if (sorted[mid] === target) {
      steps.push({ array: sorted, low, high, mid, found: true, message: `Found ${target} at index ${mid}!`, target });
      return steps;
    } else if (sorted[mid] < target) {
      steps.push({ array: sorted, low, high, mid, found: false, message: `${sorted[mid]} < ${target}, search right half`, target });
      low = mid + 1;
    } else {
      steps.push({ array: sorted, low, high, mid, found: false, message: `${sorted[mid]} > ${target}, search left half`, target });
      high = mid - 1;
    }
  }
  steps.push({ array: sorted, low, high, mid: -1, found: false, message: `${target} not found in array`, target });
  return steps;
}

// ===== A* Pathfinding =====
export interface GridCell {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  g: number;
  h: number;
  f: number;
  parent: { row: number; col: number } | null;
}

export interface AStarStep {
  grid: GridCell[][];
  openSet: { row: number; col: number }[];
  closedSet: { row: number; col: number }[];
  current: { row: number; col: number } | null;
  path: { row: number; col: number }[];
  message: string;
  done: boolean;
}

function heuristic(a: { row: number; col: number }, b: { row: number; col: number }): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function createGrid(rows: number, cols: number, walls: { row: number; col: number }[], start: { row: number; col: number }, end: { row: number; col: number }): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r, col: c,
        isWall: walls.some(w => w.row === r && w.col === c),
        isStart: r === start.row && c === start.col,
        isEnd: r === end.row && c === end.col,
        g: Infinity, h: 0, f: Infinity,
        parent: null,
      });
    }
    grid.push(row);
  }
  return grid;
}

export function aStarSteps(
  rows: number, cols: number,
  walls: { row: number; col: number }[],
  start: { row: number; col: number },
  end: { row: number; col: number }
): AStarStep[] {
  const steps: AStarStep[] = [];
  const grid = createGrid(rows, cols, walls, start, end);

  grid[start.row][start.col].g = 0;
  grid[start.row][start.col].h = heuristic(start, end);
  grid[start.row][start.col].f = grid[start.row][start.col].h;

  const openSet: { row: number; col: number }[] = [{ ...start }];
  const closedSet: { row: number; col: number }[] = [];

  const cloneGrid = () => grid.map(r => r.map(c => ({ ...c })));

  steps.push({ grid: cloneGrid(), openSet: [...openSet], closedSet: [...closedSet], current: null, path: [], message: `Starting A* from (${start.row},${start.col}) to (${end.row},${end.col})`, done: false });

  while (openSet.length > 0) {
    // Find lowest f in open set
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (grid[openSet[i].row][openSet[i].col].f < grid[openSet[lowestIdx].row][openSet[lowestIdx].col].f) {
        lowestIdx = i;
      }
    }
    const current = openSet[lowestIdx];
    
    steps.push({ grid: cloneGrid(), openSet: [...openSet], closedSet: [...closedSet], current: { ...current }, path: [], message: `Evaluating (${current.row},${current.col}) — f=${grid[current.row][current.col].f.toFixed(0)}`, done: false });

    if (current.row === end.row && current.col === end.col) {
      // Reconstruct path
      const path: { row: number; col: number }[] = [];
      let cur: { row: number; col: number } | null = current;
      while (cur) {
        path.unshift({ ...cur });
        cur = grid[cur.row][cur.col].parent;
      }
      steps.push({ grid: cloneGrid(), openSet: [], closedSet: [...closedSet], current: { ...current }, path, message: `Path found! Length: ${path.length}`, done: true });
      return steps;
    }

    openSet.splice(lowestIdx, 1);
    closedSet.push({ ...current });

    // Neighbors (4-directional)
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
      const nr = current.row + dr;
      const nc = current.col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (grid[nr][nc].isWall) continue;
      if (closedSet.some(c => c.row === nr && c.col === nc)) continue;

      const tentG = grid[current.row][current.col].g + 1;
      if (tentG < grid[nr][nc].g) {
        grid[nr][nc].g = tentG;
        grid[nr][nc].h = heuristic({ row: nr, col: nc }, end);
        grid[nr][nc].f = tentG + grid[nr][nc].h;
        grid[nr][nc].parent = { ...current };
        if (!openSet.some(o => o.row === nr && o.col === nc)) {
          openSet.push({ row: nr, col: nc });
        }
      }
    }
  }

  steps.push({ grid: cloneGrid(), openSet: [], closedSet: [...closedSet], current: null, path: [], message: "No path found!", done: true });
  return steps;
}

export function generateRandomWalls(rows: number, cols: number, density: number, start: { row: number; col: number }, end: { row: number; col: number }): { row: number; col: number }[] {
  const walls: { row: number; col: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === start.row && c === start.col) continue;
      if (r === end.row && c === end.col) continue;
      if (Math.random() < density) walls.push({ row: r, col: c });
    }
  }
  return walls;
}

// ===== AO* Algorithm =====
export interface AONode {
  id: string;
  label: string;
  x: number;
  y: number;
  heuristic: number;
  cost: number;
  solved: boolean;
  type: "AND" | "OR" | "LEAF";
  children: string[][];  // groups of children (AND groups)
  bestGroup: number;
}

export interface AOStarStep {
  nodes: AONode[];
  edges: { from: string; to: string; groupIdx: number }[];
  currentNode: string | null;
  solvedNodes: string[];
  message: string;
  done: boolean;
}

export function aoStarSteps(): AOStarStep[] {
  // Build a sample AND-OR graph
  const nodes: AONode[] = [
    { id: "A", label: "A", x: 400, y: 40, heuristic: 5, cost: 5, solved: false, type: "OR", children: [["B", "C"], ["D"]], bestGroup: -1 },
    { id: "B", label: "B", x: 250, y: 140, heuristic: 3, cost: 3, solved: false, type: "OR", children: [["E", "F"]], bestGroup: -1 },
    { id: "C", label: "C", x: 550, y: 140, heuristic: 2, cost: 2, solved: false, type: "LEAF", children: [], bestGroup: -1 },
    { id: "D", label: "D", x: 400, y: 140, heuristic: 6, cost: 6, solved: false, type: "OR", children: [["G"]], bestGroup: -1 },
    { id: "E", label: "E", x: 170, y: 250, heuristic: 1, cost: 1, solved: false, type: "LEAF", children: [], bestGroup: -1 },
    { id: "F", label: "F", x: 330, y: 250, heuristic: 2, cost: 2, solved: false, type: "LEAF", children: [], bestGroup: -1 },
    { id: "G", label: "G", x: 470, y: 250, heuristic: 3, cost: 3, solved: false, type: "LEAF", children: [], bestGroup: -1 },
  ];

  const edges: { from: string; to: string; groupIdx: number }[] = [];
  for (const node of nodes) {
    for (let gi = 0; gi < node.children.length; gi++) {
      for (const child of node.children[gi]) {
        edges.push({ from: node.id, to: child, groupIdx: gi });
      }
    }
  }

  const steps: AOStarStep[] = [];
  const cloneNodes = () => nodes.map(n => ({ ...n }));

  steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: null, solvedNodes: [], message: "Starting AO* — solving AND-OR graph from root A", done: false });

  // Solve leaf nodes first
  const leafNodes = nodes.filter(n => n.type === "LEAF");
  for (const leaf of leafNodes) {
    leaf.solved = true;
    steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: leaf.id, solvedNodes: nodes.filter(n => n.solved).map(n => n.id), message: `Leaf ${leaf.id} is solved (cost=${leaf.cost})`, done: false });
  }

  // Process B: AND group [E, F] -> cost = 1 + edge(1) + 2 + edge(1) = cost of children + edges
  const nodeB = nodes.find(n => n.id === "B")!;
  nodeB.cost = 1 + 1 + 2 + 1; // E cost + edge + F cost + edge
  nodeB.solved = true;
  nodeB.bestGroup = 0;
  steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: "B", solvedNodes: nodes.filter(n => n.solved).map(n => n.id), message: `B solved via AND{E,F}: cost = 1+1+2+1 = ${nodeB.cost}`, done: false });

  // Process D: [G] -> cost = 3 + 1
  const nodeD = nodes.find(n => n.id === "D")!;
  nodeD.cost = 3 + 1;
  nodeD.solved = true;
  nodeD.bestGroup = 0;
  steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: "D", solvedNodes: nodes.filter(n => n.solved).map(n => n.id), message: `D solved via {G}: cost = 3+1 = ${nodeD.cost}`, done: false });

  // Process A: group0 [B,C] cost = 5+1 + 2+1 = 9, group1 [D] cost = 4+1 = 5
  const nodeA = nodes.find(n => n.id === "A")!;
  const g0Cost = nodeB.cost + 1 + 2 + 1; // B + edge + C + edge
  const g1Cost = nodeD.cost + 1;
  steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: "A", solvedNodes: nodes.filter(n => n.solved).map(n => n.id), message: `A: AND{B,C} cost=${g0Cost}, {D} cost=${g1Cost}`, done: false });

  if (g1Cost < g0Cost) {
    nodeA.bestGroup = 1;
    nodeA.cost = g1Cost;
  } else {
    nodeA.bestGroup = 0;
    nodeA.cost = g0Cost;
  }
  nodeA.solved = true;
  steps.push({ nodes: cloneNodes(), edges: [...edges], currentNode: "A", solvedNodes: nodes.filter(n => n.solved).map(n => n.id), message: `A solved! Best path via ${nodeA.bestGroup === 0 ? "AND{B,C}" : "{D}"}, cost=${nodeA.cost}`, done: true });

  return steps;
}
