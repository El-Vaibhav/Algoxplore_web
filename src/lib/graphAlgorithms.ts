export type GraphNode = { id: number; x: number; y: number }

export type GraphEdge = {
  from: number
  to: number
  weight?: number
}

export type GraphStep = {

  visitedNodes: number[]
  visitedEdges: [number, number][]

  currentNode?: number

  levels?: Record<number, number>
  currentLevel?: number
  nodesAtLevel?: number[]

  description: string
  components?: Record<number, number>
}

export function generateRandomGraph(
  nodeCount: number,
  weighted: boolean,
  directed: boolean = false
) {

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  const width = 600
  const height = 500
  const r = 180

  // generate node positions
  for (let i = 0; i < nodeCount; i++) {

    const angle = (2 * Math.PI * i) / nodeCount

    nodes.push({
      id: i,
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle)
    })
  }

  ////////////////////////////////////////////////////
  // DIRECTED GRAPH (DAG for Topological Sort)
  ////////////////////////////////////////////////////

  if (directed) {

    for (let i = 0; i < nodeCount; i++) {

      for (let j = i + 1; j < nodeCount; j++) {

        if (Math.random() > 0.5) {

          edges.push({
            from: i,
            to: j,
            weight: weighted
              ? Math.floor(Math.random() * 10) + 1
              : undefined
          })

        }

      }

    }

  }

  ////////////////////////////////////////////////////
  // UNDIRECTED GRAPH (for BFS, DFS, MST etc.)
  ////////////////////////////////////////////////////

  else {

    for (let i = 0; i < nodeCount; i++) {

      const j = (i + 1) % nodeCount

      edges.push({
        from: i,
        to: j,
        weight: weighted
          ? Math.floor(Math.random() * 10) + 1
          : undefined
      })



      if (Math.random() > 0.5 && nodeCount > 4) {

        const k = (i + 2) % nodeCount

        edges.push({
          from: i,
          to: k,
          weight: weighted
            ? Math.floor(Math.random() * 10) + 1
            : undefined
        })

      }

    }

  }

  return { nodes, edges }
}

//////////////////////////////////////////////////////
//////////// KOSARAJU GRAPH GENERATOR ////////////////
//////////////////////////////////////////////////////

export function generateKosarajuGraph(nodeCount: number) {

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  const width = 600
  const height = 500
  const r = 180

  // node positions
  for (let i = 0; i < nodeCount; i++) {

    const angle = (2 * Math.PI * i) / nodeCount

    nodes.push({
      id: i,
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle)
    })
  }

  ////////////////////////////////////////////////////
  // CREATE SCC CYCLES
  ////////////////////////////////////////////////////

  const groupSize = 3

  for (let i = 0; i < nodeCount; i += groupSize) {

    if (i + 2 < nodeCount) {

      edges.push({ from: i, to: i + 1 })
      edges.push({ from: i + 1, to: i + 2 })
      edges.push({ from: i + 2, to: i })

    }

  }

  ////////////////////////////////////////////////////
  // ADD RANDOM INTER-CONNECTIONS
  ////////////////////////////////////////////////////

  for (let i = 0; i < nodeCount - 1; i++) {

    if (Math.random() > 0.6) {

      edges.push({
        from: i,
        to: Math.floor(Math.random() * nodeCount)
      })

    }

  }

  return { nodes, edges }
}


function buildAdj(n: number, edges: GraphEdge[]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => [])

  for (const e of edges) {
    adj[e.from].push(e.to)
    adj[e.to].push(e.from)
  }

  return adj
}

//////////////////////////////////////////////////////
//////////// BFS (GUI STYLE) /////////////////////////
//////////////////////////////////////////////////////

export function bfs(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: number
): GraphStep[] {

  const adj = buildAdj(nodes.length, edges)

  const visited = new Set<number>()
  const queue: [number, number][] = []

  const levels: Record<number, number> = {}
  const steps: GraphStep[] = []

  nodes.forEach(n => levels[n.id] = -1)

  visited.add(start)
  queue.push([start, 0])
  levels[start] = 0

  steps.push({
    visitedNodes: [start],
    visitedEdges: [],
    currentNode: start,
    levels: { ...levels },
    currentLevel: 0,
    nodesAtLevel: [start],
    description: `Start BFS from node ${start} (Level 0)`
  })

  while (queue.length) {

    const [node, level] = queue.shift()!

    for (const neighbor of adj[node]) {

      if (!visited.has(neighbor)) {

        visited.add(neighbor)

        const nextLevel = level + 1
        levels[neighbor] = nextLevel

        queue.push([neighbor, nextLevel])

        const nodesAtLevel = Object.keys(levels)
          .filter(n => levels[Number(n)] === nextLevel)
          .map(Number)

        steps.push({
          visitedNodes: [...visited],
          visitedEdges: [[node, neighbor]],
          currentNode: neighbor,
          levels: { ...levels },
          currentLevel: nextLevel,
          nodesAtLevel,
          description: `Visit node ${neighbor} from node ${node} → Level ${nextLevel}`
        })
      }
    }
  }

  steps.push({
    visitedNodes: [...visited],
    visitedEdges: [],
    levels: { ...levels },
    description: "All Nodes Visited"
  })

  return steps
}

//////////////////////////////////////////////////////
//////////// DFS /////////////////////////////////////
//////////////////////////////////////////////////////

export function dfs(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: number
): GraphStep[] {

  const adj = buildAdj(nodes.length, edges)
  const visited = new Set<number>()
  const steps: GraphStep[] = []

  function visit(node: number) {

    visited.add(node)

    steps.push({
      visitedNodes: [...visited],
      visitedEdges: [],
      currentNode: node,
      description: `Visit node ${node}`
    })

    for (const neighbor of adj[node]) {

      if (!visited.has(neighbor)) {

        steps.push({
          visitedNodes: [...visited],
          visitedEdges: [[node, neighbor]],
          currentNode: neighbor,
          description: `Traverse edge ${node} → ${neighbor}`
        })

        visit(neighbor)

        steps.push({
          visitedNodes: [...visited],
          visitedEdges: [],
          currentNode: node,
          description: `Backtrack to ${node}`
        })
      }
    }
  }

  visit(start)

  return steps
}
//////////////////////////////////////////////////////
//////////// DIJKSTRA (GUI VERSION) //////////////////
//////////////////////////////////////////////////////

export function dijkstra(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: number,
  end: number
): GraphStep[] {


  if (start < 0 || start >= nodes.length || end < 0 || end >= nodes.length) {
    return [{
      visitedNodes: [],
      visitedEdges: [],
      description: "Invalid start or end node"
    }]
  }

  const n = nodes.length

  const dist = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)

  const visited = new Set<number>()

  const steps: GraphStep[] = []

  dist[start] = 0

  while (visited.size < n) {

    let u = -1

    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && (u === -1 || dist[i] < dist[u])) {
        u = i
      }
    }

    if (u === -1) break

    visited.add(u)

    steps.push({
      visitedNodes: [...visited],
      visitedEdges: [],
      currentNode: u,
      description: `Processing node ${u} (distance ${dist[u]})`
    })

    // stop early when end reached
    if (u === end) break

    for (const e of edges) {

      const neighbor =
        e.from === u ? e.to :
          e.to === u ? e.from :
            -1

      if (neighbor >= 0 && !visited.has(neighbor)) {

        const w = e.weight ?? 1

        if (dist[u] + w < dist[neighbor]) {

          dist[neighbor] = dist[u] + w
          parent[neighbor] = u

          steps.push({
            visitedNodes: [...visited],
            visitedEdges: [[u, neighbor]],
            currentNode: neighbor,
            description: `Update distance of node ${neighbor} → ${dist[neighbor]}`
          })
        }
      }
    }
  }

  //////////////////////////////////////
  // BACKTRACK SHORTEST PATH
  //////////////////////////////////////

  const pathEdges: [number, number][] = []
  const pathNodes: number[] = []

  let curr = end

  while (curr !== -1) {
    pathNodes.push(curr)

    if (parent[curr] !== -1) {
      pathEdges.push([parent[curr], curr])
    }

    curr = parent[curr]
  }

  pathNodes.reverse()
  pathEdges.reverse()

  steps.push({
    visitedNodes: pathNodes,
    visitedEdges: pathEdges,
    currentNode: end,
    description: `Shortest path found (cost ${dist[end]})`
  })

  return steps
}
//////////////////////////////////////////////////////
//////////// BELLMAN FORD (GUI VERSION) //////////////
//////////////////////////////////////////////////////

export function bellmanFord(
  nodes: GraphNode[],
  edges: GraphEdge[],
  start: number,
  end: number
): GraphStep[] {

  if (start < 0 || start >= nodes.length || end < 0 || end >= nodes.length) {
    return [{
      visitedNodes: [],
      visitedEdges: [],
      description: "Invalid start or end node"
    }]
  }

  const n = nodes.length

  const dist = Array(n).fill(Infinity)
  const parent = Array(n).fill(-1)

  const steps: GraphStep[] = []

  dist[start] = 0

  //////////////////////////////////////
  // RELAX EDGES N-1 TIMES
  //////////////////////////////////////

  for (let i = 0; i < n - 1; i++) {

    for (const e of edges) {

      const w = e.weight ?? 1

      if (dist[e.from] !== Infinity && dist[e.from] + w < dist[e.to]) {

        dist[e.to] = dist[e.from] + w
        parent[e.to] = e.from

        steps.push({
          visitedNodes: nodes.map(n => n.id),
          visitedEdges: [[e.from, e.to]],
          currentNode: e.to,
          description: `Relax edge ${e.from} → ${e.to}, new distance = ${dist[e.to]}`
        })
      }
    }
  }

  //////////////////////////////////////
  // NEGATIVE CYCLE CHECK
  //////////////////////////////////////

  for (const e of edges) {

    const w = e.weight ?? 1

    if (dist[e.from] !== Infinity && dist[e.from] + w < dist[e.to]) {

      steps.push({
        visitedNodes: [],
        visitedEdges: [[e.from, e.to]],
        description: "Negative cycle detected"
      })

      return steps
    }
  }

  //////////////////////////////////////
  // BACKTRACK SHORTEST PATH
  //////////////////////////////////////

  const pathEdges: [number, number][] = []
  const pathNodes: number[] = []

  let curr = end

  while (curr !== -1) {

    pathNodes.push(curr)

    if (parent[curr] !== -1) {
      pathEdges.push([parent[curr], curr])
    }

    curr = parent[curr]
  }

  pathNodes.reverse()
  pathEdges.reverse()

  steps.push({
    visitedNodes: pathNodes,
    visitedEdges: pathEdges,
    currentNode: end,
    description: `Shortest path found (cost ${dist[end]})`
  })

  return steps
}
//////////////////////////////////////////////////////
//////////// PRIM (GUI VERSION) //////////////////////
//////////////////////////////////////////////////////

export function prim(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphStep[] {

  const n = nodes.length

  const selected = new Set<number>()
  const mstEdges: [number, number][] = []

  const steps: GraphStep[] = []

  selected.add(0)

  while (selected.size < n) {

    let bestEdge: GraphEdge | null = null

    for (const e of edges) {

      const condition =
        (selected.has(e.from) && !selected.has(e.to)) ||
        (selected.has(e.to) && !selected.has(e.from))

      if (condition) {

        if (!bestEdge || (e.weight ?? 1) < (bestEdge.weight ?? 1)) {
          bestEdge = e
        }
      }
    }

    if (!bestEdge) break

    const newNode = selected.has(bestEdge.from)
      ? bestEdge.to
      : bestEdge.from

    selected.add(newNode)

    mstEdges.push([bestEdge.from, bestEdge.to])

    steps.push({
      visitedNodes: [...selected],
      visitedEdges: [...mstEdges],
      currentNode: newNode,
      description: `Add edge ${bestEdge.from} - ${bestEdge.to} (weight ${bestEdge.weight ?? 1})`
    })
  }

  const totalWeight = mstEdges.reduce((sum, [u, v]) => {
    const edge = edges.find(
      e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );
    return sum + (edge?.weight ?? 1);
  }, 0);

  steps.push({
    visitedNodes: [...selected],
    visitedEdges: [...mstEdges],
    currentNode: Array.from(selected).slice(-1)[0],
    description: `MST completed — Total Weight = ${totalWeight}`
  });


  return steps
}
//////////////////////////////////////////////////////
//////////// KRUSKAL /////////////////////////////////
//////////////////////////////////////////////////////

export function kruskal(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphStep[] {

  const parent = nodes.map((_, i) => i)

  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x])
    return parent[x]
  }

  function union(a: number, b: number) {
    parent[find(a)] = find(b)
  }

  const sorted = [...edges].sort(
    (a, b) => (a.weight ?? 1) - (b.weight ?? 1)
  )

  const steps: GraphStep[] = []
  const mstEdges: [number, number][] = []

  for (const e of sorted) {

    if (find(e.from) !== find(e.to)) {

      union(e.from, e.to)
      mstEdges.push([e.from, e.to])

      steps.push({
        visitedNodes: [],
        visitedEdges: [...mstEdges],
        currentNode: e.to,
        description: `Add edge ${e.from}-${e.to}`
      })
    }
  }
  const totalWeight = mstEdges.reduce((sum, [u, v]) => {
    const edge = edges.find(
      e => (e.from === u && e.to === v) || (e.from === v && e.to === u)
    );
    return sum + (edge?.weight ?? 1);
  }, 0);

  steps.push({
    visitedNodes: nodes.map(n => n.id),
    visitedEdges: [...mstEdges],
    currentNode: mstEdges[mstEdges.length - 1]?.[1],
    description: `MST completed — Total Weight = ${totalWeight}`
  });


  return steps
}

//////////////////////////////////////////////////////
//////////// TOPOLOGICAL SORT (GUI VERSION) //////////
//////////////////////////////////////////////////////

export function topologicalSort(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphStep[] {

  const n = nodes.length

  const adj: number[][] = Array.from({ length: n }, () => [])
  const indegree = Array(n).fill(0)

  const steps: GraphStep[] = []

  // treat edges as directed (from → to)
  for (const e of edges) {
    adj[e.from].push(e.to)
    indegree[e.to]++
  }

  const queue: number[] = []

  for (let i = 0; i < n; i++) {
    if (indegree[i] === 0) queue.push(i)
  }

  const order: number[] = []

  while (queue.length) {

    const u = queue.shift()!

    order.push(u)

    steps.push({
      visitedNodes: [...order],
      visitedEdges: [],
      currentNode: u,
      description: `Add node ${u} to topological order`
    })

    for (const v of adj[u]) {

      indegree[v]--

      if (indegree[v] === 0) {
        queue.push(v)

        steps.push({
          visitedNodes: [...order],
          visitedEdges: [[u, v]],
          currentNode: v,
          description: `Node ${v} now has indegree 0`
        })
      }
    }
  }

  if (order.length !== n) {

    steps.push({
      visitedNodes: [],
      visitedEdges: [],
      description: "Cycle detected — Topological Sort not possible"
    })

    return steps
  }

  steps.push({
    visitedNodes: order,
    visitedEdges: [],
    description: `Topological order: ${order.join(" → ")}`
  })

  return steps
}
//////////////////////////////////////////////////////
//////////// KOSARAJU (GUI VERSION) //////////////////
//////////////////////////////////////////////////////

export function kosaraju(
  nodes: GraphNode[],
  edges: GraphEdge[]
): GraphStep[] {

  const n = nodes.length

  const adj: number[][] = Array.from({ length: n }, () => [])
  for (const e of edges) adj[e.from].push(e.to)

  const visited = new Set<number>()
  const stack: number[] = []

  ////////////////////////////////////////////////////
  // FIRST DFS (ORDER BY FINISH TIME)
  ////////////////////////////////////////////////////

  function dfs1(v: number) {
    visited.add(v)

    for (const nb of adj[v]) {
      if (!visited.has(nb)) dfs1(nb)
    }

    stack.push(v)
  }

  for (let i = 0; i < n; i++) {
    if (!visited.has(i)) dfs1(i)
  }

  ////////////////////////////////////////////////////
  // TRANSPOSE GRAPH
  ////////////////////////////////////////////////////

  const rev: number[][] = Array.from({ length: n }, () => [])

  for (const e of edges) {
    rev[e.to].push(e.from)
  }

  ////////////////////////////////////////////////////
  // SECOND DFS (FIND SCCs)
  ////////////////////////////////////////////////////

  visited.clear()

  const steps: GraphStep[] = []
  const component: Record<number, number> = {}

  let compId = 0

  function dfs2(v: number, comp: number[]) {

    visited.add(v)
    comp.push(v)

    component[v] = compId

    steps.push({
      visitedNodes: [...comp],
      visitedEdges: [],
      currentNode: v,
      components: { ...component },
      description: `Node ${v} added to Component ${compId + 1}`
    })

    for (const nb of rev[v]) {
      if (!visited.has(nb)) dfs2(nb, comp)
    }
  }

  while (stack.length) {

    const node = stack.pop()!

    if (!visited.has(node)) {

      const comp: number[] = []

      dfs2(node, comp)

      steps.push({
        visitedNodes: [...comp],
        visitedEdges: [],
        currentNode: comp[comp.length - 1], // ✅ important
        components: { ...component },
        description: `Component ${compId + 1} completed`
      })

      compId++
    }
  }

  steps.push({
    visitedNodes: nodes.map(n => n.id),
    visitedEdges: [],
    currentNode: nodes[nodes.length - 1]?.id ?? 0, // ✅ fallback
    components: { ...component },
    description: `Total SCCs found: ${compId}`
  })

  return steps
}
export const graphAlgoInfo = {

  BFS: {
    explanation: `
Breadth First Search (BFS) is a graph traversal algorithm that explores vertices level by level starting from a source node.

It visits all immediate neighbors first before moving to the next level of neighbors. BFS uses a Queue (FIFO) data structure to maintain the order of traversal.

This algorithm guarantees the shortest path in terms of number of edges in an unweighted graph.

Working:
1. Start from the source node.
2. Mark the source node as visited.
3. Insert the source node into a queue.
4. While the queue is not empty:
   - Remove the front node.
   - Visit that node.
   - Add all unvisited neighbors into the queue.
`,

    timeComplexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)"
    },

    code: `
BFS(Graph G, start):
    create queue Q
    mark start as visited
    enqueue start into Q

    while Q is not empty:
        node = dequeue(Q)
        visit(node)

        for each neighbor v of node:
            if v not visited:
                mark v visited
                enqueue v
`,
    weighted: false
  },

  DFS: {
    explanation: `
Depth First Search (DFS) explores a graph by going as deep as possible before backtracking.

Instead of visiting neighbors level by level like BFS, DFS continues moving deeper into the graph until it reaches a dead end, then it backtracks.

DFS can be implemented using recursion or an explicit stack.

Applications include:
- Cycle detection
- Topological sorting
- Finding connected components
`,

    timeComplexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)"
    },

    code: `
DFS(Graph G, node):
    mark node as visited
    visit(node)

    for each neighbor v of node:
        if v not visited:
            DFS(G, v)
`,
    weighted: false
  },

  Dijkstra: {
    explanation: `
Dijkstra's Algorithm finds the shortest path from a source node to all other nodes in a weighted graph with non-negative edge weights.

The algorithm works using a greedy strategy where the closest unvisited node is always selected next.

A priority queue is commonly used to efficiently retrieve the node with the minimum distance.

Working:
1. Initialize distances to all vertices as infinity.
2. Distance to source = 0.
3. Use a priority queue to store nodes.
4. Repeatedly extract the node with the minimum distance.
5. Relax all adjacent edges.
`,

    timeComplexity: {
      best: "O(E log V)",
      average: "O(E log V)",
      worst: "O(E log V)"
    },

    code: `
Dijkstra(Graph G, source):
    for each vertex v in G:
        dist[v] = infinity
        parent[v] = null

    dist[source] = 0
    priorityQueue PQ
    insert source into PQ

    while PQ not empty:
        u = extractMin(PQ)

        for each neighbor v of u:
            weight = w(u,v)

            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                parent[v] = u
                update PQ with new dist[v]
`,
    weighted: true
  },

  "Bellman-Ford": {
    explanation: `
Bellman-Ford computes shortest paths from a source vertex to all other vertices in a weighted graph.

Unlike Dijkstra, it can handle graphs with negative edge weights.

The algorithm repeatedly relaxes all edges V-1 times.

After V-1 iterations, shortest paths are guaranteed if no negative cycles exist.
`,

    timeComplexity: {
      best: "O(VE)",
      average: "O(VE)",
      worst: "O(VE)"
    },

    code: `
BellmanFord(Graph G, source):
    for each vertex v:
        dist[v] = infinity

    dist[source] = 0

    repeat V-1 times:
        for each edge (u,v,w):
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w

    for each edge (u,v,w):
        if dist[u] + w < dist[v]:
            report negative cycle
`,
    weighted: true
  },

  "Prim's": {
    explanation: `
Prim's Algorithm constructs a Minimum Spanning Tree (MST) of a weighted graph.

It starts from any node and repeatedly adds the smallest edge connecting the current tree to a new vertex.

Prim's algorithm uses a priority queue to efficiently choose the minimum edge.
`,

    timeComplexity: {
      best: "O(E log V)",
      average: "O(E log V)",
      worst: "O(E log V)"
    },

    code: `
Prim(Graph G):
    choose starting vertex s
    mark s visited

    add all edges from s to PQ

    while PQ not empty:
        edge = extract minimum edge

        if edge connects to unvisited vertex v:
            add edge to MST
            mark v visited

            add all edges from v to PQ
`,
    weighted: true
  },

  "Kruskal's": {
    explanation: `
Kruskal's Algorithm finds a Minimum Spanning Tree by selecting the smallest edges first.

Edges are sorted in increasing order of weight and added to the MST if they do not create a cycle.

Union-Find (Disjoint Set) data structure is used to efficiently detect cycles.
`,

    timeComplexity: {
      best: "O(E log E)",
      average: "O(E log E)",
      worst: "O(E log E)"
    },

    code: `
Kruskal(Graph G):
    sort all edges by weight

    create disjoint set for vertices

    for each edge (u,v):
        if find(u) != find(v):
            add edge to MST
            union(u,v)
`,
    weighted: true
  },

  "Topological Sort": {
    explanation: `
Topological Sorting produces a linear ordering of vertices in a Directed Acyclic Graph (DAG).

For every directed edge u → v, vertex u appears before v in the ordering.

Kahn's algorithm uses indegree counts and a queue to generate the ordering.
`,

    timeComplexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)"
    },

    code: `
TopologicalSort(Graph G):
    compute indegree of all vertices

    enqueue vertices with indegree 0

    while queue not empty:
        u = dequeue
        output u

        for each neighbor v:
            decrease indegree[v]

            if indegree[v] == 0:
                enqueue v
`,
    weighted: false
  },

  "Kosaraju's": {
    explanation: `
Kosaraju's Algorithm finds all Strongly Connected Components (SCC) in a directed graph.

A strongly connected component is a group of vertices where each vertex is reachable from every other vertex.

The algorithm performs two DFS passes:
1. DFS to compute finishing times.
2. Reverse the graph.
3. Perform DFS in decreasing order of finishing time.
`,

    timeComplexity: {
      best: "O(V + E)",
      average: "O(V + E)",
      worst: "O(V + E)"
    },

    code: `
Kosaraju(Graph G):
    stack S

    perform DFS and push vertices to S by finish time

    reverse all edges in graph

    mark all vertices unvisited

    while stack not empty:
        v = pop(S)

        if v not visited:
            DFS(v) in reversed graph
            output SCC
`,
    weighted: false
  }

}