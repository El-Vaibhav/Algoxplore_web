// ===== Dynamic Programming Algorithms =====

// ===== 0/1 Knapsack =====
export interface KnapsackItem {
  weight: number;
  value: number;
  name: string;
}

export interface KnapsackStep {
  table: number[][];
  currentRow: number;
  currentCol: number;
  message: string;
  selectedItems: number[];
  done: boolean;
  maxValue: number;
}

export function generateRandomSudoku(size: number): number[][] {
  const board = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );

  const fillDiagonal = () => {
    const box = Math.floor(Math.sqrt(size));

    for (let k = 0; k < size; k += box) {
      const nums = shuffle([...Array(size).keys()].map(x => x + 1));

      let idx = 0;
      for (let i = 0; i < box; i++) {
        for (let j = 0; j < box; j++) {
          board[k + i][k + j] = nums[idx++];
        }
      }
    }
  };

  const shuffle = (arr: number[]) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  fillDiagonal();

  // remove random cells
  const removeCount = Math.floor(size * size * 0.5);

  for (let k = 0; k < removeCount; k++) {
    const i = Math.floor(Math.random() * size);
    const j = Math.floor(Math.random() * size);
    board[i][j] = 0;
  }

  return board;
}

export function knapsackSteps(items: KnapsackItem[], capacity: number): KnapsackStep[] {
  const n = items.length;
  const steps: KnapsackStep[] = [];
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const cloneTable = () => dp.map(row => [...row]);

  steps.push({ table: cloneTable(), currentRow: -1, currentCol: -1, message: `Knapsack: ${n} items, capacity=${capacity}. Initialize DP table with zeros.`, selectedItems: [], done: false, maxValue: 0 });

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      if (items[i - 1].weight <= w) {
        const include = items[i - 1].value + dp[i - 1][w - items[i - 1].weight];
        const exclude = dp[i - 1][w];
        dp[i][w] = Math.max(include, exclude);
        if (w % 2 === 0 || w === capacity) {
          steps.push({ table: cloneTable(), currentRow: i, currentCol: w, message: dp[i][w] === include ? `Item ${items[i - 1].name} (w=${items[i - 1].weight}, v=${items[i - 1].value}): include → ${include} > exclude ${exclude}` : `Item ${items[i - 1].name} (w=${items[i - 1].weight}, v=${items[i - 1].value}): exclude → ${exclude} ≥ include ${include}`, selectedItems: [], done: false, maxValue: dp[i][w] });
        }
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  const selected: number[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) { selected.push(i - 1); w -= items[i - 1].weight; }
  }
  selected.reverse();

  steps.push({ table: cloneTable(), currentRow: n, currentCol: capacity, message: `Optimal value: ${dp[n][capacity]}. Items: ${selected.map(i => items[i].name).join(", ")}`, selectedItems: selected, done: true, maxValue: dp[n][capacity] });
  return steps;
}

export const defaultKnapsackItems: KnapsackItem[] = [
  { name: "A", weight: 2, value: 6 },
  { name: "B", weight: 3, value: 8 },
  { name: "C", weight: 4, value: 10 },
  { name: "D", weight: 1, value: 3 },
  { name: "E", weight: 5, value: 12 },
];

// ===== Fractional Knapsack =====
export interface FractionalItem {
  weight: number;
  value: number;
  name: string;
  ratio: number;
}

export interface FractionalStep {
  items: FractionalItem[];
  sortedIndices: number[];
  currentIndex: number;
  fractionsTaken: number[]; // 0 to 1 for each item
  remainingCapacity: number;
  totalValue: number;
  message: string;
  done: boolean;
}

export function fractionalKnapsackSteps(rawItems: KnapsackItem[], capacity: number): FractionalStep[] {
  const steps: FractionalStep[] = [];
  const items: FractionalItem[] = rawItems.map(it => ({ ...it, ratio: +(it.value / it.weight).toFixed(2) }));
  const sortedIndices = items.map((_, i) => i).sort((a, b) => items[b].ratio - items[a].ratio);
  const fractions = new Array(items.length).fill(0);

  steps.push({ items, sortedIndices, currentIndex: -1, fractionsTaken: [...fractions], remainingCapacity: capacity, totalValue: 0, message: `Fractional Knapsack: ${items.length} items, capacity=${capacity}. Sort by value/weight ratio.`, done: false });

  let remaining = capacity;
  let totalVal = 0;

  for (let si = 0; si < sortedIndices.length; si++) {
    const idx = sortedIndices[si];
    const item = items[idx];

    if (remaining <= 0) break;

    if (item.weight <= remaining) {
      fractions[idx] = 1;
      remaining -= item.weight;
      totalVal += item.value;
      steps.push({ items, sortedIndices, currentIndex: idx, fractionsTaken: [...fractions], remainingCapacity: remaining, totalValue: +totalVal.toFixed(2), message: `Take all of ${item.name} (ratio=${item.ratio}). Weight ${item.weight} fits. Value +${item.value}`, done: false });
    } else {
      const frac = +(remaining / item.weight).toFixed(3);
      fractions[idx] = frac;
      totalVal += frac * item.value;
      remaining = 0;
      steps.push({ items, sortedIndices, currentIndex: idx, fractionsTaken: [...fractions], remainingCapacity: 0, totalValue: +totalVal.toFixed(2), message: `Take ${(frac * 100).toFixed(1)}% of ${item.name} (ratio=${item.ratio}). Remaining capacity filled. Value +${+(frac * item.value).toFixed(2)}`, done: false });
    }
  }

  steps.push({ items, sortedIndices, currentIndex: -1, fractionsTaken: [...fractions], remainingCapacity: remaining, totalValue: +totalVal.toFixed(2), message: `Done! Maximum value = ${totalVal.toFixed(2)}`, done: true });
  return steps;
}

export const defaultFractionalItems: KnapsackItem[] = [
  { name: "A", weight: 10, value: 60 },
  { name: "B", weight: 20, value: 100 },
  { name: "C", weight: 30, value: 120 },
  { name: "D", weight: 5, value: 40 },
  { name: "E", weight: 15, value: 45 },
];

// ===== LCS (Longest Common Subsequence) =====
export interface LCSStep {
  table: number[][];
  currentRow: number;
  currentCol: number;
  str1: string;
  str2: string;
  message: string;
  lcs: string;
  lcsPath: [number, number][];
  done: boolean;
}

export function lcsSteps(s1: string, s2: string): LCSStep[] {
  const m = s1.length, n = s2.length;
  const steps: LCSStep[] = [];
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  const cloneTable = () => dp.map(r => [...r]);

  steps.push({ table: cloneTable(), currentRow: -1, currentCol: -1, str1: s1, str2: s2, message: `LCS of "${s1}" and "${s2}". Initialize ${m + 1}×${n + 1} table with zeros.`, lcs: "", lcsPath: [], done: false });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        steps.push({ table: cloneTable(), currentRow: i, currentCol: j, str1: s1, str2: s2, message: `'${s1[i - 1]}' = '${s2[j - 1]}' → diagonal + 1 = ${dp[i][j]}`, lcs: "", lcsPath: [], done: false });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        if (j % 2 === 0 || j === n) {
          steps.push({ table: cloneTable(), currentRow: i, currentCol: j, str1: s1, str2: s2, message: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' → max(up=${dp[i - 1][j]}, left=${dp[i][j - 1]}) = ${dp[i][j]}`, lcs: "", lcsPath: [], done: false });
        }
      }
    }
  }

  // Backtrack
  const path: [number, number][] = [];
  let lcs = "";
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      path.push([i, j]);
      lcs = s1[i - 1] + lcs;
      i--; j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  path.reverse();

  steps.push({ table: cloneTable(), currentRow: m, currentCol: n, str1: s1, str2: s2, message: `LCS = "${lcs}" (length ${lcs.length})`, lcs, lcsPath: path, done: true });
  return steps;
}

// ===== Matrix Chain Multiplication =====
export interface MCMStep {
  table: number[][];
  splitTable: number[][];
  currentRow: number;
  currentCol: number;
  dimensions: number[];
  message: string;
  optimalOrder: string;
  done: boolean;
  chainLength: number;
}

export function mcmSteps(dims: number[]): MCMStep[] {
  const n = dims.length - 1; // number of matrices
  const steps: MCMStep[] = [];
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const split: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const cloneDP = () => dp.map(r => [...r]);
  const cloneSplit = () => split.map(r => [...r]);

  steps.push({ table: cloneDP(), splitTable: cloneSplit(), currentRow: -1, currentCol: -1, dimensions: dims, message: `MCM: ${n} matrices. Dimensions: ${dims.map((d, i) => i < n ? `M${i + 1}(${d}×${dims[i + 1]})` : '').filter(Boolean).join(', ')}`, optimalOrder: "", done: false, chainLength: 0 });

  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      dp[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1];
        if (cost < dp[i][j]) {
          dp[i][j] = cost;
          split[i][j] = k;
        }
      }
      steps.push({ table: cloneDP(), splitTable: cloneSplit(), currentRow: i, currentCol: j, dimensions: dims, message: `Chain length ${len}: M${i + 1}..M${j + 1}, min cost = ${dp[i][j]}, split at k=${split[i][j] + 1}`, optimalOrder: "", done: false, chainLength: len });
    }
  }

  // Build optimal parenthesization
  function buildOrder(i: number, j: number): string {
    if (i === j) return `M${i + 1}`;
    const k = split[i][j];
    return `(${buildOrder(i, k)} × ${buildOrder(k + 1, j)})`;
  }
  const order = buildOrder(0, n - 1);

  steps.push({ table: cloneDP(), splitTable: cloneSplit(), currentRow: 0, currentCol: n - 1, dimensions: dims, message: `Minimum multiplications: ${dp[0][n - 1]}. Order: ${order}`, optimalOrder: order, done: true, chainLength: n });
  return steps;
}

export const defaultMCMDimensions = [10, 20, 30, 40, 30]; // 4 matrices

// ===== N-QUEENS (BACKTRACKING) =====

export interface NQueenStep {
  board: number[][];
  row: number;
  col: number;
  highlight: number[][]; // cells being checked
  conflict: number[][];  // unsafe cells
  message: string;
  done: boolean;
}

function cloneBoard(board: number[][]): number[][] {
  return board.map(row => [...row]);
}

function isSafe(board: number[][], row: number, col: number, n: number): boolean {
  // column
  for (let i = 0; i < row; i++) {
    if (board[i][col]) return false;
  }

  // left diagonal
  for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
    if (board[i][j]) return false;
  }

  // right diagonal
  for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
    if (board[i][j]) return false;
  }

  return true;
}

export function nQueenSteps(n: number): NQueenStep[] {
  const board = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: NQueenStep[] = [];

  function solve(row: number): boolean {
    // ✅ BASE CASE
    if (row === n) {
      steps.push({
        board: cloneBoard(board),
        row: -1,
        col: -1,
        highlight: [],
        conflict: [],
        message: "Solution Found 🎉",
        done: true,
      });
      return true;
    }

    for (let col = 0; col < n; col++) {

      // 🟡 TRY
      steps.push({
        board: cloneBoard(board),
        row,
        col,
        highlight: [[row, col]],
        conflict: [],
        message: `Trying (${row}, ${col})`,
        done: false,
      });

      if (isSafe(board, row, col, n)) {

        // 🟢 PLACE QUEEN
        board[row][col] = 1;

        steps.push({
          board: cloneBoard(board),
          row,
          col,
          highlight: [[row, col]],
          conflict: [],
          message: `Placed Queen at (${row}, ${col})`,
          done: false,
        });

        // 🔁 RECURSE
        if (solve(row + 1)) return true;

        // 🔄 BACKTRACK
        board[row][col] = 0;

        steps.push({
          board: cloneBoard(board),
          row,
          col,
          highlight: [],
          conflict: [[row, col]],
          message: `Backtracking from (${row}, ${col})`,
          done: false,
        });

      } else {

        // 🔴 NOT SAFE
        steps.push({
          board: cloneBoard(board),
          row,
          col,
          highlight: [],
          conflict: [[row, col]],
          message: `Conflict at (${row}, ${col})`,
          done: false,
        });
      }
    }

    return false;
  }

  solve(0);
  return steps;
}

// ===== RAT IN A MAZE =====

export interface RatMazeStep {
  grid: number[][];
  path: number[][];
  visited: number[][];
  row: number;
  col: number;
  message: string;
  done: boolean;
}

function cloneGrid(grid: number[][]) {
  return grid.map(r => [...r]);
}

export function ratMazeSteps(grid: number[][]): RatMazeStep[] {
  const n = grid.length;
  const path = Array.from({ length: n }, () => Array(n).fill(0));
  const visited = Array.from({ length: n }, () => Array(n).fill(0));
  const steps: RatMazeStep[] = [];

  function clone(mat: number[][]) {
    return mat.map(r => [...r]);
  }

  function solve(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= n || y >= n || grid[x][y] === 0) return false;

    if (visited[x][y]) return false;

    visited[x][y] = 1;

    steps.push({
      grid: clone(grid),
      path: clone(path),
      visited: clone(visited),
      row: x,
      col: y,
      message: `Exploring (${x}, ${y})`,
      done: false,
    });

    if (x === n - 1 && y === n - 1) {
      path[x][y] = 1;

      steps.push({
        grid: clone(grid),
        path: clone(path),
        visited: clone(visited),
        row: x,
        col: y,
        message: "Destination reached 🎉",
        done: true,
      });

      return true;
    }

    path[x][y] = 1;

    // Right, Down, Left, Up (better visualization)
    if (
      solve(x, y + 1) ||
      solve(x + 1, y) ||
      solve(x, y - 1) ||
      solve(x - 1, y)
    ) return true;

    // BACKTRACK
    path[x][y] = 0;

    steps.push({
      grid: clone(grid),
      path: clone(path),
      visited: clone(visited),
      row: x,
      col: y,
      message: `Backtracking from (${x}, ${y})`,
      done: false,
    });

    return false;
  }

  solve(0, 0);
  return steps;
}


// ===== SUDOKU SOLVER (BACKTRACKING) =====

export interface SudokuStep {
  board: number[][];
  row: number;
  col: number;
  highlight: number[][]; // current cell
  conflict: number[][];  // invalid attempts
  message: string;
  done: boolean;
  success?: boolean; 
}

function cloneSudoku(board: number[][]): number[][] {
  return board.map(r => [...r]);
}

function isValid(board: number[][], row: number, col: number, num: number): boolean {
  const n = board.length;
  const box = Math.floor(Math.sqrt(n));

  for (let i = 0; i < n; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }

  const startRow = Math.floor(row / box) * box;
  const startCol = Math.floor(col / box) * box;

  for (let i = 0; i < box; i++) {
    for (let j = 0; j < box; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}
export function sudokuSteps(initialBoard: number[][]): SudokuStep[] {
  const board = cloneSudoku(initialBoard);
  const steps: SudokuStep[] = [];
  const n = board.length;

  function solve(): boolean {
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {

        if (board[row][col] === 0) {

          for (let num = 1; num <= n; num++) {

            // 🟡 TRY NUMBER
            steps.push({
              board: cloneSudoku(board),
              row,
              col,
              highlight: [[row, col]],
              conflict: [],
              message: `Trying ${num} at (${row}, ${col})`,
              done: false,
            });

            if (isValid(board, row, col, num)) {

              // 🟢 PLACE
              board[row][col] = num;

              steps.push({
                board: cloneSudoku(board),
                row,
                col,
                highlight: [[row, col]],
                conflict: [],
                message: `Placed ${num} at (${row}, ${col})`,
                done: false,
              });

              if (solve()) return true;

              // 🔄 BACKTRACK
              board[row][col] = 0;

              steps.push({
                board: cloneSudoku(board),
                row,
                col,
                highlight: [],
                conflict: [[row, col]],
                message: `Backtracking from (${row}, ${col})`,
                done: false,
              });

            } else {

              // 🔴 INVALID
              steps.push({
                board: cloneSudoku(board),
                row,
                col,
                highlight: [],
                conflict: [[row, col]],
                message: `Conflict placing ${num} at (${row}, ${col})`,
                done: false,
              });
            }
          }

          return false;
        }
      }
    }

    steps.push({
      board: cloneSudoku(board),
      row: -1,
      col: -1,
      highlight: [],
      conflict: [],
      message: "Sudoku Solved 🎉",
      done: true,
      success: true,
    });

    return true;
  }

  const solved = solve();

if (!solved) {
  steps.push({
    board: cloneSudoku(board),
    row: -1,
    col: -1,
    highlight: [],
    conflict: [],
    message: "No Solution Exists ❌",
    done: true,
    success: false
  });
}

return steps;
}

// Default Sudoku
export const defaultSudoku = [
  [1, 0, 3, 4],
  [0, 4, 0, 2],
  [2, 0, 4, 0],
  [4, 3, 0, 1],
];