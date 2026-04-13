import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { GraphData, AlgorithmCategory, SchedulingInput, TreeInput } from "../types";

const DEFAULT_GRAPHS: Record<string, string> = {
  unweighted: `{
  "0": [1, 2],
  "1": [3],
  "2": [],
  "3": []
}`,
  weighted: `{
  "0": [[1, 4], [2, 3]],
  "1": [[3, 2]],
  "2": [[3, 5]],
  "3": []
}`,
  dense: `{
  "0": [[1, 4], [2, 3]],
  "1": [[0, 4], [2, 1], [3, 2]],
  "2": [[0, 3], [1, 1], [3, 5]],
  "3": [[1, 2], [2, 5]]
}`,
};

const DEFAULT_ARRAY = "38, 27, 43, 3, 9, 82, 10";

interface GraphInputProps {
  category: AlgorithmCategory;
  algorithm: string;
  onGraphChange: (graph: GraphData, start: number) => void;
  onArrayChange: (arr: number[]) => void;
  onSchedulingChange?: (input: SchedulingInput) => void;
  onTreeChange?: (input: TreeInput) => void;
  onDPChange?: (input: {
    weights: number[];
    values: number[];
    capacity: number;
    s1?: string;
    s2?: string;
  }) => void;
  error: string | null;
}

const GraphInput = ({
  category,
  algorithm,
  onGraphChange,
  onArrayChange,
  onSchedulingChange,
  onTreeChange,
  onDPChange,
  error,
}: GraphInputProps) => {
  const getDefaultGraph = () => {
    if (algorithm === "prims" || algorithm === "dijkstra") return DEFAULT_GRAPHS.weighted;
    if (algorithm === "kruskal") return DEFAULT_GRAPHS.dense;
    return DEFAULT_GRAPHS.unweighted;
  };

  const [raw, setRaw] = useState(getDefaultGraph());
  const [start, setStart] = useState(0);
  useEffect(() => {
    if (category !== "graph") return;

    try {
      const parsed = JSON.parse(raw);
      onGraphChange(parsed, start);
    } catch { }
  }, [raw, start, category]);
  const [arrayRaw, setArrayRaw] = useState(DEFAULT_ARRAY);
  const [parseError, setParseError] = useState<string | null>(null);

  // Scheduling state
  const [arrivalRaw, setArrivalRaw] = useState("0, 1, 2, 3");
  const [burstRaw, setBurstRaw] = useState("5, 3, 8, 2");
  const [priorityRaw, setPriorityRaw] = useState("2, 1, 4, 3");
  const [quantum, setQuantum] = useState(2);

  // Tree state
  const [treeValuesRaw, setTreeValuesRaw] = useState("50, 30, 70, 20, 40, 60, 80");
  const [searchVal, setSearchVal] = useState(40);
  const [deleteVal, setDeleteVal] = useState(30);

  // Dp state
  const [weightsRaw, setWeightsRaw] = useState("1, 3, 4");
  const [valuesRaw, setValuesRaw] = useState("15, 20, 30");
  const [capacity, setCapacity] = useState(4);
  const [s1, setS1] = useState("abcde");
  const [s2, setS2] = useState("ace");



  useEffect(() => {
    if (category === "graph") {
      const newGraph = getDefaultGraph();

      // ✅ ONLY reset when switching algorithm type (not every time)
      setRaw(newGraph);
      setStart(0);
      setParseError(null);

      try {
        const parsed = JSON.parse(newGraph);
        onGraphChange(parsed, 0);
      } catch { }
    }
  }, [algorithm, category]);

  // Auto-apply scheduling input on change
  useEffect(() => {
    if (category === "scheduling" && onSchedulingChange) {
      try {
        const arrival = arrivalRaw.split(",").map((s) => Number(s.trim()));
        const burst = burstRaw.split(",").map((s) => Number(s.trim()));
        const priority = priorityRaw.split(",").map((s) => Number(s.trim()));
        if (arrival.some(isNaN) || burst.some(isNaN)) return;
        onSchedulingChange({ arrival, burst, priority, quantum });
      } catch { }
    }
  }, [category, arrivalRaw, burstRaw, priorityRaw, quantum, algorithm]);

  // Auto-apply tree input on change
  useEffect(() => {
    if (category === "tree" && onTreeChange) {
      try {
        const values = treeValuesRaw.split(",").map((s) => Number(s.trim()));
        if (values.some(isNaN)) return;
        const op = algorithm.replace("bst_", "") as TreeInput["operation"];
        onTreeChange({ values, operation: op, searchValue: searchVal, deleteValue: deleteVal });
      } catch { }
    }
  }, [category, treeValuesRaw, searchVal, deleteVal, algorithm]);

  useEffect(() => {
    if (category === "dp" && onDPChange) {
      try {
        const weights = weightsRaw.split(",").map(Number);
        const values = valuesRaw.split(",").map(Number);

        onDPChange({
          weights,
          values,
          capacity,
          s1,
          s2,
        });
      } catch { }
    }
  }, [category, weightsRaw, valuesRaw, capacity, s1, s2]);



  const applyGraph = () => {
    try {
      const parsed = JSON.parse(raw) as GraphData;
      if (typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Must be a JSON object");
      setParseError(null);
      onGraphChange(parsed, start);
    } catch (e: any) {
      setParseError(e.message || "Invalid JSON");
    }
  };

  const applyArray = () => {
    try {
      const arr = arrayRaw.split(",").map((s) => {
        const n = Number(s.trim());
        if (isNaN(n)) throw new Error(`"${s.trim()}" is not a number`);
        return n;
      });
      if (arr.length < 2) throw new Error("Need at least 2 elements");
      setParseError(null);
      onArrayChange(arr);
    } catch (e: any) {
      setParseError(e.message || "Invalid input");
    }
  };

  const loadGraphSample = () => {
    const selected = getDefaultGraph();
    setRaw(selected);
    setStart(0);
    setParseError(null);
    onGraphChange(JSON.parse(selected), 0);
  };

  const loadArraySample = () => {
    setArrayRaw(DEFAULT_ARRAY);
    setParseError(null);
    onArrayChange([38, 27, 43, 3, 9, 82, 10]);
  };

  // ─── SCHEDULING UI ─────────────────────
  if (category === "scheduling") {
    const needsPriority = algorithm === "priority";
    const needsQuantum = algorithm === "roundrobin";

    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-warning">⏱</span> Scheduling Input
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Arrival Times</label>
          <input
            value={arrivalRaw}
            onChange={(e) => setArrivalRaw(e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            placeholder="0, 1, 2, 3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Burst Times</label>
          <input
            value={burstRaw}
            onChange={(e) => setBurstRaw(e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            placeholder="5, 3, 8, 2"
          />
        </div>

        {needsPriority && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Priority (lower = higher)</label>
            <input
              value={priorityRaw}
              onChange={(e) => setPriorityRaw(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
              placeholder="2, 1, 4, 3"
            />
          </div>
        )}

        {needsQuantum && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Time Quantum</label>
            <input
              type="number"
              value={quantum}
              onChange={(e) => setQuantum(Number(e.target.value))}
              className="w-20 h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
              min={1}
            />
          </div>
        )}

        {(parseError || error) && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {parseError || error}
          </p>
        )}
      </div>
    );
  }

  // ─── TREE UI ─────────────────────
  if (category === "tree") {
    const needsSearch = algorithm === "bst_search";
    const needsDelete = algorithm === "bst_delete";

    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-accent">🌳</span> Tree Input
        </h3>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Values to Insert (comma-separated)</label>
          <input
            value={treeValuesRaw}
            onChange={(e) => setTreeValuesRaw(e.target.value)}
            className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            placeholder="50, 30, 70, 20, 40, 60, 80"
          />
        </div>

        {needsSearch && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Search Value</label>
            <input
              type="number"
              value={searchVal}
              onChange={(e) => setSearchVal(Number(e.target.value))}
              className="w-20 h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            />
          </div>
        )}

        {needsDelete && (
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Delete Value</label>
            <input
              type="number"
              value={deleteVal}
              onChange={(e) => setDeleteVal(Number(e.target.value))}
              className="w-20 h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            />
          </div>
        )}

        {(parseError || error) && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {parseError || error}
          </p>
        )}
      </div>
    );
  }

  // ─── SORTING UI ─────────────────────
  if (category === "sorting") {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="text-sorting">▤</span> Array Input
        </h3>

        <Textarea
          value={arrayRaw}
          onChange={(e) => {
            const value = e.target.value;
            setArrayRaw(value);
            try {
              const arr = value.split(",").map((s) => {
                const n = Number(s.trim());
                if (isNaN(n)) throw new Error();
                return n;
              });
              if (arr.length >= 2) {
                onArrayChange(arr);
                setParseError(null);
              }
            } catch { }
          }}
          className="min-h-[80px] font-mono text-xs bg-muted/50 border-border resize-none"
        />

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={applyArray} className="text-xs ml-auto">
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={loadArraySample} className="text-xs">
            Sample
          </Button>
        </div>

        {(parseError || error) && (
          <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
            {parseError || error}
          </p>
        )}
      </div>
    );
  }

  // ─── DP UI ─────────────────────
  if (category === "dp") {
    if (algorithm == "mcm") {
      return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-accent"></span> MCM Input
      </h3>

      <div className="space-y-2">
        <label className="text-xs text-muted-foreground">
          Dimensions Array
        </label>
        <input
          value={weightsRaw}
          onChange={(e) => setWeightsRaw(e.target.value)}
          placeholder="10, 20, 30, 40"
          className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 text-sm font-mono"
        />
      </div>
    </div>
  );
    }
    if (algorithm === "lcs") {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-accent">🧠</span> LCS Input
          </h3>

          {/* String 1 */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              String 1
            </label>
            <input
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              placeholder="abcde"
              className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* String 2 */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              String 2
            </label>
            <input
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              placeholder="ace"
              className="w-full h-10 rounded-md border border-input bg-muted/50 px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        </div>
      );
    }
    if (algorithm === "knapsack") {
      return (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="text-accent"></span> DP Input (Knapsack)
          </h3>

          {/* Weights */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Weights (comma-separated)
            </label>
            <input
              value={weightsRaw}
              onChange={(e) => setWeightsRaw(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
              placeholder="1, 3, 4"
            />
          </div>

          {/* Values */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Values (comma-separated)
            </label>
            <input
              value={valuesRaw}
              onChange={(e) => setValuesRaw(e.target.value)}
              className="w-full h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
              placeholder="15, 20, 30"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">
              Capacity
            </label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-24 h-8 rounded-md border border-input bg-muted/50 px-2 text-xs font-mono"
            />
          </div>

        </div>
      );
    }
  }

  // ─── GRAPH UI ─────────────────────
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-accent">⬡</span> Graph Input
      </h3>

      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        className="min-h-[140px] font-mono text-xs bg-muted/50 border-border resize-none"
        spellCheck={false}
      />

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Start Node:</label>
        <input
          type="number"
          value={start}
          onChange={(e) => setStart(Number(e.target.value))}
          className="w-16 h-8 rounded-md border border-input bg-muted/50 px-2 text-xs"
        />
        <Button size="sm" variant="outline" onClick={applyGraph} className="text-xs ml-auto">
          Apply
        </Button>
        <Button size="sm" variant="ghost" onClick={loadGraphSample} className="text-xs">
          Sample
        </Button>
      </div>

      {(parseError || error) && (
        <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {parseError || error}
        </p>
      )}
    </div>
  );
};

export default GraphInput;
