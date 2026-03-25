import { Link, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { GitBranch, BarChart3, Clock, Home, Shuffle } from "lucide-react";

interface AlgoLayoutProps {
  title: string;
  children: ReactNode;
}

const navItems = [
  { path: "/graph", label: "Graph", icon: GitBranch, colorClass: "text-graph" },
  { path: "/sorting", label: "Sorting", icon: BarChart3, colorClass: "text-sorting" },
  { path: "/scheduling", label: "Scheduling", icon: Clock, colorClass: "text-scheduling" },
];

const AlgoLayout = ({ title, children }: AlgoLayoutProps) => {
  const location = useLocation();

  let comparePath = "/graph-compare";

  if (location.pathname.startsWith("/sorting")) {
    comparePath = "/sorting-compare";
  } else if (location.pathname.startsWith("/graph")) {
    comparePath = "/graph-compare";
  } else if (location.pathname.startsWith("/scheduling")) {
    comparePath = "/scheduling-compare";
  }

  const currentNav = navItems.find((n) => location.pathname.startsWith(n.path));
  const accentClass = currentNav?.colorClass ?? "text-primary";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="text-xl font-bold flex items-center">
  <span>Algo</span><span className={accentClass}>Xplore</span>
</Link>

          {/* Navigation */}
          <nav className="hidden sm:flex items-center gap-1">

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    isActive
                      ? `bg-secondary ${item.colorClass} font-medium`
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Compare Button */}
            <Link
              to={comparePath}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                location.pathname.includes("compare")
                  ? "bg-secondary text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              Compare
            </Link>

          </nav>

          {/* Home Button */}
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>

        </div>
      </header>

      <main className="container mx-auto px-6 py-8">{children}</main>
    </div>
  );
};

export default AlgoLayout;