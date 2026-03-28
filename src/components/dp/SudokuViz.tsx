import { motion } from "framer-motion";

const SudokuViz = ({ stepData }: any) => {
  if (!stepData) return null;

  const { board, highlight, conflict, message, row } = stepData;

  const n = board.length;
  const boxSize = Math.floor(Math.sqrt(n));

  return (
    <div className="flex flex-col items-center gap-6 relative">

      {/* 🔥 BACKGROUND GLOW */}
      <div className="absolute w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full"></div>

      {/* 🧊 GLASS GRID */}
      <div
        className="
          grid 
          p-3 
          rounded-2xl 
          bg-white/5 
          backdrop-blur-xl 
          shadow-2xl 
          border border-white/10
          relative
        "
        style={{
          gridTemplateColumns: `repeat(${n}, 1fr)`,
        }}
      >
        {board.map((rowArr: number[], i: number) =>
          rowArr.map((cell: number, j: number) => {

            // ✅ ACTIVE STATE (prevents random highlight bug)
            const isActive = row !== -1;

            const isHighlight =
              isActive &&
              (highlight?.some(([r, c]: any) => r === i && c === j) ?? false);

            const isConflict =
              isActive &&
              (conflict?.some(([r, c]: any) => r === i && c === j) ?? false);

            const isFilled = cell !== 0;

            // 🔲 Subgrid borders (2x2 for 4x4)
            const borderClass = `
              ${i % boxSize === 0 ? "border-t-2 border-white/30" : ""}
              ${j % boxSize === 0 ? "border-l-2 border-white/30" : ""}
              ${(i + 1) % boxSize === 0 ? "border-b-2 border-white/30" : ""}
              ${(j + 1) % boxSize === 0 ? "border-r-2 border-white/30" : ""}
            `;

            return (
              <motion.div
                key={`${i}-${j}`}
                className={`
                  w-16 h-16 flex items-center justify-center
                  text-xl font-bold rounded-xl
                  border border-white/10
                  backdrop-blur-md
                  transition-all duration-300

                  ${borderClass}

                  ${isHighlight ? "bg-blue-500/30 shadow-lg shadow-blue-500/40 scale-110" : ""}
                  ${isConflict ? "bg-red-500/30 shadow-lg shadow-red-500/40 animate-pulse" : ""}
                  ${isFilled ? "text-white" : "text-white/20"}

                  hover:scale-105 hover:bg-white/10
                `}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: isFilled ? [1.2, 1] : 1,
                  opacity: 1,
                }}
                transition={{ duration: 0.25 }}
              >
                {cell !== 0 ? cell : ""}
              </motion.div>
            );
          })
        )}
      </div>

      {/* 💬 MESSAGE */}
      <div className="text-sm text-white/60 font-mono text-center">
        {message}
      </div>

    </div>
  );
};

export default SudokuViz;