import { motion, AnimatePresence } from "framer-motion";
import { FractionalStep } from "@/lib/dpAlgorithms";

interface Props {
  stepData: FractionalStep | null;
}

const FractionalKnapsackViz = ({ stepData }: Props) => {
  if (!stepData) {
  stepData = {
    items: [],
    sortedIndices: [],
    fractionsTaken: [],
    remainingCapacity: 0,
    totalValue: 0,
    currentIndex: -1,
    message: "",
    done: false,
  };
}

  const sorted = stepData.sortedIndices.map(i => ({ ...stepData.items[i], origIdx: i }));

  return (
    <div className="relative z-10 space-y-6">
      {/* Sorted items by ratio */}
      <div>
        <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wider font-semibold">Sorted by Value/Weight Ratio</div>
        <div className="flex gap-3 flex-wrap">
          {sorted.map((item) => {
            const frac = stepData.fractionsTaken[item.origIdx];
            const isCurrent = stepData.currentIndex === item.origIdx;
            return (
              <motion.div
                key={item.origIdx}
                className={`relative rounded-xl border overflow-hidden w-20 ${
                  isCurrent ? "border-dp shadow-lg shadow-dp/20" : frac > 0 ? "border-dp/40" : "border-border"
                }`}
                animate={{ scale: isCurrent ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Fill bar */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-dp/20"
                  animate={{ height: `${frac * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
                <div className="relative z-10 p-2.5 text-center">
                  <div className="text-sm font-bold text-foreground">{item.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">w:{item.weight} v:{item.value}</div>
                  <div className="text-[10px] font-mono text-dp font-semibold">r:{item.ratio}</div>
                  {frac > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1 text-[10px] font-mono text-dp font-bold"
                    >
                      {frac === 1 ? "100%" : `${(frac * 100).toFixed(1)}%`}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Knapsack gauge */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Capacity Used</span>
            <span className="font-mono text-dp">{stepData.totalValue} value</span>
          </div>
          <div className="h-4 bg-secondary rounded-full overflow-hidden border border-border">
            <motion.div
              className="h-full bg-gradient-to-r from-dp/60 to-dp rounded-full"
              animate={{ width: `${((stepData.items.reduce((s, it) => s + it.weight, 0) - stepData.remainingCapacity - stepData.items.reduce((s, it) => s + it.weight, 0) + stepData.remainingCapacity) / (stepData.items.reduce((s, it) => s + it.weight, 0))) * 100}%` }}
              style={{ width: `${(1 - stepData.remainingCapacity / (stepData.remainingCapacity + stepData.items.reduce((sum, it, i) => sum + it.weight * stepData.fractionsTaken[i], 0))) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
            <span>Remaining: {stepData.remainingCapacity}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="bg-card/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 text-sm text-foreground">
          {stepData.message}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FractionalKnapsackViz;
