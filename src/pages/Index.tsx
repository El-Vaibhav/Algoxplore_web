import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, GitBranch, BarChart3, Clock, TreeDeciduous, Search, Brain, Code2 } from "lucide-react";

const categories = [
  {
    title: "Graph Algorithms",
    description: "Visualize DFS, BFS, Dijkstra, Prim's, Kruskal's and more on interactive graphs",
    path: "/graph",
    icon: GitBranch,
    colorClass: "text-graph",
    bgGlow: "box-glow-graph",
    borderHover: "hover:border-graph/50",
    gradient: "from-graph/15 via-graph/5 to-transparent",
    iconBg: "bg-graph/10 border-graph/20",
    tagBg: "bg-graph/10 text-graph",
    tags: ["DFS", "BFS", "Dijkstra", "Prim's"],
  },
  {
    title: "Sorting Algorithms",
    description: "Watch Bubble, Merge, Quick, Insertion and Selection sort animate step by step",
    path: "/sorting",
    icon: BarChart3,
    colorClass: "text-sorting",
    bgGlow: "box-glow-sorting",
    borderHover: "hover:border-sorting/50",
    gradient: "from-sorting/15 via-sorting/5 to-transparent",
    iconBg: "bg-sorting/10 border-sorting/20",
    tagBg: "bg-sorting/10 text-sorting",
    tags: ["Bubble", "Merge", "Quick", "Selection"],
  },
  {
    title: "Scheduling Algorithms",
    description: "Explore FCFS, SJF, SRTF, Round Robin, and Priority scheduling with Gantt charts",
    path: "/scheduling",
    icon: Clock,
    colorClass: "text-scheduling",
    bgGlow: "box-glow-scheduling",
    borderHover: "hover:border-scheduling/50",
    gradient: "from-scheduling/15 via-scheduling/5 to-transparent",
    iconBg: "bg-scheduling/10 border-scheduling/20",
    tagBg: "bg-scheduling/10 text-scheduling",
    tags: ["FCFS", "SJF", "Round Robin", "Priority"],
  },
  {
    title: "Tree Algorithms",
    description: "Learn Binary Search Trees, AVL Trees, and tree traversals through visual animations",
    path: "/trees",
    icon: TreeDeciduous,
    colorClass: "text-tree",
    bgGlow: "box-glow-tree",
    borderHover: "hover:border-tree/50",
    gradient: "from-tree/15 via-tree/5 to-transparent",
    iconBg: "bg-tree/10 border-tree/20",
    tagBg: "bg-tree/10 text-tree",
    tags: ["BST", "AVL", "Inorder", "Preorder"],
  },
  {
    title: "Search Algorithms",
    description: "Visualize Binary Search, A* pathfinding and AO* algorithm step-by-step",
    path: "/search",
    icon: Search,
    colorClass: "text-search",
    bgGlow: "box-glow-search",
    borderHover: "hover:border-search/50",
    gradient: "from-search/15 via-search/5 to-transparent",
    iconBg: "bg-search/10 border-search/20",
    tagBg: "bg-search/10 text-search",
    tags: ["Binary Search", "A*", "AO*"],
  },
  {
    title: "Dynamic Programming & Backtracking",
    description: "Understand DP and Backtracking concepts like Knapsack, LCS and NQueens through step-by-step table visualization",
    path: "/dp",
    icon: Brain,
    colorClass: "text-dp",
    bgGlow: "box-glow-dp",
    borderHover: "hover:border-dp/50",
    gradient: "from-dp/15 via-dp/5 to-transparent",
    iconBg: "bg-dp/10 border-dp/20",
    tagBg: "bg-dp/10 text-dp",
    tags: ["Knapsack", "LCS", "NQueens", "Rat In a Maze"],
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-graph/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-scheduling/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-sorting/5 rounded-full blur-[100px]" />

        <div className="relative z-10 container mx-auto px-6 py-28 md:py-40 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-xs text-muted-foreground mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Interactive Algorithm Visualization
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight"
          >
            Algo<span className="text-graph">X</span>
            <span className="text-sorting">p</span>
            <span className="text-scheduling">l</span>
            <span className="text-foreground">ore</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Explore, understand, and master algorithms through{" "}
            <span className="text-foreground font-medium">beautiful animations</span> and{" "}
            <span className="text-foreground font-medium">interactive visualizations</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 flex flex-wrap justify-center gap-4"          >
            <Link
              to="/sorting"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-graph to-sorting text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/code-visualizer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-warning/40 text-warning font-semibold text-sm hover:bg-warning/10 transition"
            >
              Code Playground <Code2 className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-6 pb-28 -mt-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.12 }}
              >
                <Link to={cat.path} className="block group h-full">
                  <div
                    className={`relative rounded-2xl bg-gradient-to-br ${cat.gradient} border border-border p-8 h-full transition-all duration-300 ${cat.borderHover} group-hover:${cat.bgGlow}`}
                  >
                    <div className="flex flex-col gap-5">
                      <div
                        className={`w-12 h-12 rounded-xl border ${cat.iconBg} flex items-center justify-center`}
                      >
                        <Icon className={`w-6 h-6 ${cat.colorClass}`} />
                      </div>

                      <h2 className="text-xl font-bold text-foreground">{cat.title}</h2>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cat.description}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {cat.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded-md ${cat.tagBg}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 ${cat.colorClass} text-sm font-medium group-hover:gap-3 transition-all mt-auto`}
                      >
                        Explore <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        {/* Code Visualizer Centered */}
        <div className="flex justify-center mt-10">
          <Link to="/code-visualizer" className="group w-full max-w-md">
            <div className="relative rounded-2xl bg-gradient-to-br from-warning/15 via-warning/5 to-transparent border border-border p-8 transition-all duration-300 hover:border-warning/50 hover:shadow-[0_0_40px_rgba(255,165,0,0.15)]">

              <div className="flex flex-col gap-5 text-center items-center">

                <div className="w-12 h-12 rounded-xl border bg-warning/10 border-warning/20 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-warning" />
                </div>

                <h2 className="text-xl font-bold text-foreground">
                  Code Visualizer Playground
                </h2>

                <p className="text-sm text-muted-foreground">
                  Write your own algorithms and watch them execute step-by-step with interactive visualization
                </p>

                <span className="inline-flex items-center gap-2 text-warning text-sm font-medium group-hover:gap-3 transition-all">
                  Try Now <ArrowRight className="w-4 h-4" />
                </span>

              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 text-center text-xs text-muted-foreground space-y-2">

          <p>
            Built for learning. Visualize algorithms interactively.
          </p>

          <p>
            Developed by{" "}
            <span className="font-medium text-foreground">
              Vaibhav
            </span>
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="https://elvaibhavportfolionew.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition"
            >
              Portfolio
            </a>

            <a
              href="https://www.linkedin.com/in/vaibhav-sodhi-8b0207257"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition"
            >
              LinkedIn
            </a>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Index;
