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
    <div className="flex flex-col items-center gap-4">

      {/* BOARD */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
      >
        {board.map((row: number[], i: number) =>
          row.map((cell: number, j: number) => {
            let bg = "bg-secondary";

            if (cell) bg = "bg-green-500 text-white";
            if (isHighlighted(i, j)) bg = "bg-yellow-400 text-black";
            if (isConflict(i, j)) bg = "bg-red-500 text-white";

            return (
              <motion.div
                key={`${i}-${j}`}
                className={`w-12 h-12 flex items-center justify-center rounded-md border ${bg}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {cell ? "♛" : ""}
              </motion.div>
            );
          })
        )}
      </div>

      {/* MESSAGE */}
      {stepData?.message && (
        <div className="text-sm text-muted-foreground text-center">
          {stepData.message}
        </div>
      )}
    </div>
  );
};

export default NQueenViz;