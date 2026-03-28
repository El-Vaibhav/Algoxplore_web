import { motion } from "framer-motion";

interface Props {
  board: number[][];
  setBoard: (b: number[][]) => void;
  disabled: boolean;
}

const SudokuInput = ({ board, setBoard, disabled }: Props) => {
  const n = board.length;

  const handleClick = (r: number, c: number) => {
    if (disabled) return;

    const newBoard = board.map(row => [...row]);

    // cycle values: 0 → 1 → 2 → ... → n → 0
    newBoard[r][c] = (newBoard[r][c] + 1) % (n + 1);

    setBoard(newBoard);
  };

  return (
    <div className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${n}, 1fr)`
      }}
    >
      {board.map((row, i) =>
        row.map((cell, j) => (
          <motion.div
            key={`${i}-${j}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i, j)}
            className={`
              w-10 h-10 flex items-center justify-center
              rounded-lg text-sm font-mono cursor-pointer
              border border-border
              ${cell === 0
                ? "bg-secondary/40 text-muted-foreground"
                : "bg-dp/20 text-dp font-bold"}
              ${disabled && "opacity-50 cursor-not-allowed"}
            `}
          >
            {cell !== 0 ? cell : ""}
          </motion.div>
        ))
      )}
    </div>
  );
};

export default SudokuInput;