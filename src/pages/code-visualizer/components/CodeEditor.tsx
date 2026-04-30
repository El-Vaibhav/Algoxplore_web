import { Textarea } from "@/components/ui/textarea";
import type { AlgorithmCategory, Algorithm } from "../types";

const TEMPLATES: Record<string, string> = {
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

  dfs: `function dfs(graph, start) {
  const visited = new Set();

  function visit(node) {
    visited.add(node);
    logStep("visit", node);

    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        logStep("edge", [node, neighbor]);
        visit(neighbor);
      }
    }
  }

  visit(start);
  logStep("result", "All Nodes Visited");
}`,

  prims: `function prims(graph, start) {
  const visited = new Set();
  visited.add(start);
  logStep("visit", start);

  let totalWeight = 0;

  while (visited.size < Object.keys(graph).length) {
    let minEdge = null;
    let minWeight = Infinity;

    for (const u of visited) {
      for (const [v, w] of graph[u] || []) {
        if (!visited.has(v) && w < minWeight) {
          minWeight = w;
          minEdge = [u, v];
        }
      }
    }

    if (!minEdge) break;

    const [u, v] = minEdge;
    totalWeight += minWeight;
    logStep("edge", [u, v]);
    visited.add(v);
    logStep("visit", v);
  }
  logStep("result", "MST weight = " + totalWeight);;
}`,

  kruskal: `function kruskal(graph) {
  const parent = {};
  const rank = {};
  const visited = new Set();
  let totalWeight = 0;

  for (const node in graph) {
    parent[node] = node;
    rank[node] = 0;
  }

  function find(u) {
    if (parent[u] !== u) parent[u] = find(parent[u]);
    return parent[u];
  }

  function union(u, v) {
    const rootU = find(u);
    const rootV = find(v);
    if (rootU === rootV) return false;
    if (rank[rootU] < rank[rootV]) parent[rootU] = rootV;
    else if (rank[rootU] > rank[rootV]) parent[rootV] = rootU;
    else { parent[rootV] = rootU; rank[rootU]++; }
    return true;
  }

  const edges = [];
  for (const u in graph) {
    for (const [v, w] of graph[u]) {
      if (Number(u) < v) edges.push([Number(u), v, w]);
    }
  }
  edges.sort((a, b) => a[2] - b[2]);

  for (const [u, v, w] of edges) {
    if (union(u, v)) {
      totalWeight += w;
      logStep("edge", [u, v]);
      if (!visited.has(u)) { visited.add(u); logStep("visit", u); }
      if (!visited.has(v)) { visited.add(v); logStep("visit", v); }
    }
  }
    logStep("result", "MST weight = " + totalWeight);;
;
}`,

  toposort: `function toposort(graph) {
  const visited = new Set();
  const stack = [];

  function dfs(node) {
    visited.add(node);
    logStep("visit", node);
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        logStep("edge", [node, neighbor]);
        dfs(neighbor);
      }
    }
    stack.push(node);
  }

  for (const node in graph) {
    const n = Number(node);
    if (!visited.has(n)) dfs(n);
  }

  let order = stack.reverse();
  logStep("result", "Topo Order = " + order.join(", "));;
}`,

  dijkstra: `function dijkstra(graph, start) {
  const dist = {};
  const visited = new Set();

  for (const node in graph) dist[node] = Infinity;
  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let u = null;
    let minDist = Infinity;
    for (const node in dist) {
      if (!visited.has(Number(node)) && dist[node] < minDist) {
        minDist = dist[node];
        u = Number(node);
      }
    }
    if (u === null) break;

    visited.add(u);
    logStep("visit", u);

    for (const [v, w] of graph[u] || []) {
      if (!visited.has(v)) {
        logStep("compare", [u, v]);
        if (dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          logStep("edge", [u, v]);
        }
      }
    }
  }

  let result = "";
  for (const node in dist) result += "Node " + node + ": " + dist[node] + " | ";
  logStep("result", result);
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

  selection: `function selection(array) {
  for (let i = 0; i < array.length; i++) {
    let minIdx = i;
    for (let j = i + 1; j < array.length; j++) {
      logStep("compare", [j, minIdx]);
      if (array[j] < array[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      logStep("swap", [i, minIdx]);
      [array[i], array[minIdx]] = [array[minIdx], array[i]];
    }
  }
}`,

  insertion: `function insertion(array) {
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0) {
      logStep("compare", [j, j + 1]);
      if (array[j] > key) {
        logStep("swap", [j, j + 1]);
        array[j + 1] = array[j];
        j--;
      } else break;
    }
    array[j + 1] = key;
  }
}`,

  merge: `function merge(array) {
  function mergeSort(l, r) {
    if (l >= r) return;
    let mid = Math.floor((l + r) / 2);
    mergeSort(l, mid);
    mergeSort(mid + 1, r);
    mergeArr(l, mid, r);
  }

  function mergeArr(l, mid, r) {
    let left = array.slice(l, mid + 1);
    let right = array.slice(mid + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      logStep("compare", [l + i, mid + 1 + j]);
      if (left[i] <= right[j]) {
        array[k] = left[i];
        logStep("swap", [k, l + i]);
        i++;
      } else {
        array[k] = right[j];
        logStep("swap", [k, mid + 1 + j]);
        j++;
      }
      k++;
    }
    while (i < left.length) { array[k] = left[i]; logStep("swap", [k, l + i]); i++; k++; }
    while (j < right.length) { array[k] = right[j]; logStep("swap", [k, mid + 1 + j]); j++; k++; }
  }

  mergeSort(0, array.length - 1);
}`,

  quick: `function quick(array) {
  function partition(low, high) {
    let pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      logStep("compare", [j, high]);
      if (array[j] < pivot) {
        i++;
        logStep("swap", [i, j]);
        [array[i], array[j]] = [array[j], array[i]];
      }
    }
    logStep("swap", [i + 1, high]);
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    return i + 1;
  }

  function quickSort(low, high) {
    if (low < high) {
      let pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    }
  }

  quickSort(0, array.length - 1);
}`,

  // ─── Scheduling Templates ─────────────────────
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

  sjf: `function sjf(arrival, burst) {
  const n = arrival.length;
  const done = Array(n).fill(false);
  const gantt = [];
  const completion = Array(n).fill(0);
  let time = 0;
  let completed = 0;

  while (completed < n) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!done[i] && arrival[i] <= time) {
        if (best === -1 || burst[i] < burst[best]) best = i;
      }
    }
    if (best === -1) { time++; continue; }

    logStep("visit", best);
    gantt.push({ processId: best, start: time, end: time + burst[best] });
    logStep("gantt", [...gantt]);
    time += burst[best];
    completion[best] = time;
    done[best] = true;
    completed++;
  }

  const tat = Array(n).fill(0);
  const wt = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    tat[i] = completion[i] - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  logStep("schedule_done", { gantt, waitingTime: wt, turnaroundTime: tat });
}`,

  srtf: `function srtf(arrival, burst) {
  const n = arrival.length;
  const remaining = [...burst];
  const completion = Array(n).fill(0);
  const gantt = [];
  let time = 0;
  let completed = 0;
  const maxTime = arrival.reduce((a, b) => a + b, 0) + burst.reduce((a, b) => a + b, 0) + 10;

  while (completed < n && time < maxTime) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (remaining[i] > 0 && arrival[i] <= time) {
        if (best === -1 || remaining[i] < remaining[best]) best = i;
      }
    }
    if (best === -1) { time++; continue; }

    if (gantt.length > 0 && gantt[gantt.length - 1].processId === best) {
      gantt[gantt.length - 1].end = time + 1;
    } else {
      gantt.push({ processId: best, start: time, end: time + 1 });
      logStep("visit", best);
    }

    remaining[best]--;
    time++;
    if (remaining[best] === 0) {
      completion[best] = time;
      completed++;
      logStep("gantt", [...gantt]);
    }
  }

  const tat = Array(n).fill(0);
  const wt = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    tat[i] = completion[i] - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  logStep("schedule_done", { gantt, waitingTime: wt, turnaroundTime: tat });
}`,

  roundrobin: `function roundrobin(arrival, burst, quantum) {
  const n = arrival.length;
  const remaining = [...burst];
  const completion = Array(n).fill(0);
  const gantt = [];
  const queue = [];
  const inQueue = Array(n).fill(false);
  let time = 0;
  let completed = 0;

  for (let i = 0; i < n; i++) {
    if (arrival[i] <= time && !inQueue[i]) { queue.push(i); inQueue[i] = true; }
  }

  while (completed < n) {
    if (queue.length === 0) {
      time++;
      for (let i = 0; i < n; i++) {
        if (arrival[i] <= time && remaining[i] > 0 && !inQueue[i]) { queue.push(i); inQueue[i] = true; }
      }
      continue;
    }

    const i = queue.shift();
    inQueue[i] = false;
    const exec = Math.min(quantum, remaining[i]);

    logStep("visit", i);
    gantt.push({ processId: i, start: time, end: time + exec });
    logStep("gantt", [...gantt]);
    time += exec;
    remaining[i] -= exec;

    for (let j = 0; j < n; j++) {
      if (arrival[j] <= time && remaining[j] > 0 && !inQueue[j] && j !== i) { queue.push(j); inQueue[j] = true; }
    }

    if (remaining[i] > 0) { queue.push(i); inQueue[i] = true; }
    else { completion[i] = time; completed++; }
  }

  const tat = Array(n).fill(0);
  const wt = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    tat[i] = completion[i] - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  logStep("schedule_done", { gantt, waitingTime: wt, turnaroundTime: tat });
}`,

  priority: `function priority(arrival, burst, priority) {
  const n = arrival.length;
  const done = Array(n).fill(false);
  const gantt = [];
  const completion = Array(n).fill(0);
  let time = 0;
  let completed = 0;

  while (completed < n) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!done[i] && arrival[i] <= time) {
        if (best === -1 || priority[i] < priority[best]) best = i;
      }
    }
    if (best === -1) { time++; continue; }

    logStep("visit", best);
    gantt.push({ processId: best, start: time, end: time + burst[best] });
    logStep("gantt", [...gantt]);
    time += burst[best];
    completion[best] = time;
    done[best] = true;
    completed++;
  }

  const tat = Array(n).fill(0);
  const wt = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    tat[i] = completion[i] - arrival[i];
    wt[i] = tat[i] - burst[i];
  }
  logStep("schedule_done", { gantt, waitingTime: wt, turnaroundTime: tat });
}`,

  // ─── Tree Templates ─────────────────────
  insert: `function insert(values) {
  let root = null;

  function insert_node(root, val) {
    if (!root) {
      logStep("tree_state", { tree: null, highlightNode: val });
      return { value: val, left: null, right: null };
    }

    logStep("tree_state", { tree: copyTree(root), highlightNode: root.value });

    if (val < root.value) {
      logStep("compare", [val, root.value]);
      root.left = insert_node(root.left, val);
    } else if (val > root.value) {
      logStep("compare", [val, root.value]);
      root.right = insert_node(root.right, val);
    }
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) {
    root = insert_node(root, val);
    logStep("tree_state", { tree: copyTree(root), highlightNode: val });
  }
}`,

  search: `function search(values, searchValue) {
  let root = null;

  function insert(root, val) {
    if (!root) return { value: val, left: null, right: null };
    if (val < root.value) root.left = insert(root.left, val);
    else if (val > root.value) root.right = insert(root.right, val);
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) root = insert(root, val);
  logStep("tree_state", { tree: copyTree(root), highlightNode: null });

  function search(node, target, path) {
    if (!node) {
      logStep("result", "Value " + target + " not found");
      return;
    }
    path.push(node.value);
    logStep("tree_state", { tree: copyTree(root), highlightNode: node.value, highlightPath: [...path] });

    if (target === node.value) {
      logStep("result", "Found " + target);
      logStep("tree_state", { tree: copyTree(root), highlightNode: node.value, highlightPath: [...path] });
    } else if (target < node.value) {
      logStep("compare", [target, node.value]);
      search(node.left, target, path);
    } else {
      logStep("compare", [target, node.value]);
      search(node.right, target, path);
    }
  }

  search(root, searchValue, []);
}`,

  delete: `function deleteNode(values, deleteValue) {
  let root = null;

  function insert(root, val) {
    if (!root) return { value: val, left: null, right: null };
    if (val < root.value) root.left = insert(root.left, val);
    else if (val > root.value) root.right = insert(root.right, val);
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  function minNode(node) {
    while (node.left) node = node.left;
    return node;
  }

  function deleteNode(node, val) {
    if (!node) return null;

    logStep("tree_state", { tree: copyTree(root), highlightNode: node.value });

    if (val < node.value) {
      logStep("compare", [val, node.value]);
      node.left = deleteNode(node.left, val);
    } else if (val > node.value) {
      logStep("compare", [val, node.value]);
      node.right = deleteNode(node.right, val);
    } else {
      if (!node.left) return node.right;
      if (!node.right) return node.left;
      const succ = minNode(node.right);
      node.value = succ.value;
      node.right = deleteNode(node.right, succ.value);
    }
    return node;
  }

  for (const val of values) root = insert(root, val);
  logStep("tree_state", { tree: copyTree(root), highlightNode: null });

  root = deleteNode(root, deleteValue);
  logStep("tree_state", { tree: copyTree(root), highlightNode: null });
  logStep("result", "Deleted " + deleteValue);
}`,

  inorder: `function inorder(values) {
  let root = null;

  function insert(root, val) {
    if (!root) return { value: val, left: null, right: null };
    if (val < root.value) root.left = insert(root.left, val);
    else if (val > root.value) root.right = insert(root.right, val);
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) root = insert(root, val);

  const result = [];
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    result.push(node.value);
    logStep("tree_state", { tree: copyTree(root), highlightNode: node.value, highlightPath: [...result] });
    traverse(node.right);
  }

  traverse(root);
  logStep("tree_state", {
    tree: copyTree(root),
    highlightNode: null,
    highlightPath: [...result],
    traversalComplete: true
  });
  logStep("result", "Inorder: " + result.join(", "));
}`,

  preorder: `function preorder(values) {
  let root = null;

  function insert(root, val) {
    if (!root) return { value: val, left: null, right: null };
    if (val < root.value) root.left = insert(root.left, val);
    else if (val > root.value) root.right = insert(root.right, val);
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) root = insert(root, val);

  const result = [];
  function traverse(node) {
    if (!node) return;
    result.push(node.value);
    logStep("tree_state", { tree: copyTree(root), highlightNode: node.value, highlightPath: [...result] });
    traverse(node.left);
    traverse(node.right);
  }

  traverse(root);
  logStep("tree_state", {
    tree: copyTree(root),
    highlightNode: null,
    highlightPath: [...result],
    traversalComplete: true
  });
  logStep("result", "Preorder: " + result.join(", "));
}`,

  postorder: `function postorder(values) {
  let root = null;

  function insert(root, val) {
    if (!root) return { value: val, left: null, right: null };
    if (val < root.value) root.left = insert(root.left, val);
    else if (val > root.value) root.right = insert(root.right, val);
    return root;
  }

  function copyTree(node) {
    if (!node) return null;
    return { value: node.value, left: copyTree(node.left), right: copyTree(node.right) };
  }

  for (const val of values) root = insert(root, val);

  const result = [];
  function traverse(node) {
    if (!node) return;
    traverse(node.left);
    traverse(node.right);
    result.push(node.value);
    logStep("tree_state", { tree: copyTree(root), highlightNode: node.value, highlightPath: [...result] });
  }

  traverse(root);
  logStep("tree_state", {
    tree: copyTree(root),
    highlightNode: null,
    highlightPath: [...result],
    traversalComplete: true
  });
  logStep("result", "Postorder: " + result.join(", "));
}`,
  knapsack: `function knapsack(weights, values, capacity) {
  const W = capacity;
  const n = weights.length;

  const dp = Array.from({ length: n + 1 }, () =>
    Array(W + 1).fill(0)
  );

  function copyTable(table) {
    return table.map(row => [...row]);
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= W; j++) {

      if (weights[i - 1] <= j) {
        dp[i][j] = Math.max(
          dp[i - 1][j],
          values[i - 1] + dp[i - 1][j - weights[i - 1]]
        );

        logStep("dp_update", {
          i,
          j,
          value: dp[i][j],
          table: copyTable(dp),
          from: [
            [i - 1, j],
            [i - 1, j - weights[i - 1]]
          ]
        });

      } else {
        dp[i][j] = dp[i - 1][j];

        logStep("dp_update", {
          i,
          j,
          value: dp[i][j],
          table: copyTable(dp),
          from: [[i - 1, j]]
        });
      }
    }
  }

  logStep("result", "Max Value = " + dp[n][W]);
}`,
  lcs: `function lcs(s1, s2) {
  const n = s1.length;
  const m = s2.length;

  const dp = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );

  function copyTable(table) {
    return table.map(row => [...row]);
  }

  // Build DP table
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {

      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = 1 + dp[i - 1][j - 1];

        logStep("dp_update", {
          i,
          j,
          value: dp[i][j],
          table: copyTable(dp),
          from: [[i - 1, j - 1]]
        });

      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);

        logStep("dp_update", {
          i,
          j,
          value: dp[i][j],
          table: copyTable(dp),
          from: [
            [i - 1, j],
            [i, j - 1]
          ]
        });
      }
    }
  }

  let i = n, j = m;
  let lcsStr = "";

  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      lcsStr = s1[i - 1] + lcsStr;
      i--;
      j--;

    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
logStep("result", "LCS = " + lcsStr + ", Length = " + dp[n][m]);
}`,
mcm: `function mcm(arr) {
  const n = arr.length;

  const dp = Array.from({ length: n }, () =>
    Array(n).fill(0)
  );

  function copyTable(table) {
    return table.map(row => [...row]);
  }

  for (let len = 2; len < n; len++) {
    for (let i = 1; i < n - len + 1; i++) {
      let j = i + len - 1;
      dp[i][j] = Infinity;

      for (let k = i; k < j; k++) {

        const cost =
          dp[i][k] +
          dp[k + 1][j] +
          arr[i - 1] * arr[k] * arr[j];

        if (cost < dp[i][j]) {
          dp[i][j] = cost;

          logStep("dp_update", {
            i,
            j,
            value: dp[i][j],
            table: copyTable(dp),
            from: [
              [i, k],
              [k + 1, j]
            ]
          });
        }
      }
    }
  }

  logStep("result", "Min Cost = " + dp[1][n - 1]);
}`,
};

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  category: AlgorithmCategory;
  algorithm: Algorithm;
}

const CodeEditor = ({ code, onChange, algorithm }: CodeEditorProps) => {
  const loadTemplate = () => {
    onChange(TEMPLATES[algorithm] || "");
  };

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground font-mono flex items-center gap-2">
          <span className="text-primary">{"</>"}</span> Code Editor
        </h3>

        <button
          onClick={loadTemplate}
          className="text-xs px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Load Template
        </button>
      </div>
      <div className="text-xs bg-muted/40 border border-border rounded-lg p-3 text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">Instructions:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Write code in <span className="text-primary font-medium">JavaScript</span></li>
          <li>Function name must match selected algorithm (e.g., <code>bfs</code>, <code>fcfs</code>, <code>insert</code>)</li>
          <li>
            Use <code>logStep(...)</code> to visualize steps
            <span className="text-xs text-muted-foreground">
              {" "}— required for animations
            </span>
          </li>
          <li>Do not use <code>console.log</code></li>
        </ul>
        <p className="pt-1 text-primary/90">
          Please wait a few seconds for the server to be ready after the page loads.
        </p>
      </div>
      <Textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your JavaScript algorithm here..."
        className="flex-1 min-h-[320px] font-mono text-xs leading-relaxed bg-muted/50 border-border resize-none focus:ring-primary"
        spellCheck={false}
      />
    </div>
  );
};

export default CodeEditor;
