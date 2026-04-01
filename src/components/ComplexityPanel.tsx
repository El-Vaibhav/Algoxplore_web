import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { BarChart3, TrendingUp, ChevronDown, ChevronUp, Info } from "lucide-react";
import {
  complexityData,
  generateGrowthData,
  categoryChartColors,
  type ComplexityEntry,
} from "@/lib/complexityData";

interface ComplexityPanelProps {
  category: string;
  accentClass?: string;
}

const ComplexityPanel = ({ category, accentClass = "text-primary" }: ComplexityPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const [caseType, setCaseType] = useState<"best" | "average" | "worst">("worst");
  const entries = complexityData[category] ?? [];
  const colors = categoryChartColors[category] ?? [];
  const growthData = generateGrowthData(entries, caseType);

  if (entries.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-4 h-4 ${accentClass}`} />
          <span className="text-sm font-semibold text-foreground">Complexity Analysis</span>
          <span className="text-xs text-muted-foreground ml-1">— Compare growth rates of all algorithms</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              {/* Case selector */}
              <div className="flex items-center gap-2">
                <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Case:</span>
                {(["best", "average", "worst"] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCaseType(c)}
                    className={`px-3 py-1 text-xs rounded-full transition-colors capitalize ${
                      caseType === c
                        ? `bg-secondary ${accentClass} font-medium`
                        : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Growth Rate Chart */}
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Growth Rate Comparison ({caseType} case)
                </h4>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={growthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="n"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Input size (n)", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Operations", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    {entries.map((entry, i) => (
                      <Line
                        key={entry.name}
                        type="monotone"
                        dataKey={entry.name}
                        stroke={colors[i % colors.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Complexity Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-secondary/50">
                        <th className="text-left px-3 py-2.5 font-semibold text-foreground">Algorithm</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-foreground">Best</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-foreground">Average</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-foreground">Worst</th>
                        <th className="text-center px-3 py-2.5 font-semibold text-foreground">Space</th>
                        {entries.some((e) => e.stable !== undefined) && (
                          <th className="text-center px-3 py-2.5 font-semibold text-foreground">Stable</th>
                        )}
                        <th className="text-left px-3 py-2.5 font-semibold text-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, i) => (
                        <motion.tr
                          key={entry.name}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-t border-border hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-3 py-2.5 font-medium text-foreground flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: colors[i % colors.length] }}
                            />
                            {entry.name}
                          </td>
                          <td className={`text-center px-3 py-2.5 font-mono ${caseType === "best" ? accentClass + " font-semibold" : "text-muted-foreground"}`}>
                            {entry.time.best}
                          </td>
                          <td className={`text-center px-3 py-2.5 font-mono ${caseType === "average" ? accentClass + " font-semibold" : "text-muted-foreground"}`}>
                            {entry.time.average}
                          </td>
                          <td className={`text-center px-3 py-2.5 font-mono ${caseType === "worst" ? accentClass + " font-semibold" : "text-muted-foreground"}`}>
                            {entry.time.worst}
                          </td>
                          <td className="text-center px-3 py-2.5 font-mono text-muted-foreground">
                            {entry.space}
                          </td>
                          {entries.some((e) => e.stable !== undefined) && (
                            <td className="text-center px-3 py-2.5">
                              {entry.stable !== undefined ? (
                                <span className={entry.stable ? "text-green-500" : "text-red-400"}>
                                  {entry.stable ? "✓" : "✗"}
                                </span>
                              ) : "—"}
                            </td>
                          )}
                          <td className="px-3 py-2.5 text-muted-foreground max-w-[200px] truncate">
                            {entry.notes ?? "—"}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-start gap-2 text-[10px] text-muted-foreground bg-secondary/20 rounded-lg p-3">
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Growth curves are theoretical — actual performance depends on constants, hardware, and input distribution.
                  Toggle between best/average/worst cases to see how algorithms compare under different scenarios.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComplexityPanel;
