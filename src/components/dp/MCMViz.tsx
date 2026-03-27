import { motion, AnimatePresence } from "framer-motion";
import { MCMStep } from "@/lib/dpAlgorithms";

interface Props {
  stepData: MCMStep | null;
}

const MCMViz = ({ stepData }: Props) => {
 

  const n = stepData.table.length;

  return (
    <div className="relative z-10 space-y-5">
      {/* Matrix dimensions */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Matrices</div>
        <div className="flex gap-2 flex-wrap">
          {stepData.dimensions.slice(0, -1).map((d, i) => (
            <motion.div
              key={i}
              className={`px-3 py-2 rounded-lg border text-xs font-mono ${
                stepData.currentRow <= i && i <= stepData.currentCol
                  ? "bg-dp/15 border-dp/40 text-dp"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
              animate={{
                scale: stepData.currentRow <= i && i <= stepData.currentCol ? 1.05 : 1,
              }}
            >
              <div className="font-semibold text-foreground text-center">M{i + 1}</div>
              <div>{d}×{stepData.dimensions[i + 1]}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cost table (upper triangular) */}
      <div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Cost Table</div>
        <div className="overflow-x-auto">
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[48px]"></th>
                {Array.from({ length: n }, (_, j) => (
                  <th key={j} className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[48px]">
                    M{j + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stepData.table.map((row, i) => (
                <tr key={i}>
                  <td className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 text-center">
                    M{i + 1}
                  </td>
                  {row.map((val, j) => {
                    if (j < i) {
                      return <td key={j} className="p-1.5 border border-border bg-secondary/10 min-w-[48px]" />;
                    }
                    const isCurrent = stepData.currentRow === i && stepData.currentCol === j;
                    const isChain = stepData.currentRow <= i && j <= stepData.currentCol && !isCurrent;
                    const isFilled = val > 0 || i === j;
                    return (
                      <td key={j} className={`p-1.5 text-center text-xs font-mono border border-border min-w-[48px] transition-colors duration-200 ${
                        isCurrent ? "bg-dp text-background font-bold"
                          : isChain ? "bg-dp/10 text-dp"
                          : i === j ? "bg-secondary/30 text-muted-foreground"
                          : isFilled && val < Infinity && val > 0 ? "bg-secondary/50 text-foreground"
                          : "text-muted-foreground/30"
                      }`}>
                        {i === j ? 0 : val === 0 ? "–" : val === Infinity ? "∞" : val.toLocaleString()}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chain length indicator */}
      {stepData.chainLength > 0 && !stepData.done && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Chain length:</span>
          <div className="flex gap-1">
            {Array.from({ length: n }, (_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < stepData.chainLength ? "bg-dp" : "bg-secondary"}`} />
            ))}
          </div>
        </div>
      )}

      {stepData.done && stepData.optimalOrder && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-dp/10 border border-dp/30 rounded-lg px-4 py-3">
          <div className="text-xs text-muted-foreground mb-1">Optimal Parenthesization</div>
          <div className="font-mono text-sm text-dp font-semibold break-all">{stepData.optimalOrder}</div>
          <div className="text-xs text-muted-foreground mt-1">Min multiplications: <span className="text-dp font-bold">{stepData.table[0][n - 1].toLocaleString()}</span></div>
        </motion.div>
      )}

      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 text-sm text-foreground">
          {stepData.message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default MCMViz;
