import { motion, AnimatePresence } from "framer-motion";
import { KnapsackStep, KnapsackItem } from "@/lib/dpAlgorithms";

interface Props {
  stepData: KnapsackStep | null;
  items: KnapsackItem[];
  capacity: number;
}

const KnapsackViz = ({ stepData, items, capacity }: Props) => {
  if (!stepData) return null;

  return (
    <div className="relative z-10">
      <div className="flex gap-3 mb-6 flex-wrap">
        {items.map((item, i) => (
          <motion.div
            key={i}
            className={`px-3 py-2 rounded-lg border text-xs font-mono ${
              stepData.selectedItems.includes(i)
                ? "bg-dp/20 border-dp/50 text-dp"
                : stepData.currentRow === i + 1
                ? "bg-warning/15 border-warning/40 text-warning"
                : "bg-secondary/50 border-border text-muted-foreground"
            }`}
            animate={{ scale: stepData.selectedItems.includes(i) ? 1.1 : 1 }}
          >
            <div className="font-semibold text-foreground">{item.name}</div>
            <div>w:{item.weight} v:{item.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[32px]">w→</th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th key={w} className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 min-w-[32px]">{w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stepData.table.map((row, i) => (
              <tr key={i}>
                <td className="p-1.5 text-[10px] text-muted-foreground font-mono border border-border bg-secondary/30 text-center">
                  {i === 0 ? "∅" : items[i - 1].name}
                </td>
                {row.map((val, w) => {
                  const isCurrent = stepData.currentRow === i && stepData.currentCol === w;
                  const isHighlightRow = stepData.currentRow === i;
                  const isFilled = val > 0;
                  return (
                    <td key={w} className={`p-1.5 text-center text-xs font-mono border border-border min-w-[32px] transition-colors duration-200 ${
                      isCurrent ? "bg-dp text-background font-bold"
                        : isHighlightRow && isFilled ? "bg-dp/15 text-dp"
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

      <AnimatePresence>
        {stepData && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-4 bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 text-sm text-foreground">
            {stepData.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnapsackViz;
