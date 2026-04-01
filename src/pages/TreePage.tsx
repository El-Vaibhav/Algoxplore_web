import { useState, useEffect, useRef, useCallback } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import AlgoInfo from "@/components/AlgoInfo";
import TreeCanvas from "@/components/TreeCanvas";
import SpeedControl from "@/components/SpeedControl";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { heapConstructionSteps } from "@/lib/treeAlgorithms";
import { getLevelOrderValues } from "@/lib/treeAlgorithms";
import { avlInsertSteps } from "@/lib/treeAlgorithms";
import {
  TreeNode,
  AnimationStep,
  buildBST,
  buildAVL,
  bstInsertSteps,
  bstSearchSteps,
  bstDeleteSteps,
  inOrderSteps,
  preOrderSteps,
  postOrderSteps,
  avlConstructionSteps,
  assignPositions,
  getAllValues,
} from "@/lib/treeAlgorithms";
import { Play, Pause, RotateCcw, Plus, Search, Trash2, TreeDeciduous } from "lucide-react";
import ComplexityPanel from "@/components/ComplexityPanel";

type AlgoType = "bst-insert" | "bst-search" | "bst-delete" | "in-order" | "pre-order" | "post-order" | "avl-insert" | "min-heap" | "max-heap";

function generateRandomTree(size = 11): number[] {
  const values: number[] = [];
  const used = new Set<number>();

  while (values.length < size) {
    const v = Math.floor(Math.random() * 100);
    if (!used.has(v)) {
      used.add(v);
      values.push(v);
    }
  }

  return values;
}

const algorithms: { key: AlgoType; label: string; group: string }[] = [
  { key: "bst-insert", label: "BST Insert", group: "BST" },
  { key: "bst-search", label: "BST Search", group: "BST" },
  { key: "bst-delete", label: "BST Delete", group: "BST" },
  { key: "in-order", label: "In-Order", group: "Traversal" },
  { key: "pre-order", label: "Pre-Order", group: "Traversal" },
  { key: "post-order", label: "Post-Order", group: "Traversal" },
  { key: "avl-insert", label: "AVL Construction", group: "AVL" },
  { key: "min-heap", label: "Min Heap", group: "Heap" },
  { key: "max-heap", label: "Max Heap", group: "Heap" },
];

const algoInfo: Record<AlgoType, { name: string; explanation: string; timeComplexity: { best: string; average: string; worst: string }; code: string }> = {
  "bst-insert": {
    name: "BST Insert",
    explanation: "Inserts a value into a Binary Search Tree by comparing with each node and going left (smaller) or right (larger) until finding an empty spot.",
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)" },
    code: "insert(node, val):\n  if node is null: return new Node(val)\n  if val < node.val: node.left = insert(node.left, val)\n  else if val > node.val: node.right = insert(node.right, val)\n  return node",
  },
  "bst-search": {
    name: "BST Search",
    explanation: "Searches for a value by comparing with the current node and traversing left or right accordingly. Returns when found or when a null node is reached.",
    timeComplexity: { best: "O(1)", average: "O(log n)", worst: "O(n)" },
    code: "search(node, val):\n  if node is null: return false\n  if val == node.val: return true\n  if val < node.val: return search(node.left, val)\n  return search(node.right, val)",
  },
  "bst-delete": {
    name: "BST Delete",
    explanation: "Removes a node by handling three cases: leaf node (remove), one child (replace with child), two children (replace with in-order successor).",
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(n)" },
    code: "delete(node, val):\n  if val < node.val: node.left = delete(node.left, val)\n  else if val > node.val: node.right = delete(node.right, val)\n  else:\n    if no children: return null\n    if one child: return that child\n    successor = min(node.right)\n    node.val = successor.val\n    node.right = delete(node.right, successor.val)",
  },
  "in-order": {
    name: "In-Order Traversal",
    explanation: "Visits nodes in Left → Root → Right order. For a BST, this produces values in sorted ascending order.",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    code: "inOrder(node):\n  if node is null: return\n  inOrder(node.left)\n  visit(node)\n  inOrder(node.right)",
  },
  "pre-order": {
    name: "Pre-Order Traversal",
    explanation: "Visits nodes in Root → Left → Right order. Useful for creating a copy of the tree or prefix expression generation.",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    code: "preOrder(node):\n  if node is null: return\n  visit(node)\n  preOrder(node.left)\n  preOrder(node.right)",
  },
  "post-order": {
    name: "Post-Order Traversal",
    explanation: "Visits nodes in Left → Right → Root order. Useful for deleting a tree or evaluating postfix expressions.",
    timeComplexity: { best: "O(n)", average: "O(n)", worst: "O(n)" },
    code: "postOrder(node):\n  if node is null: return\n  postOrder(node.left)\n  postOrder(node.right)\n  visit(node)",
  },
  "avl-insert": {
    name: "AVL Construct",
    explanation: "Inserts into a self-balancing BST. After insertion, checks balance factors and performs rotations (LL, RR, LR, RL) to maintain O(log n) height.",
    timeComplexity: { best: "O(log n)", average: "O(log n)", worst: "O(log n)" },
    code: "avlInsert(node, val):\n  // BST insert\n  node = bstInsert(node, val)\n  balance = height(left) - height(right)\n  if balance > 1:  // Left-heavy\n    if val < left.val: rightRotate(node)  // LL\n    else: leftRotate(left), rightRotate(node)  // LR\n  if balance < -1:  // Right-heavy\n    if val > right.val: leftRotate(node)  // RR\n    else: rightRotate(right), leftRotate(node)  // RL",
  },
  "min-heap": {
    name: "Min Heap Construction",
    explanation:
      "Builds a Min Heap from a binary tree using bottom-up heapify. Each parent node becomes smaller than its children.",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
    },
    code:
      "for i = floor(n/2)-1 → 0:\n  heapify(i)\n\nheapify(i):\n  smallest = i\n  if left < smallest: smallest = left\n  if right < smallest: smallest = right\n  swap and recurse",
  },

  "max-heap": {
    name: "Max Heap Construction",
    explanation:
      "Builds a Max Heap where each parent node is greater than its children using bottom-up heapify.",
    timeComplexity: {
      best: "O(n)",
      average: "O(n)",
      worst: "O(n)",
    },
    code:
      "for i = floor(n/2)-1 → 0:\n  heapify(i)\n\nheapify(i):\n  largest = i\n  if left > largest: largest = left\n  if right > largest: largest = right\n  swap and recurse",
  },
};

const defaultValues = [50, 30, 70, 20, 40, 60, 80];

const TreePage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<AlgoType>("bst-insert");
  const [tree, setTree] = useState<TreeNode | null>(() => buildBST(defaultValues));
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(5);
  const [inputValue, setInputValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStepData = currentStep >= 0 && currentStep < steps.length ? steps[currentStep] : null;
  const highlighted = currentStepData?.highlighted ?? [];
  const comparing = currentStepData?.comparing ?? [];
  const displayTree = currentStepData?.tree ?? tree;
  const swapping = currentStepData?.swapping ?? [];

  const stopAnimation = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isRunning || currentStep >= steps.length - 1) {
      if (isRunning && currentStep >= steps.length - 1) setIsRunning(false);
      return;
    }
    const delay = 600 * speed;
    timerRef.current = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, currentStep, steps.length, speed]);

  const runAlgorithm = useCallback(() => {
    const val = parseInt(inputValue);
    let newSteps: AnimationStep[] = [];

    switch (selectedAlgo) {
      case "bst-insert": {
        if (isNaN(val)) return;
        newSteps = bstInsertSteps(tree, val);
        // After animation, actually insert
        const newTree = buildBST([...getAllValues(tree), val]);
        setTimeout(() => setTree(newTree), newSteps.length * Math.max(100, 1100 - speed * 100) + 200);
        break;
      }
      case "bst-search": {
        if (isNaN(val)) return;
        newSteps = bstSearchSteps(tree, val);
        break;
      }
      case "bst-delete": {
        if (isNaN(val)) return;
        newSteps = bstDeleteSteps(tree, val);
        const vals = getAllValues(tree).filter(v => v !== val);
        setTimeout(() => setTree(buildBST(vals)), newSteps.length * Math.max(100, 1100 - speed * 100) + 200);
        break;
      }
      case "in-order":
        newSteps = inOrderSteps(tree);
        break;
      case "pre-order":
        newSteps = preOrderSteps(tree);
        break;
      case "post-order":
        newSteps = postOrderSteps(tree);
        break;
      case "avl-insert": {

        const values = getAllValues(tree);

        let tempTree: TreeNode | null = null;
        let allSteps: AnimationStep[] = [];

        // 🔁 Build AVL step-by-step using avlInsertSteps
        for (const v of values) {
          const result = avlInsertSteps(tempTree, v);
          tempTree = result.tree;
          allSteps.push(...result.steps);
        }

        newSteps = allSteps;

        setTimeout(() => {
          if (tempTree) assignPositions(tempTree);
          setTree(tempTree);
        }, newSteps.length * Math.max(100, 1100 - speed * 100) + 200);

        break;
      }
      case "min-heap":
      case "max-heap": {
        const values = getLevelOrderValues(tree);

        if (!values.length) return;

        const result = heapConstructionSteps(
          values,
          selectedAlgo === "min-heap"
        );

        newSteps = result.steps;

        setTimeout(() => {
          const t = result.tree;
          if (t) assignPositions(t);
          setTree(t);
        }, newSteps.length * Math.max(100, 1100 - speed * 100) + 200);

        break;
      }
    }

    setSteps(newSteps);
    setCurrentStep(0);
    setIsRunning(true);
  }, [selectedAlgo, tree, inputValue, speed]);

  const reset = () => {
    stopAnimation();

    const randomValues = generateRandomTree(11);
    const newTree = buildBST(randomValues);

    setTree(newTree);
    setSteps([]);
    setCurrentStep(-1);
    setInputValue("");
  };

  const needsInput = ["bst-insert", "bst-search", "bst-delete"].includes(selectedAlgo);
  const info = algoInfo[selectedAlgo];
  const groups = [...new Set(algorithms.map((a) => a.group))];

  return (
    <AlgoLayout title="Tree Algorithms">

      {/* ===== MAIN GRID ===== */}
      <div className="grid grid-cols-[1fr_320px] grid-rows-[1fr_auto] gap-6 items-stretch">

        {/* ================= TREE CANVAS ================= */}
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 relative h-full overflow-hidden flex items-center justify-center">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-tree/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-tree/3 rounded-full blur-[80px]" />

          <div className="relative z-10 w-full h-full">
            <TreeCanvas
              tree={displayTree}
              highlighted={highlighted}
              comparing={comparing}
              swapping={swapping}
              width={1000}
              height={600}
            />
          </div>

          {/* Status */}
          <AnimatePresence>
            {currentStepData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-4 left-4 right-4 flex justify-between"
              >
                <div className="bg-card/90 backdrop-blur border border-border rounded-xl px-4 py-2 text-sm">
                  {currentStepData.message}
                </div>

                {currentStepData.rotationType && (
                  <div className="bg-tree/10 border border-tree/30 text-tree rounded-lg px-3 py-1 text-xs font-mono">
                    {currentStepData.rotationType}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>


        {/* ================= ALGORITHM PANEL ================= */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-5 h-full flex flex-col">

          <h3 className="text-sm font-semibold flex items-center gap-2">
            <TreeDeciduous className="w-4 h-4 text-tree" />
            Algorithm
          </h3>

          {groups.map(group => (
            <div key={group} className="space-y-3">

              <div className="text-[10px] uppercase text-muted-foreground font-medium">
                {group}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {algorithms
                  .filter(a => a.group === group)
                  .map(algo => (
                    <button
                      key={algo.key}
                      onClick={() => {
                        setSelectedAlgo(algo.key);
                        stopAnimation();
                        setSteps([]);
                        setCurrentStep(-1);
                      }}
                      className={`px-3 py-2.5 text-sm rounded-lg transition w-full
                         ${selectedAlgo === algo.key
                          ? "bg-tree/15 text-tree border border-tree/30"
                          : "hover:bg-secondary/50 text-muted-foreground"
                        }`}
                    >
                      {algo.label}
                    </button>
                  ))}
              </div>

            </div>
          ))}

        </div>


        {/* ================= LEFT CONTROLS ================= */}
        <div className="flex gap-4 flex-wrap">

          {/* Build Tree */}
          <div className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Build Tree</h3>

            <input
              type="text"
              placeholder="Example: 50,30,70,20"
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
            />

            <Button
              className="w-full"
              onClick={() => {
                const vals = inputValue
                  .split(",")
                  .map(v => parseInt(v.trim()))
                  .filter(v => !isNaN(v));

                if (!vals.length) return;

                const newTree = buildBST(vals);
                setTree(newTree);
                setSteps([]);
                setCurrentStep(-1);
              }}
            >
              Build Tree
            </Button>
          </div>


          {/* Value Input */}
          {needsInput && (
            <div className="flex-1 min-w-[160px] rounded-xl border border-border bg-card p-4 space-y-3">
              <h3 className="text-sm font-semibold">Value</h3>

              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number"
                className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border text-sm"
              />
            </div>
          )}


          {/* Speed */}
          <div className="flex-1 min-w-[160px] rounded-xl border border-border bg-card p-4">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
          </div>


          {/* Tree Values */}
          <div className="flex-1 min-w-[220px] rounded-xl border border-border bg-card p-4 space-y-2">

            <h3 className="text-sm font-semibold">Tree Values</h3>

            <div className="flex flex-wrap gap-1.5">
              {getAllValues(tree).map((v, i) => (
                <span
                  key={`${v}-${i}`}
                  className={`px-2 py-0.5 text-xs font-mono rounded-md ${highlighted.includes(v)
                    ? "bg-tree/20 text-tree border border-tree/30"
                    : "bg-secondary/50 text-muted-foreground"
                    }`}
                >
                  {v}
                </span>
              ))}
            </div>

          </div>

        </div>


        {/* ================= RUN / RESET ================= */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2 h-fit">

          <Button
            onClick={isRunning ? stopAnimation : runAlgorithm}
            className="w-full bg-tree hover:bg-tree/90 text-background font-semibold"
            disabled={needsInput && !inputValue}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Run {info.name}
              </>
            )}
          </Button>

          <Button onClick={reset} variant="outline" className="w-full">
            <RotateCcw className="w-4 h-4" />
            Reset Tree
          </Button>

        </div>

      </div>


      {/* ===== Algorithm Info ===== */}
      <div className="mt-6">
        <AlgoInfo
          name={info.name}
          explanation={info.explanation}
          timeComplexity={info.timeComplexity}
          code={info.code}
          accentColor="tree"
        />
      </div>
      <ComplexityPanel category="tree" accentClass="text-tree" />


    </AlgoLayout>
  );
};

export default TreePage;
