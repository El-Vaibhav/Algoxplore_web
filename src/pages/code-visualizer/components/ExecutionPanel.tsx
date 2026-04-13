import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ExecutionStep } from "../types";

interface ExecutionPanelProps {
  steps: ExecutionStep[];
  currentStepIndex: number;
}

const ExecutionPanel = ({ steps, currentStepIndex }: ExecutionPanelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // OPTIONAL: only auto-scroll if user is near bottom
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isNearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [currentStepIndex]);

  return (
    <div className="flex flex-col h-full gap-2">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <span className="text-accent">⏱</span> Execution Log
      </h3>

      {/* SCROLL CONTAINER (IMPORTANT FIX) */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-lg border border-border bg-muted/30 p-3"
      >
        {steps.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Run an algorithm to see execution steps here...
          </p>
        ) : (
          <div className="space-y-1">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-xs px-2 py-1.5 rounded-md transition-colors ${
                  i === currentStepIndex
                    ? "bg-primary/15 text-primary font-medium"
                    : i < currentStepIndex
                    ? "text-muted-foreground"
                    : "text-muted-foreground/40"
                }`}
              >
                <span className="font-mono w-5 shrink-0 text-right">
                  {i + 1}.
                </span>
                <span>{step.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionPanel;