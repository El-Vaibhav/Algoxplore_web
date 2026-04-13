import vm from "vm";

async function runUserCode(code, algorithm, input) {
    const steps = [];
    const sortedSet = new Set();

    // Visualization hook
    function logStep(type, value) {
        let parsedValue;

        if (type === "tree_state" || type === "dp_update") {
            parsedValue = value; // 🔥 DO NOT TOUCH OBJECTS
        } else if (type === "result") {
            parsedValue = value;
        } else {
            parsedValue = Array.isArray(value)
                ? value
                : typeof value === "string"
                    ? value.split(",").map(Number)
                    : [value];
        }

        let description = "";

        // ─── GRAPH / GENERAL ─────────────────────
        if (type === "visit") {
            description = `visit ${parsedValue[0]}`;
        }
        else if (type === "edge") {
            description = `edge ${parsedValue}`;
        }
        else if (type === "compare") {
            description = `compare ${parsedValue}`;
        }
        else if (type === "swap") {
            description = `swap ${parsedValue}`;
        }
        else if (type === "result") {
            description = value;
        }

        // ─── SCHEDULING (🔥 CLEAN) ─────────────────────
        else if (type === "gantt") {
            const last = value[value.length - 1];
            description = `P${last.processId} scheduled`;
        }
        else if (type === "schedule_done") {
            description = `Scheduling completed`;
        }

        // ─── TREE (🔥 CLEAN) ─────────────────────
        else if (type === "tree_state") {
            if (value.highlightNode !== null) {
                description = `visiting node ${value.highlightNode}`;
            } else {
                description = `tree updated`;
            }
        }
        // ─── DP (🔥 NEW) ─────────────────────
        else if (type === "dp_update") {
            description = `dp[${value.i}][${value.j}] = ${value.value}`;
        }

        // fallback
        else {
            description = type;
        }

        const step = {
            type,
            array: sandbox.array ? JSON.parse(JSON.stringify(sandbox.array)) : [],
            description,
        };
        // DP-specific
        if (type === "dp_update") {
            step.dpTable = value.table;
            step.dpCell = { i: value.i, j: value.j };
            step.dpCompare = value.from || [];
        }

        if (type === "result") {
            step.result = value;
        }

        if (type === "visit") {
            step.node = parsedValue[0];
        }

        if (type === "edge" || type === "compare") {
            step.edge = parsedValue;
        }

        if (type === "compare") {
            step.comparing = parsedValue;
        } else if (type === "swap") {
            step.swapping = parsedValue;
        } else if (type === "sorted") {
            sortedSet.add(parsedValue[0]);
            step.sortedIndices = Array.from(sortedSet);
        }

        // Scheduling-specific
        if (type === "gantt") {
            step.gantt = value;
        }
        if (type === "schedule_done") {
            step.waitingTime = value.waitingTime;
            step.turnaroundTime = value.turnaroundTime;
            step.gantt = value.gantt;
        }

        // Tree-specific
        if (type === "tree_state") {
            if (value.tree !== undefined) {
                step.treeRoot = JSON.parse(JSON.stringify(value.tree));
            }
            step.highlightNode = value.highlightNode ?? null;
            step.highlightPath = value.highlightPath ?? [];
        }

        steps.push(step);
    }

    // SAFE SANDBOX
    const sandbox = {
        logStep,
        graph: input?.graph || {},
        start: input?.start ?? 0,
        array: Array.isArray(input?.array) ? [...input.array] : [],
        // Scheduling inputs
        arrival: input?.scheduling?.arrival || [],
        burst: input?.scheduling?.burst || [],
        priority: input?.scheduling?.priority || [],
        quantum: input?.scheduling?.quantum || 2,
        // Tree inputs
        treeValues: input?.tree?.values || [],
        searchValue: input?.tree?.searchValue ?? null,
        deleteValue: input?.tree?.deleteValue ?? null,
        treeOperation: input?.tree?.operation || "insert",
        // DP inputs
        weights: input?.dp?.weights || [],
        dpValues: input?.dp?.values || [],
        capacity: input?.dp?.capacity || 0,
        s1: input?.dp?.s1 || "",
        s2: input?.dp?.s2 || "",
        // Utilities
        Infinity: Infinity,
        Math: Math,
        JSON: JSON,
        Array: Array,
        Object: Object,
        Number: Number,
        String: String,
    };

    const context = vm.createContext(sandbox);

    try {
        // Determine how to call the function
        const isGraphAlgo = ["dfs", "bfs", "prims", "kruskal", "toposort", "dijkstra"].includes(algorithm);
        const isSortingAlgo = ["bubble", "selection", "insertion", "merge", "quick"].includes(algorithm);
        const isSchedulingAlgo = ["fcfs", "sjf", "srtf", "roundrobin", "priority"].includes(algorithm);
        const isTreeAlgo = ["insert", "search", "delete", "inorder", "preorder", "postorder"
        ].includes(algorithm);;
        const isDPAlgo = ["knapsack", "lcs", "mcm"].includes(algorithm);

        let invocation = "";
        let callableName = algorithm;
        if (isGraphAlgo) {
            invocation = `${algorithm}(graph, start);`;
        } else if (isSortingAlgo) {
            invocation = `const safeArray = Array.isArray(array) ? array : [];\n${algorithm}(safeArray);`;
        } else if (isSchedulingAlgo) {
            if (algorithm === "roundrobin") {
                invocation = `${algorithm}(arrival, burst, quantum);`;
            } else if (algorithm === "priority") {
                invocation = `${algorithm}(arrival, burst, priority);`;
            } else {
                invocation = `${algorithm}(arrival, burst);`;
            }
        } else if (isTreeAlgo) {
            if (algorithm === "insert") {
                invocation = `insert(treeValues);`;
            }
            else if (algorithm === "search") {
                invocation = `search(treeValues, searchValue);`;
            }
            else if (algorithm === "delete") {
                callableName = "deleteNode";
                invocation = `deleteNode(treeValues, deleteValue);`;
            }
            else {
                // inorder / preorder / postorder
                invocation = `${algorithm}(treeValues);`;
            }
        }
        else if (isDPAlgo) {
            if (algorithm === "lcs") {
                invocation = `lcs(s1, s2);`;
            }
            else if (algorithm === "mcm") {
                invocation = `mcm(weights);`;
            }
            else {
                invocation = `${algorithm}(weights, dpValues, capacity);`;
            }
        }

const wrappedCode = `${code}

if (typeof ${callableName} !== "function") {
  throw new Error("Function '${callableName}' not defined");
}

${invocation}
`;

        const script = new vm.Script(wrappedCode);
        script.runInContext(context, { timeout: 3000 });

        // Final "sorted" step for sorting algorithms
        if (isSortingAlgo && sandbox.array && sandbox.array.length > 0) {
            const allSorted = Array.from({ length: sandbox.array.length }, (_, i) => i);
            steps.push({
                type: "sorted",
                array: JSON.parse(JSON.stringify(sandbox.array)),
                sortedIndices: allSorted,
                description: "Array fully sorted",
            });
        }

        return { steps };
    } catch (error) {
        return {
            steps: [],
            error: error.message,
        };
    }
}

export { runUserCode };
