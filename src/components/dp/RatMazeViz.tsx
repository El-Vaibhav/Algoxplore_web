import { motion } from "framer-motion";

const RatMazeViz = ({ stepData }: { stepData: any }) => {
  if (!stepData) return null;

  return (
    <div className="flex flex-col items-center gap-2">

      {/* GRID */}
      <div className="grid gap-2">
        {stepData.grid.map((row: number[], i: number) => (
          <div key={i} className="flex gap-2">
            {row.map((cell: number, j: number) => {

              const isWall = cell === 0;
              const isPath = stepData.path[i][j] === 1;
              const isVisited = stepData.visited[i][j] === 1;
              const isCurrent = stepData.row === i && stepData.col === j;

              return (
                <motion.div
                  key={j}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-mono
                    ${isWall ? "bg-red-500/80" : "bg-gray-800"}
                    ${isVisited ? "bg-blue-500/40" : ""}
                    ${isPath ? "bg-green-500" : ""}
                    ${i === 0 && j === 0 ? "border-2 border-yellow-400" : ""}
                    ${i === row.length - 1 && j === row.length - 1 ? "border-2 border-pink-400" : ""}
                  `}
                  animate={{
                    scale: isCurrent ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >

                  {/* 🐭 RAT */}
                  {isCurrent && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-lg"
                    >
                      🐭
                    </motion.span>
                  )}

                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* MESSAGE */}
      <div className="text-sm text-dp mt-3 font-mono">
        {stepData.message}
      </div>
    </div>
  );
};

export default RatMazeViz;