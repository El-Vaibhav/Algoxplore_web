import { motion } from "framer-motion";

interface Props {
  stepData: any;
  size: number;
}

const NQueenViz = ({ stepData, size }: Props) => {
  const board =
    stepData?.board || Array.from({ length: size }, () => Array(size).fill(0));

  const highlight = stepData?.highlight || [];
  const conflict = stepData?.conflict || [];

  const isHighlighted = (r: number, c: number) =>
    highlight.some(([x, y]: number[]) => x === r && y === c);

  const isConflict = (r: number, c: number) =>
    conflict.some(([x, y]: number[]) => x === r && y === c);

  return (
    <div className="flex flex-col items-center gap-6 relative">

      {/* BACKGROUND GLOW */}
      <div className="absolute w-72 h-72 bg-purple-500/10 blur-[120px] rounded-full -z-10" />

      {/* BOARD */}
      <div
        className="grid p-3 rounded-2xl backdrop-blur-xl border border-white/10 shadow-xl"
        style={{
          gridTemplateColumns: `repeat(${size}, 1fr)`
        }}
      >
        {board.map((row: number[], i: number) =>
          row.map((cell: number, j: number) => {

            const isDark = (i + j) % 2 === 0;

            let base =
              isDark
                ? "bg-[#1f2937]"   // dark square
                : "bg-[#111827]";  // darker square

            let stateStyle = "";

            if (cell) {
              stateStyle =
                "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30";
            }

            if (isHighlighted(i, j)) {
              stateStyle =
                "bg-yellow-400 text-black shadow-lg shadow-yellow-400/40 animate-pulse";
            }

            if (isConflict(i, j)) {
              stateStyle =
                "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse";
            }

            return (
              <motion.div
                key={`${i}-${j}`}
                className={`
                  w-14 h-14 flex items-center justify-center
                  rounded-lg border border-white/10
                  ${base} ${stateStyle}
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.25 }}
              >
                {/* QUEEN */}
                {cell && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="text-xl drop-shadow-lg"
                  >
                    ♛
                  </motion.span>
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* MESSAGE */}
      {stepData?.message && (
        <motion.div
          key={stepData.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10 backdrop-blur-md"
        >
          {stepData.message}
        </motion.div>
      )}
    </div>
  );
};

export default NQueenViz;