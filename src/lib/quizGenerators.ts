/**
 * Quiz Generators (FULL SAFE VERSION)
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/* ───────── HELPERS ───────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function placeCorrect(correct: string, distractors: string[]) {
  // ✅ remove duplicates first
  let unique = Array.from(new Set([correct, ...distractors]));

  // ✅ add ONLY ONE "None of the above"
  if (unique.length < 4 && !unique.includes("None of the above")) {
    unique.push("None of the above");
  }

  // ❌ DO NOT keep adding duplicates
  // just slice to max 4
  unique = unique.slice(0, 4);

  const shuffled = shuffle(unique);

  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(correct),
  };
}


/* ───────── GRAPH ───────── */
import type { GraphStep } from "./graphAlgorithms";

export function graphQuiz(stepIdx: number, steps: GraphStep[]): QuizQuestion | null {
  if (!steps || stepIdx < 0 || stepIdx + 1 >= steps.length) return null;

  const current = steps[stepIdx];
  const next = steps[stepIdx + 1];

  if (!next) return null;

  // ✅ allow final steps without currentNode (Toposort final)
  if (next.currentNode === null || next.currentNode === undefined) {
    if (next.description?.toLowerCase().includes("topological order")) {
      return {
        question: "What is the final topological order?",
        options: [next.description],
        correctIndex: 0,
        explanation: next.description,
      };
    }
    return null;
  }

  const correctNode = next.currentNode;

  // ❗ 1. skip same node transitions
  if (current.currentNode === next.currentNode) return null;

  // ❗ 2. skip duplicate DFS internal steps BUT allow Kosaraju component steps
  if (
    current.visitedNodes &&
    next.visitedNodes &&
    next.visitedNodes.length === current.visitedNodes.length &&
    !next.description?.toLowerCase().includes("component")
  ) {
    return null;
  }

  // ❗ 3. prevent asking same node again (DFS fix)
  if (stepIdx > 0 && steps[stepIdx].currentNode === correctNode) {
    return null;
  }

  // ❗ 4. extra safety (rare duplicate transitions)
  if (stepIdx > 1 && steps[stepIdx - 1]?.currentNode === correctNode) {
    return null;
  }

  const correct = `Node ${correctNode}`;

  // ✅ SAFE NODE EXTRACTION
  let allNodes: number[] = [];

  if ((current as any).nodes) {
    allNodes = (current as any).nodes.map((n: any) => n.id);
  } else {
    const set = new Set<number>();
    current.visitedNodes?.forEach(n => set.add(n));
    if (current.currentNode !== null) set.add(current.currentNode);
    set.add(correctNode);
    allNodes = Array.from(set);
  }

  if (allNodes.length === 0) return null;

  const distractors = shuffle(
    allNodes.filter(n => n !== correctNode)
  )
    .slice(0, 3)
    .map(n => `Node ${n}`);

  const { options, correctIndex } = placeCorrect(correct, distractors);

  // ✅ smarter question for Kosaraju
  let question = "Which node will be processed next?";
  if (next.description?.toLowerCase().includes("component")) {
    question = "Which node is added to the current component?";
  } else {
    const questions = [
      "Which node will be processed next?",
      "Which node is selected next from the frontier?",
      "Which node will be explored next?"
    ];
    question = questions[Math.floor(Math.random() * questions.length)];
  }

  return {
    question,
    options,
    correctIndex,
    explanation: next.description || "",
  };
}

/* ───────── TREE (BST, AVL, Traversals, Heap) ───────── */
import type { AnimationStep } from "./treeAlgorithms";

export function treeQuiz(stepIdx: number, steps: AnimationStep[]): QuizQuestion | null {

  if (!steps || stepIdx + 1 >= steps.length) return null;

  const current = steps[stepIdx];
  const next = steps[stepIdx + 1];

  if (!next || !next.highlighted || next.highlighted.length === 0) return null;

  const prevNode = current.highlighted?.slice(-1)[0];
  const correctNode = next.highlighted[next.highlighted.length - 1];

  if (prevNode === correctNode) return null;
  const correct = `Node ${correctNode}`;


  // ✅ Collect all nodes safely
  const nodeSet = new Set<number>();
  steps.forEach(s => {
    s.highlighted?.forEach(n => nodeSet.add(n));
  });

  const allNodes = Array.from(nodeSet);

  let distractors = shuffle(allNodes.filter(n => n !== correctNode))
    .slice(0, 3)
    .map(n => `Node ${n}`);

  while (distractors.length < 3) distractors.push("None");

  const { options, correctIndex } = placeCorrect(correct, distractors);

  return {
    question: "Which node will be visited next?",
    options,
    correctIndex,
    explanation: next.message || "",
  };
}

/* ───────── DP (ALL: Knapsack, LCS, Matrix Chain, N-Queens, Sudoku etc.) ───────── */
export function dpQuiz(stepIdx: number, steps: any[], algo?: string): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(steps[stepIdx]) === JSON.stringify(steps[stepIdx - 1])) {
    return null;
  }
  if (!steps || stepIdx + 1 >= steps.length) return null;

  const next = steps[stepIdx + 1];

  if (!next) return null;

  if (!next.message && !next.description) return null;

  const msg = next.message || next.description || "DP state updated";

  let question = "";
  let correct = msg.length > 60
    ? msg.slice(0, 60) + "..."
    : msg;
  let distractors: string[] = [];

  /* ───────── KNAPSACK ───────── */
  if (algo === "knapsack") {
    question = "What happens at this DP cell?";

    if (msg.toLowerCase().includes("include")) {
      correct = "Include item (better value)";
      distractors = [
        "Exclude item",
        "Keep previous value",
        "Reset to 0",
      ];
    } else {
      correct = "Exclude item (better choice)";
      distractors = [
        "Include item",
        "Add both choices",
        "Reset to 0",
      ];
    }
  }

  /* ───────── LCS ───────── */
  else if (algo === "lcs") {
    const isMatch = msg.includes("==") || msg.toLowerCase().includes("match");

    if (isMatch) {
      question = "Characters match. What is the recurrence?";
      correct = "Take diagonal + 1";
      distractors = [
        "Take max of left and up",
        "Reset to 0",
        "Skip both",
      ];
    } else {
      question = "Characters do not match. What happens?";
      correct = "Take max of left and up";
      distractors = [
        "Take diagonal + 1",
        "Reset to 0",
        "Add both",
      ];
    }
  }

  /* ───────── MCM ───────── */
  else if (algo === "mcm") {
    question = "What is being computed for this subchain?";

    distractors = [
      "Maximum multiplication cost",
      "Number of matrices",
      "Diagonal value copy",
    ];
  }

  /* ───────── N-QUEENS ───────── */
  else if (algo === "nqueen") {
    if (msg.toLowerCase().includes("placed")) {
      question = "Why is this queen placement valid?";
      distractors = [
        "Same row allowed",
        "Diagonal conflict allowed",
        "Column conflict ignored",
      ];
    } else {
      question = "Why is this position rejected?";
      distractors = [
        "Row already filled",
        "Random rejection",
        "Out of bounds",
      ];
    }
  }

  /* ───────── RAT MAZE ───────── */
  else if (algo === "ratmaze") {
    question = "Why does the algorithm move to this cell?";
    distractors = [
      "Cell is blocked",
      "Visited already",
      "Random move",
    ];
  }

  /* ───────── SUDOKU ───────── */
  else if (algo === "sudoku") {
    question = "Why is this number placed here?";
    distractors = [
      "Row conflict allowed",
      "Column conflict allowed",
      "Subgrid ignored",
    ];
  }

  /* ───────── DEFAULT ───────── */
  else {
    question = "What happens in the next step?";
    distractors = [
      "Skip this state",
      "Use previous value",
      "Take maximum of neighbors",
    ];
  }

  const { options, correctIndex } = placeCorrect(correct, distractors);

  return {
    question,
    options,
    correctIndex,
    explanation: msg,
  };
}

/* ───────── SEARCH ───────── */
import type { BinarySearchStep } from "./searchAlgorithms";

export function aStarQuiz(stepIdx: number, steps: any[]): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(steps[stepIdx]) === JSON.stringify(steps[stepIdx - 1])) {
    return null;
  }
  if (!steps || stepIdx + 1 >= steps.length) return null;

  const next = steps[stepIdx + 1];

  if (!next || !next.current) return null;

  const correct = `Cell (${next.current.row}, ${next.current.col})`;

  const distractors = shuffle(
    steps
      .map(s => s.current)
      .filter(Boolean)
      .map(c => `Cell (${c.row}, ${c.col})`)
      .filter(c => c !== correct)
  ).slice(0, 3);

  const { options, correctIndex } = placeCorrect(correct, distractors);

  return {
    question: "Which cell will A* expand next?",
    options,
    correctIndex,
    explanation: next.message || "A* expands lowest f(n)",
  };
}

export function aoStarQuiz(stepIdx: number, steps: any[]): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(steps[stepIdx]) === JSON.stringify(steps[stepIdx - 1])) {
    return null;
  }
  if (!steps || stepIdx + 1 >= steps.length) return null;

  const next = steps[stepIdx + 1];

  // ✅ safe check
  if (!next || next.currentNode == null) return null;

  const correct = `Node ${next.currentNode}`;

  // ✅ collect all possible nodes
  const nodeSet = new Set<number>();

  steps.forEach(s => {
    if (s.currentNode != null) nodeSet.add(s.currentNode);
    if (s.nodes) {
      s.nodes.forEach((n: any) => nodeSet.add(n.id));
    }
  });

  const allNodes = Array.from(nodeSet);

  const distractors = shuffle(
    allNodes.filter(n => n !== next.currentNode)
  ).slice(0, 3).map(n => `Node ${n}`);

  const { options, correctIndex } = placeCorrect(correct, distractors);

  return {
    question: "Which node will AO* expand next?",
    options,
    correctIndex,
    explanation: next.message || "AO* selects optimal AND/OR path",
  };
}

export function binarySearchQuiz(stepIdx: number, steps: BinarySearchStep[]): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(steps[stepIdx]) === JSON.stringify(steps[stepIdx - 1])) {
    return null;
  }
  if (!steps || stepIdx + 1 >= steps.length) return null;

  const next = steps[stepIdx + 1];
  if (next.mid === undefined || next.mid < 0) return null;

  const correct = `mid = ${next.mid}`;

  const distractors = shuffle(
    steps[stepIdx].array.map((_, i) => `mid = ${i}`).filter(x => x !== correct)
  ).slice(0, 3);

  const { options, correctIndex } = placeCorrect(correct, distractors);

  return {
    question: Math.random() > 0.5
      ? "What will be the next mid index?"
      : "Which index will be checked next?",
    options,
    correctIndex,
    explanation: next.message || "",
  };
}

/* ───────── SORTING ───────── */
import type { SortStep } from "./sortingAlgorithms";

export function sortingQuiz(stepIdx: number, steps: SortStep[]): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(steps[stepIdx]) === JSON.stringify(steps[stepIdx - 1])) {
    return null;
  }
  if (!steps || stepIdx + 1 >= steps.length) return null;

  const next = steps[stepIdx + 1];

  if (next.swapping?.length > 0) {
    const correct = `Swap ${next.swapping.join(" & ")}`;
    const distractors = ["Compare elements", "No swap", "Shift element"];

    const { options, correctIndex } = placeCorrect(correct, distractors);

    return {
      question: "What is the next operation?",
      options,
      correctIndex,
      explanation: "Elements will be swapped",
    };
  }

  return null;
}

/* ───────── SCHEDULING ───────── */
import type { ScheduleBlock } from "./schedulingAlgorithms";

export function schedulingQuiz(stepIdx: number, gantt: ScheduleBlock[]): QuizQuestion | null {
  if (stepIdx > 0 && JSON.stringify(gantt[stepIdx]) === JSON.stringify(gantt[stepIdx - 1])) {
    return null;
  }
  if (!gantt || stepIdx + 1 >= gantt.length) return null;

  const next = gantt[stepIdx + 1];

  const correct = `P${next.processId}`;

  const distractors = shuffle(
    gantt.map(g => `P${g.processId}`).filter(p => p !== correct)
  ).slice(0, 3);

  const { options, correctIndex } = placeCorrect(correct, distractors);

  const questions = [
    "Which process runs next?",
    "Which process gets CPU next?",
    "Who is scheduled next?"
  ];

  return {
    question: questions[Math.floor(Math.random() * questions.length)],
    options,
    correctIndex,
    explanation: `Process ${correct} executes next`,
  };
}