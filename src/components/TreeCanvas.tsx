import { TreeNode } from "@/lib/treeAlgorithms";
import { motion } from "framer-motion";

interface TreeCanvasProps {
  tree: TreeNode | null;
  highlighted: number[];
  comparing: number[];
  width?: number;
  height?: number;
}

function getMaxY(node: TreeNode | null): number {
  if (!node) return 0;
  return Math.max(node.y, getMaxY(node.left), getMaxY(node.right));
}

function getEdges(node: TreeNode | null): { x1: number; y1: number; x2: number; y2: number }[] {
  if (!node) return [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  if (node.left) {
    edges.push({ x1: node.x, y1: node.y, x2: node.left.x, y2: node.left.y });
    edges.push(...getEdges(node.left));
  }
  if (node.right) {
    edges.push({ x1: node.x, y1: node.y, x2: node.right.x, y2: node.right.y });
    edges.push(...getEdges(node.right));
  }
  return edges;
}

function getNodes(node: TreeNode | null): TreeNode[] {
  if (!node) return [];
  return [node, ...getNodes(node.left), ...getNodes(node.right)];
}

const TreeCanvas = ({ tree, highlighted, comparing, width = 800, height = 450 }: TreeCanvasProps) => {
  const edges = getEdges(tree);
  const nodes = getNodes(tree);

  const maxY = getMaxY(tree);
  const canvasHeight = maxY + 60;

  return (
    <svg
      className="w-full h-full"
      viewBox={`0 0 ${width} ${canvasHeight}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Edges */}
      {edges.map((e, i) => (
        <motion.line
          key={`edge-${i}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          stroke="hsl(var(--border))"
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        />
      ))}

      {/* Nodes */}
      {nodes.map((n) => {
        const isHighlighted = highlighted.includes(n.value);
        const isComparing = comparing.includes(n.value);

        return (
          <motion.g
            key={`node-${n.value}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Glow */}
            {isHighlighted && (
              <motion.circle
                cx={n.x}
                cy={n.y}
                r={26}
                fill="none"
                stroke="hsl(var(--tree))"
                strokeWidth={2}
                opacity={0.4}
                animate={{ r: [26, 32, 26], opacity: [0.4, 0.1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={22}
              fill={
                isHighlighted
                  ? "hsl(var(--tree))"
                  : isComparing
                    ? "hsl(var(--warning))"
                    : "hsl(var(--card))"
              }
              stroke={
                isHighlighted
                  ? "hsl(var(--tree))"
                  : isComparing
                    ? "hsl(var(--warning))"
                    : "hsl(var(--border))"
              }
              strokeWidth={2}
            />
            <text
              x={n.x}
              y={n.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={
                isHighlighted || isComparing
                  ? "hsl(var(--background))"
                  : "hsl(var(--foreground))"
              }
              fontSize={13}
              fontWeight={600}
              fontFamily="Space Grotesk, sans-serif"
            >
              {n.value}
            </text>
            {/* Balance factor */}
            <text
              x={n.x + 26}
              y={n.y - 16}
              textAnchor="middle"
              fontSize={9}
              fill="hsl(var(--muted-foreground))"
              fontFamily="JetBrains Mono, monospace"
            >
              h:{n.height}
            </text>
          </motion.g>
        );
      })}

      {/* Empty state */}
      {!tree && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fill="hsl(var(--muted-foreground))"
          fontSize={14}
          fontFamily="Space Grotesk, sans-serif"
        >
          Insert values to build the tree
        </text>
      )}
    </svg>
  );
};

export default TreeCanvas;
