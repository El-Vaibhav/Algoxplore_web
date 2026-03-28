interface Props {
  maze: number[][];
  setMaze: (m: number[][]) => void;
  disabled: boolean;
}

const MazeInput = ({ maze, setMaze, disabled }: Props) => {

  // 🔥 This runs when user clicks a cell
  const toggleCell = (i: number, j: number) => {

    if (disabled) return; // don't allow during animation

    // create copy (IMPORTANT - React state rule)
    const newMaze = maze.map(row => [...row]);

    // 🚫 prevent breaking start/end
    if ((i === 0 && j === 0) ||
        (i === maze.length - 1 && j === maze.length - 1)) {
      return;
    }

    // 🔁 toggle wall
    newMaze[i][j] = newMaze[i][j] === 1 ? 0 : 1;

    setMaze(newMaze);
  };

  return (
    <div className="space-y-2">

      {/* Label */}
      <span className="text-xs text-muted-foreground">
        Click cells to toggle walls
      </span>

      {/* GRID */}
      <div className="grid gap-1">

        {maze.map((row, i) => (
          <div key={i} className="flex gap-1">

            {row.map((cell, j) => (

              <div
                key={j}
                onClick={() => toggleCell(i, j)}
                className={`
                  w-8 h-8 rounded cursor-pointer

                  ${cell === 0 ? "bg-red-500" : "bg-gray-700"}

                  ${i === 0 && j === 0 ? "border-2 border-yellow-400" : ""}
                  ${i === maze.length - 1 && j === maze.length - 1 ? "border-2 border-green-400" : ""}
                `}
              />

            ))}

          </div>
        ))}

      </div>
    </div>
  );
};

export default MazeInput;