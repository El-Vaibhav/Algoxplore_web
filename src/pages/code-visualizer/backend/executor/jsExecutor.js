// Import the Node.js vm module to run code in a sandboxed environment for security
import vm from "vm";

// Main asynchronous function to execute user-provided code for algorithm visualization
// Parameters: code (string of JS code), algorithm (name of algorithm), input (data for the algorithm)
async function runUserCode(code, algorithm, input) {
    // Array to store each step of the algorithm execution for visualization
    const steps = [];
    // Set to track indices that are sorted in sorting algorithms
    const sortedSet = new Set();

    // Function that acts as a hook for logging visualization steps during code execution
    function logStep(type, value) {
        // Variable to parse the value based on the step type
        let parsedValue;

        // For tree and DP updates, keep the value as is since it's an object
        if (type === "tree_state" || type === "dp_update") {
            parsedValue = value; // 🔥 DO NOT TOUCH OBJECTS
        } else if (type === "result") {
            // For results, keep as is
            parsedValue = value;
        } else {
            // For other types, convert to array if not already, or parse string to numbers
            parsedValue = Array.isArray(value)
                ? value
                : typeof value === "string"
                    ? value.split(",").map(Number)
                    : [value];
        }

        // Description string for the step
        let description = "";

        // ─── GRAPH / GENERAL ─────────────────────
        // Generate descriptions for different step types
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

        // Create the step object with type, current array state, and description
        const step = {
            type,
            array: sandbox.array ? JSON.parse(JSON.stringify(sandbox.array)) : [],
            description,
        };
        // DP-specific properties
        if (type === "dp_update") {
            step.dpTable = value.table;
            step.dpCell = { i: value.i, j: value.j };
            step.dpCompare = value.from || [];
        }

        // Add result if it's a result step
        if (type === "result") {
            step.result = value;
        }

        // Add node for visit steps
        if (type === "visit") {
            step.node = parsedValue[0];
        }

        // Add edge for edge or compare steps
        if (type === "edge" || type === "compare") {
            step.edge = parsedValue;
        }

        // Add comparing or swapping indices
        if (type === "compare") {
            step.comparing = parsedValue;
        } else if (type === "swap") {
            step.swapping = parsedValue;
        } else if (type === "sorted") {
            // Track sorted indices
            sortedSet.add(parsedValue[0]);
            step.sortedIndices = Array.from(sortedSet);
        }

        // Scheduling-specific properties
        if (type === "gantt") {
            step.gantt = value;
        }
        if (type === "schedule_done") {
            step.waitingTime = value.waitingTime;
            step.turnaroundTime = value.turnaroundTime;
            step.gantt = value.gantt;
        }

        // Tree-specific properties
        if (type === "tree_state") {
            if (value.tree !== undefined) {
                step.treeRoot = JSON.parse(JSON.stringify(value.tree));
            }
            step.highlightNode = value.highlightNode ?? null;
            step.highlightPath = value.highlightPath ?? [];
        }

        // Add the step to the steps array
        steps.push(step);
    }

    // SAFE SANDBOX: Create a sandbox object with limited globals and user inputs to prevent malicious code
    const sandbox = {
        logStep, // The logging function
        // Graph inputs
        graph: input?.graph || {},
        start: input?.start ?? 0,
        // Array for sorting
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
        // Safe utility objects
        Infinity: Infinity,
        Math: Math,
        JSON: JSON,
        Array: Array,
        Object: Object,
        Number: Number,
        String: String,
    };

    // Create a VM context with the sandbox
    const context = vm.createContext(sandbox);

    try {
        // Determine the type of algorithm to decide how to call the function
        const isGraphAlgo = ["dfs", "bfs", "prims", "kruskal", "toposort", "dijkstra"].includes(algorithm);
        const isSortingAlgo = ["bubble", "selection", "insertion", "merge", "quick"].includes(algorithm);
        const isSchedulingAlgo = ["fcfs", "sjf", "srtf", "roundrobin", "priority"].includes(algorithm);
        const isTreeAlgo = ["insert", "search", "delete", "inorder", "preorder", "postorder"
        ].includes(algorithm);;
        const isDPAlgo = ["knapsack", "lcs", "mcm"].includes(algorithm);

        // String to build the function invocation
        let invocation = "";
        // Name of the function to call
        let callableName = algorithm;
        // Build invocation based on algorithm type
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
                // inorder / preorder / postorder traversals
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

        // Wrap the user code with checks and invocation
        const wrappedCode = `${code}

if (typeof ${callableName} !== "function") {
  throw new Error("Function '${callableName}' not defined");
}

${invocation}
`;

        // Create and run the script in the sandbox context with a timeout
        const script = new vm.Script(wrappedCode);
        script.runInContext(context, { timeout: 3000 });

        // For sorting algorithms, add a final "sorted" step
        if (isSortingAlgo && sandbox.array && sandbox.array.length > 0) {
            const allSorted = Array.from({ length: sandbox.array.length }, (_, i) => i);
            steps.push({
                type: "sorted",
                array: JSON.parse(JSON.stringify(sandbox.array)),
                sortedIndices: allSorted,
                description: "Array fully sorted",
            });
        }

        // Return the steps for visualization
        return { steps };
    } catch (error) {
        // If error, return empty steps and error message
        return {
            steps: [],
            error: error.message,
        };
    }
}

// Export the main function
export { runUserCode };
