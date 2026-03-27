import { motion, AnimatePresence } from "framer-motion";
import { LCSStep } from "@/lib/dpAlgorithms";

interface Props {
  stepData: LCSStep | null;
}

const LCSViz = ({ stepData }: Props) => {


  const isOnPath = (r: number, c: number) => stepData.lcsPath.some(([pr, pc]) => pr === r && pc === c);

  return (
    <div className="relative z-10 space-y-4">
      {/* String display */}
      <div className="flex gap-6 flex-wrap">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">String 1: </span>
          <span className="font-mono text-sm">
            {stepData.str1.split("").map((ch, i) => {
              const inLCS = stepData.lcs.includes(ch) && stepData.done;
              return (
                <span key={i} className={`inline-block px-1 mx-0.5 rounded ${inLCS ? "bg-dp/20 text-dp font-bold" : "text-foreground"}`}>
                  {ch}
                </span>
              );
            })}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">String 2: </span>
          <span className="font-mono text-sm">
            {stepData.str2.split("").map((ch, i) => {
              const inLCS = stepData.lcs.includes(ch) && stepData.done;
              return (
                <span key={i} className={`inline-block px-1 mx-0.5 rounded ${inLCS ? "bg-dp/20 text-dp font-bold" : "text-foreground"}`}>
                  {ch}
                </span>
              );
            })}
          </span>
        </div>
      </div>

      {/* DP Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[30px]"></th>
              <th className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[30px]">∅</th>
              {stepData.str2.split("").map((ch, j) => (
                <th key={j} className={`p-1.5 text-[10px] font-mono border border-border min-w-[30px] ${stepData.currentCol === j + 1 ? "bg-dp/20 text-dp font-bold" : "bg-secondary/30 text-muted-foreground"}`}>
                  {ch}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stepData.table.map((row, i) => (
              <tr key={i}>
                <td className={`p-1.5 text-[10px] font-mono border border-border min-w-[30px] text-center ${stepData.currentRow === i ? "bg-dp/20 text-dp font-bold" : "bg-secondary/30 text-muted-foreground"}`}>
                  {i === 0 ? "∅" : stepData.str1[i - 1]}
                </td>
                {row.map((val, j) => {
                  const isCurrent = stepData.currentRow === i && stepData.currentCol === j;
                  const onPath = isOnPath(i, j);
                  const isFilled = val > 0;
                  return (
                    <td key={j} className={`p-1.5 text-center text-xs font-mono border border-border min-w-[30px] transition-colors duration-200 ${
                      isCurrent ? "bg-dp text-background font-bold"
                        : onPath ? "bg-dp/30 text-dp font-bold ring-1 ring-dp/50"
                        : stepData.currentRow === i && isFilled ? "bg-dp/10 text-dp"
                        : isFilled ? "bg-secondary/50 text-foreground"
                        : "text-muted-foreground/40"
                    }`}>
                      {val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {stepData.done && stepData.lcs && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 bg-dp/10 border border-dp/30 rounded-lg px-4 py-2">
          <span className="text-xs text-muted-foreground">LCS:</span>
          <span className="font-mono text-lg font-bold text-dp tracking-widest">{stepData.lcs}</span>
          <span className="text-xs text-muted-foreground">(length {stepData.lcs.length})</span>
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

export default LCSViz;
