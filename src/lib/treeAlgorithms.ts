// ===== BST & AVL Tree Algorithm Logic =====

export interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x: number;
  y: number;
  height: number; // AVL height
}

export function avlConstructionSteps(root: TreeNode | null): { tree: TreeNode | null; steps: AnimationStep[] } {

  const steps: AnimationStep[] = [];

  function balance(node: TreeNode | null): TreeNode | null {

    if (!node) return null;

    node.left = balance(node.left);
    node.right = balance(node.right);

    updateHeight(node);

    const bf = getBalanceFactor(node);

    steps.push(
      makeStep(root, [node.value], [], `Checking balance factor of ${node.value} (BF = ${bf})`, [])
    );

    // LL
    if (bf > 1 && getBalanceFactor(node.left) >= 0) {

      steps.push(
        makeStep(root, [node.value], [], `Left-Left imbalance at ${node.value}`, [], "LL Rotation")
      );

      node = rotateRight(node);

      steps.push(
        makeStep(root, [node.value], [], `Performed Right Rotation`, [])
      );
    }

    // RR
    else if (bf < -1 && getBalanceFactor(node.right) <= 0) {

      steps.push(
        makeStep(root, [node.value], [], `Right-Right imbalance at ${node.value}`, [], "RR Rotation")
      );

      node = rotateLeft(node);

      steps.push(
        makeStep(root, [node.value], [], `Performed Left Rotation`, [])
      );
    }

    // LR
    else if (bf > 1 && getBalanceFactor(node.left) < 0) {

      steps.push(
        makeStep(root, [node.value], [], `Left-Right imbalance at ${node.value}`, [], "LR Rotation")
      );

      node.left = rotateLeft(node.left!);
      node = rotateRight(node);

      steps.push(
        makeStep(root, [node.value], [], `Performed LR Rotation`, [])
      );
    }

    // RL
    else if (bf < -1 && getBalanceFactor(node.right) > 0) {

      steps.push(
        makeStep(root, [node.value], [], `Right-Left imbalance at ${node.value}`, [], "RL Rotation")
      );

      node.right = rotateRight(node.right!);
      node = rotateLeft(node);

      steps.push(
        makeStep(root, [node.value], [], `Performed RL Rotation`, [])
      );
    }

    return node;
  }

  const newRoot = balance(root);

  steps.push(
    makeStep(newRoot, [], [], `AVL Construction Complete`, [])
  );

  return { tree: newRoot, steps };
}

export interface AnimationStep {
  tree: TreeNode | null;
  highlighted: number[];    // node values currently highlighted
  comparing: number[];
  swapping?: number[];     // node values being compared
  message: string;
  traversalOrder: number[]; // accumulated traversal result
  rotationType?: string;    // for AVL rotations
}

// ===== BST Operations =====

function cloneTree(node: TreeNode | null): TreeNode | null {
  if (!node) return null;
  return {
    value: node.value,
    left: cloneTree(node.left),
    right: cloneTree(node.right),
    x: node.x,
    y: node.y,
    height: node.height,
  };
}

function getHeight(node: TreeNode | null): number {
  return node ? node.height : 0;
}

function updateHeight(node: TreeNode): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

function getBalanceFactor(node: TreeNode | null): number {
  return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

// Assign x,y positions for rendering
export function assignPositions(
  node: TreeNode | null,
  x: number = 400,
  y: number = 50,
  spread: number = 160,
  depth: number = 0
): void {
  if (!node) return;
  node.x = x;
  node.y = y;
  const nextSpread = Math.max(spread * 0.55, 30);
  assignPositions(node.left, x - spread, y + 70, nextSpread, depth + 1);
  assignPositions(node.right, x + spread, y + 70, nextSpread, depth + 1);
}

function makeStep(
  tree: TreeNode | null,
  highlighted: number[],
  comparing: number[],
  message: string,
  traversalOrder: number[],
  rotationType?: string,
  swapping: number[] = []   // ✅ NEW
): AnimationStep {
  const t = cloneTree(tree);
  if (t) assignPositions(t);

  return {
    tree: t,
    highlighted: [...highlighted],
    comparing: [...comparing],
    swapping: [...swapping],  // ✅ NEW
    message,
    traversalOrder: [...traversalOrder],
    rotationType,
  };
}

// BST Insert with steps
export function bstInsertSteps(root: TreeNode | null, value: number): AnimationStep[] {
  const steps: AnimationStep[] = [];

  function insert(node: TreeNode | null, val: number): TreeNode {
    if (!node) {
      const newNode: TreeNode = { value: val, left: null, right: null, x: 0, y: 0, height: 1 };
      // We need to build the step after insertion in context
      return newNode;
    }

    steps.push(makeStep(root, [node.value], [val], `Comparing ${val} with ${node.value}`, []));

    if (val < node.value) {
      steps.push(makeStep(root, [node.value], [], `${val} < ${node.value}, go left`, []));
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      steps.push(makeStep(root, [node.value], [], `${val} > ${node.value}, go right`, []));
      node.right = insert(node.right, val);
    } else {
      steps.push(makeStep(root, [node.value], [], `${val} already exists`, []));
      return node;
    }
    updateHeight(node);
    return node;
  }

  if (!root) {
    root = { value, left: null, right: null, x: 0, y: 0, height: 1 };
    steps.push(makeStep(root, [value], [], `Inserted ${value} as root`, []));
  } else {
    root = insert(root, value);
    steps.push(makeStep(root, [value], [], `Inserted ${value}`, []));
  }

  return steps;
}

// BST Search with steps
export function bstSearchSteps(root: TreeNode | null, value: number): AnimationStep[] {
  const steps: AnimationStep[] = [];
  let current = root;

  while (current) {
    steps.push(makeStep(root, [current.value], [value], `Comparing with ${current.value}`, []));
    if (value === current.value) {
      steps.push(makeStep(root, [current.value], [], `Found ${value}!`, []));
      return steps;
    } else if (value < current.value) {
      steps.push(makeStep(root, [current.value], [], `${value} < ${current.value}, go left`, []));
      current = current.left;
    } else {
      steps.push(makeStep(root, [current.value], [], `${value} > ${current.value}, go right`, []));
      current = current.right;
    }
  }
  steps.push(makeStep(root, [], [value], `${value} not found in tree`, []));
  return steps;
}

// ===== Traversals =====

export function inOrderSteps(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const order: number[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;
    steps.push(makeStep(root, [node.value], [], `Visit left subtree of ${node.value}`, order));
    traverse(node.left);
    order.push(node.value);
    steps.push(
      makeStep(
        root,
        [...order], // ✅ ALL visited nodes stay green
        [],
        `Process ${node.value} (In-Order)`,
        order
      )
    );
    traverse(node.right);
  }
  traverse(root);
  steps.push(makeStep(root, [], [], `In-Order traversal complete: [${order.join(', ')}]`, order));
  return steps;
}

export function preOrderSteps(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const order: number[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;
    order.push(node.value);
    steps.push(
      makeStep(
        root,
        [...order], // ✅ persistent green nodes
        [],
        `Process ${node.value} (Pre-Order)`,
        order
      )
    ); traverse(node.left);
    traverse(node.right);
  }
  traverse(root);
  steps.push(makeStep(root, [], [], `Pre-Order traversal complete: [${order.join(', ')}]`, order));
  return steps;
}

export function postOrderSteps(root: TreeNode | null): AnimationStep[] {
  const steps: AnimationStep[] = [];
  const order: number[] = [];

  function traverse(node: TreeNode | null) {
    if (!node) return;
    steps.push(makeStep(root, [node.value], [], `Visit subtrees of ${node.value}`, order));
    traverse(node.left);
    traverse(node.right);
    order.push(node.value);
    steps.push(
      makeStep(
        root,
        [...order], // ✅ keep visited nodes green
        [],
        `Process ${node.value} (Post-Order)`,
        order
      )
    );
  }
  traverse(root);
  steps.push(makeStep(root, [], [], `Post-Order traversal complete: [${order.join(', ')}]`, order));
  return steps;
}

// ===== AVL Operations =====

function rotateRight(y: TreeNode): TreeNode {
  const x = y.left!;
  const T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function rotateLeft(x: TreeNode): TreeNode {
  const y = x.right!;
  const T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

export function avlInsertSteps(root: TreeNode | null, value: number): { tree: TreeNode | null; steps: AnimationStep[] } {
  const steps: AnimationStep[] = [];

  function insert(node: TreeNode | null, val: number): TreeNode {
    if (!node) {
      return { value: val, left: null, right: null, x: 0, y: 0, height: 1 };
    }

    steps.push(makeStep(root, [node.value], [val], `Comparing ${val} with ${node.value}`, []));

    if (val < node.value) {
      node.left = insert(node.left, val);
    } else if (val > node.value) {
      node.right = insert(node.right, val);
    } else {
      return node;
    }

    updateHeight(node);
    const balance = getBalanceFactor(node);

    // LL
    if (balance > 1 && val < node.left!.value) {

      // 🔴 STEP 1: highlight nodes involved
      steps.push(
        makeStep(
          root,
          [],
          [],
          `LL Rotation at ${node.value}`,
          [],
          "LL Rotation",
          [node.value, node.left!.value] // 🔴 RED
        )
      );

      // 🔁 STEP 2: perform rotation
      const newNode = rotateRight(node);

      // 🟢 STEP 3: show result
      steps.push(
        makeStep(
          newNode,
          [newNode.value], // 🟢 new root
          [],
          `Right Rotation Done`,
          []
        )
      );

      return newNode;
    }
    // RR
    if (balance < -1 && val > node.right!.value) {

      steps.push(
        makeStep(
          root,
          [],
          [],
          `RR Rotation at ${node.value}`,
          [],
          "RR Rotation",
          [node.value, node.right!.value]
        )
      );

      const newNode = rotateLeft(node);

      steps.push(
        makeStep(
          newNode,
          [newNode.value],
          [],
          `Left Rotation Done`,
          []
        )
      );

      return newNode;
    }
    // LR
    if (balance > 1 && val > node.left!.value) {

      steps.push(
        makeStep(
          root,
          [],
          [],
          `LR Rotation at ${node.value}`,
          [],
          "LR Rotation",
          [node.value, node.left!.value]
        )
      );

      node.left = rotateLeft(node.left!);
      const newNode = rotateRight(node);

      steps.push(
        makeStep(
          newNode,
          [newNode.value],
          [],
          `LR Rotation Done`,
          []
        )
      );

      return newNode;
    }
    // RL
    if (balance < -1 && val < node.right!.value) {

      steps.push(
        makeStep(
          root,
          [],
          [],
          `RL Rotation at ${node.value}`,
          [],
          "RL Rotation",
          [node.value, node.right!.value]
        )
      );

      node.right = rotateRight(node.right!);
      const newNode = rotateLeft(node);

      steps.push(
        makeStep(
          newNode,
          [newNode.value],
          [],
          `RL Rotation Done`,
          []
        )
      );

      return newNode;
    }

    return node;
  }

  const newRoot = insert(root, value);
  steps.push(makeStep(newRoot, [value], [], `Inserted ${value} into AVL tree`, []));

  return { tree: newRoot, steps };
}

// BST Delete with steps
export function bstDeleteSteps(root: TreeNode | null, value: number): AnimationStep[] {
  const steps: AnimationStep[] = [];

  function findMin(node: TreeNode): TreeNode {
    while (node.left) node = node.left;
    return node;
  }

  function deleteNode(node: TreeNode | null, val: number): TreeNode | null {
    if (!node) {
      steps.push(makeStep(root, [], [val], `${val} not found`, []));
      return null;
    }

    steps.push(makeStep(root, [node.value], [val], `Comparing with ${node.value}`, []));

    if (val < node.value) {
      node.left = deleteNode(node.left, val);
    } else if (val > node.value) {
      node.right = deleteNode(node.right, val);
    } else {
      // Found node to delete
      if (!node.left && !node.right) {
        steps.push(makeStep(root, [node.value], [], `Deleting leaf node ${node.value}`, []));
        return null;
      } else if (!node.left) {
        steps.push(makeStep(root, [node.value], [], `Replacing ${node.value} with right child`, []));
        return node.right;
      } else if (!node.right) {
        steps.push(makeStep(root, [node.value], [], `Replacing ${node.value} with left child`, []));
        return node.left;
      } else {
        const successor = findMin(node.right);
        steps.push(makeStep(root, [node.value, successor.value], [], `Replacing ${node.value} with in-order successor ${successor.value}`, []));
        node.value = successor.value;
        node.right = deleteNode(node.right, successor.value);
      }
    }
    updateHeight(node);
    return node;
  }

  root = deleteNode(root, value);
  steps.push(makeStep(root, [], [], `Deletion complete`, []));
  return steps;
}

// Build a sample BST from array
export function buildBST(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const v of values) {
    root = insertBST(root, v);
  }
  if (root) assignPositions(root);
  return root;
}

function insertBST(node: TreeNode | null, val: number): TreeNode {
  if (!node) return { value: val, left: null, right: null, x: 0, y: 0, height: 1 };
  if (val < node.value) node.left = insertBST(node.left, val);
  else if (val > node.value) node.right = insertBST(node.right, val);
  updateHeight(node);
  return node;
}

// Build AVL from array
export function buildAVL(values: number[]): TreeNode | null {
  let root: TreeNode | null = null;
  for (const v of values) {
    const result = avlInsertSteps(root, v);
    root = result.tree;
  }
  if (root) assignPositions(root);
  return root;
}

// Get all node values from tree
export function getAllValues(node: TreeNode | null): number[] {
  if (!node) return [];
  return [...getAllValues(node.left), node.value, ...getAllValues(node.right)];
}


// ===== HEAP CONSTRUCTION =====

function heapify(arr: number[], n: number, i: number, isMin: boolean, steps: AnimationStep[], root: TreeNode | null) {
  let extreme = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n) {
    steps.push(makeStep(root, [arr[i], arr[left]], [], `Compare ${arr[i]} and ${arr[left]}`, []));
    if (isMin ? arr[left] < arr[extreme] : arr[left] > arr[extreme]) {
      extreme = left;
    }
  }

  if (right < n) {
    steps.push(makeStep(root, [arr[i], arr[right]], [], `Compare ${arr[i]} and ${arr[right]}`, []));
    if (isMin ? arr[right] < arr[extreme] : arr[right] > arr[extreme]) {
      extreme = right;
    }
  }

  if (extreme !== i) {

    // 🔴 STEP A: Highlight swap BEFORE it happens (RED)
    steps.push(
      makeStep(
        root,
        [],
        [],
        `Swapping ${arr[i]} and ${arr[extreme]}`,
        [],
        undefined,
        [arr[i], arr[extreme]] // 👈 THIS triggers RED color
      )
    );

    // 🔁 ACTUAL SWAP
    [arr[i], arr[extreme]] = [arr[extreme], arr[i]];

    // 🟢 STEP B: Show result AFTER swap (GREEN)
    steps.push(
      makeStep(
        root,
        [arr[extreme]], // 👈 mark as "placed"
        [],
        `${arr[extreme]} moved to correct position`,
        []
      )
    );

    // 🔄 Continue heapify
    heapify(arr, n, extreme, isMin, steps, root);
  }
}

export function getLevelOrderValues(root: TreeNode | null): number[] {
  if (!root) return [];

  const result: number[] = [];
  const queue: (TreeNode | null)[] = [root];

  while (queue.length) {
    const node = queue.shift();
    if (!node) continue;

    result.push(node.value);
    queue.push(node.left);
    queue.push(node.right);
  }

  return result;
}

// Convert array → complete binary tree
function buildTreeFromArray(arr: number[]): TreeNode | null {
  if (!arr.length) return null;

  const nodes: TreeNode[] = arr.map(v => ({
    value: v,
    left: null,
    right: null,
    x: 0,
    y: 0,
    height: 1,
  }));

  for (let i = 0; i < arr.length; i++) {
    if (2 * i + 1 < arr.length) nodes[i].left = nodes[2 * i + 1];
    if (2 * i + 2 < arr.length) nodes[i].right = nodes[2 * i + 2];
  }

  assignPositions(nodes[0]);
  return nodes[0];
}

export function heapConstructionSteps(values: number[], isMin: boolean): { tree: TreeNode | null; steps: AnimationStep[] } {
  const arr = [...values];
  const steps: AnimationStep[] = [];

  let tree = buildTreeFromArray(arr);

  for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i--) {
    steps.push(makeStep(tree, [arr[i]], [], `Heapify at index ${i}`, []));
    heapify(arr, arr.length, i, isMin, steps, tree);
    tree = buildTreeFromArray(arr);
  }

  steps.push(makeStep(tree, [], [], `${isMin ? "Min Heap" : "Max Heap"} constructed`, []));

  return { tree, steps };
}