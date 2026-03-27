interface AlgoInfoProps {
  name: string;
  explanation: string;
  timeComplexity: { best: string; average: string; worst: string };
  code?: string;
  accentColor?: "graph" | "sorting" | "scheduling" | "tree" |"search" |"dp";
}

const accentMap = {
  graph: "text-graph",
  sorting: "text-sorting",
  scheduling: "text-scheduling",
  tree: "text-tree",
  search: "text-search",
  dp: "text-dp",
};

const AlgoInfo = ({ name, explanation, timeComplexity, code, accentColor = "graph" }: AlgoInfoProps) => {
  const textClass = accentMap[accentColor];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{explanation}</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-2">
        <h4 className="text-sm font-semibold text-foreground">Time Complexity</h4>
        <div className="grid grid-cols-3 gap-3">
          {(["best", "average", "worst"] as const).map((k) => (
            <div key={k} className="text-center p-3 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground capitalize">{k}</div>
              <div className={`text-sm font-mono mt-1 ${textClass}`}>{timeComplexity[k]}</div>
            </div>
          ))}
        </div>
      </div>
      {code && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h4 className="text-sm font-semibold text-foreground mb-3">Pseudocode</h4>
          <pre className="text-xs font-mono text-muted-foreground bg-secondary/50 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">{code}</pre>
        </div>
      )}
    </div>
  );
};

export default AlgoInfo;
