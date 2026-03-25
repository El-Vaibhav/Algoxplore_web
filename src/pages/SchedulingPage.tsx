import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import SpeedControl from "@/components/SpeedControl";
import {
  fcfs, sjf, srtf, roundRobin, priorityScheduling,
  schedulingAlgoInfo, type ScheduleResult, type ScheduleBlock,
  priorityPreemptive,
} from "@/lib/schedulingAlgorithms";
import { useNavigate } from "react-router-dom";

const algorithms = Object.keys(schedulingAlgoInfo);
const COLORS = [
  "hsl(174, 72%, 50%)", "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)",
  "hsl(0, 84%, 60%)", "hsl(142, 76%, 46%)", "hsl(199, 89%, 48%)",
  "hsl(330, 70%, 55%)", "hsl(45, 93%, 58%)", "hsl(210, 80%, 55%)", "hsl(60, 80%, 50%)",
];

const SchedulingPage = () => {
  const [algo, setAlgo] = useState("FCFS");
  const [arrivalInput, setArrivalInput] = useState("0,1,2,3");
  const [burstInput, setBurstInput] = useState("5,3,2,6");
  const [priorityInput, setPriorityInput] = useState("2,1,3,4");
  const [quantumInput, setQuantumInput] = useState("2");
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [speed, setSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  // Animation state: how many gantt blocks are visible, and current simulated time
  const [visibleBlocks, setVisibleBlocks] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [animationDone, setAnimationDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  const info = schedulingAlgoInfo[algo];

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  }, []);

  const runDefault = useCallback(() => {
    const arrival = arrivalInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const burst = burstInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));

    if (arrival.length === 0 || burst.length === 0 || arrival.length !== burst.length) return;

    let res: ScheduleResult;

    switch (algo) {
      case "FCFS":
        res = fcfs(arrival, burst);
        break;

      case "SJF":
        res = sjf(arrival, burst);
        break;

      case "SRTF":
        res = srtf(arrival, burst);
        break;

      case "Round Robin":
        res = roundRobin(arrival, burst, parseInt(quantumInput) || 2);
        break;

      case "Priority":
        const pri = priorityInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        res = priorityScheduling(arrival, burst, pri);
        break;

      case "Priority (Preemptive)": {
        const pri = priorityInput.split(",")
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n));

        res = priorityPreemptive(arrival, burst, pri);
        break;
      }

      default:
        res = fcfs(arrival, burst);
    }

    setResult(res);
    setVisibleBlocks(res.gantt.length);
    setCurrentTime(res.gantt[res.gantt.length - 1].end);
    setAnimationDone(true);
  }, [algo, arrivalInput, burstInput, priorityInput, quantumInput]);

  const run = () => {
    stopAnimation();
    const arrival = arrivalInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const burst = burstInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (arrival.length === 0 || burst.length === 0 || arrival.length !== burst.length) return;

    let res: ScheduleResult;
    switch (algo) {
      case "FCFS": res = fcfs(arrival, burst); break;
      case "SJF": res = sjf(arrival, burst); break;
      case "SRTF": res = srtf(arrival, burst); break;
      case "Round Robin": {
        const q = parseInt(quantumInput) || 2;
        res = roundRobin(arrival, burst, q);
        break;
      }
      case "Priority": {
        const pri = priorityInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
        if (pri.length !== arrival.length) return;
        res = priorityScheduling(arrival, burst, pri);
        break;
      }
      case "Priority (Preemptive)": {
        const pri = priorityInput.split(",")
          .map(s => parseInt(s.trim()))
          .filter(n => !isNaN(n));

        if (pri.length !== arrival.length) return;

        res = priorityPreemptive(arrival, burst, pri);
        break;
      }
      default: res = fcfs(arrival, burst);
    }
    setResult(res);
    setVisibleBlocks(0);
    setCurrentTime(0);
    setAnimationDone(false);
    setIsRunning(true);
  };

  // Animate blocks appearing one by one
  useEffect(() => {
    if (!isRunning || !result) return;

    const animateNext = () => {
      setVisibleBlocks(prev => {
        const next = prev + 1;
        if (next <= result.gantt.length) {
          setCurrentTime(result.gantt[next - 1].end);
        }
        if (next >= result.gantt.length) {
          setIsRunning(false);
          setAnimationDone(true);
        }
        return next;
      });
    };

    timerRef.current = window.setTimeout(animateNext, 600 * speed);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [isRunning, result, visibleBlocks, speed]);

  useEffect(() => {
    runDefault();
  }, [algo]);

  const resetAll = () => {
    stopAnimation();
    setResult(null);
    setVisibleBlocks(0);
    setCurrentTime(0);
    setAnimationDone(false);
  };

  const maxTime = result ? Math.max(...result.gantt.map(b => b.end), 1) : 1;
  const displayedGantt: ScheduleBlock[] = result ? result.gantt.slice(0, visibleBlocks) : [];
  const displayedMaxTime = displayedGantt.length > 0 ? Math.max(...displayedGantt.map(b => b.end), 1) : 1;

  // Determine which processes are "revealed" in stats
  const revealedProcesses = new Set(displayedGantt.map(b => b.processId));

  return (
    <AlgoLayout title="Scheduling Algorithms">
      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        {/* Main content */}
        <div className="space-y-4">
          {/* Timeline visualization */}
          <div className="rounded-xl border border-border bg-card p-5 min-h-[260px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Gantt Chart</h3>
              {isRunning && (
                <span className="text-xs font-mono text-scheduling bg-scheduling/10 px-3 py-1 rounded-full animate-pulse">
                  Time: {currentTime}
                </span>
              )}
              {animationDone && (
                <span className="text-xs font-mono text-success bg-success/10 px-3 py-1 rounded-full">
                  Complete — Total: {maxTime} units
                </span>
              )}
            </div>

            {result ? (
              <div className="space-y-4">
                {/* Animated Gantt bars */}
                <div className="relative overflow-x-auto">
                  <div className="flex h-20 min-w-[400px] rounded-lg overflow-hidden bg-secondary/30">
                    {displayedGantt.map((block, i) => (
                      <div key={`${block.processId}-${block.start}`}
                        className="h-full flex items-center justify-center text-xs font-bold border-r border-background/30 relative transition-all duration-300"
                        style={{
                          width: `${((block.end - block.start) / maxTime) * 100}%`,
                          backgroundColor: COLORS[block.processId % COLORS.length],
                          color: "hsl(240, 15%, 6%)",
                          minWidth: 36,
                          animation: i === displayedGantt.length - 1 ? "gantt-slide-in 0.35s ease-out" : undefined,
                        }}>
                        P{block.processId}
                      </div>
                    ))}
                    {/* Remaining empty space */}
                    {displayedMaxTime < maxTime && (
                      <div className="h-full flex-1 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-scheduling/40 animate-pulse" />
                      </div>
                    )}
                  </div>
                  {/* Time labels */}
                  <div className="flex min-w-[400px] mt-1">
                    {displayedGantt.map((block, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground relative"
                        style={{ width: `${((block.end - block.start) / maxTime) * 100}%`, minWidth: 36 }}>
                        <span className="absolute left-0">{block.start}</span>
                        {i === displayedGantt.length - 1 && <span className="absolute right-0">{block.end}</span>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process queue visualization */}
                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Processes:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {arrivalInput.split(",").map((_, i) => {
                      const isActive = displayedGantt.length > 0 && displayedGantt[displayedGantt.length - 1].processId === i;
                      const isDone = animationDone || (result && result.gantt.filter(b => b.processId === i).every(b => b.end <= currentTime));
                      return (
                        <div key={i}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-mono transition-all duration-300 ${isActive ? "ring-1 ring-scheduling scale-105" : ""
                            } ${isDone ? "opacity-60" : ""}`}
                          style={{ backgroundColor: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          P{i}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-muted-foreground gap-3">
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="h-12 rounded-md animate-pulse" style={{
                      width: `${40 + i * 15}px`,
                      backgroundColor: `${COLORS[i]}30`,
                      animationDelay: `${i * 0.2}s`,
                    }} />
                  ))}
                </div>
                <p className="text-sm">Configure inputs and click Run to visualize</p>
              </div>
            )}
          </div>

          {/* Statistics Table - rows animate in */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold text-foreground mb-3">Statistics</h3>
            {result ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Process</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Arrival</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Burst</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Waiting Time</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Turnaround Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.waitingTime.map((wt, i) => {
                      const arrival = arrivalInput.split(",").map(s => parseInt(s.trim()));
                      const burst = burstInput.split(",").map(s => parseInt(s.trim()));
                      const isRevealed = revealedProcesses.has(i);
                      return (
                        <tr key={i}
                          className={`border-b border-border/50 transition-all duration-500 ${isRevealed ? "opacity-100" : "opacity-20"}`}>
                          <td className="py-2 px-3 font-mono text-foreground flex items-center gap-2">
                            <span className="w-3 h-3 rounded-sm inline-block transition-transform duration-300"
                              style={{
                                backgroundColor: COLORS[i % COLORS.length],
                                transform: isRevealed ? "scale(1)" : "scale(0)",
                              }} />
                            P{i}
                          </td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{arrival[i]}</td>
                          <td className="py-2 px-3 font-mono text-muted-foreground">{burst[i]}</td>
                          <td className="py-2 px-3 font-mono text-scheduling">{isRevealed ? wt : "—"}</td>
                          <td className="py-2 px-3 font-mono text-scheduling">{isRevealed ? result.turnaroundTime[i] : "—"}</td>
                        </tr>
                      );
                    })}
                    {animationDone && (
                      <tr className="font-semibold animate-fade-in">
                        <td className="py-2 px-3 text-foreground" colSpan={3}>Average</td>
                        <td className="py-2 px-3 font-mono text-scheduling">{(result.waitingTime.reduce((a, b) => a + b, 0) / result.waitingTime.length).toFixed(2)}</td>
                        <td className="py-2 px-3 font-mono text-scheduling">{(result.turnaroundTime.reduce((a, b) => a + b, 0) / result.turnaroundTime.length).toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">Run an algorithm to see statistics</div>
            )}
          </div>

          {/* Bottom Algorithm Info */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Explanation */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-2">{algo}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {info.explanation}
              </p>
            </div>

            {/* Time Complexity */}
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-semibold text-foreground mb-3">Time Complexity</h3>

              <div className="grid grid-cols-3 gap-3">
                {(["best", "average", "worst"] as const).map(k => (
                  <div key={k} className="text-center p-3 rounded-lg bg-secondary/50">
                    <div className="text-xs text-muted-foreground capitalize">{k}</div>
                    <div className="text-sm font-mono mt-1 text-scheduling">
                      {info.timeComplexity[k]}
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>

        {/* Right sidebar: controls + info */}
        <div className="space-y-3">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Algorithm</h3>
            <div className="flex flex-wrap gap-1.5">
              {algorithms.map(a => (
                <button key={a} onClick={() => { setAlgo(a); resetAll(); }}
                  className={`px-2.5 py-1 text-[11px] rounded-lg transition-colors ${algo === a ? "bg-scheduling/20 text-scheduling border border-scheduling/30 font-medium" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Input</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Arrival Time</label>
              <input value={arrivalInput} onChange={e => setArrivalInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-scheduling/50 focus:outline-none transition-colors" placeholder="0,1,2,3" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Burst Time</label>
              <input value={burstInput} onChange={e => setBurstInput(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-scheduling/50 focus:outline-none transition-colors" placeholder="5,3,2,6" />
            </div>
            {info.needsPriority && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Priority (lower = higher)</label>
                <input value={priorityInput} onChange={e => setPriorityInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-scheduling/50 focus:outline-none transition-colors" placeholder="2,1,3,4" />
              </div>
            )}
            {info.needsQuantum && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Time Quantum</label>
                <input value={quantumInput} onChange={e => setQuantumInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:border-scheduling/50 focus:outline-none transition-colors" placeholder="2" />
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
            <div className="flex gap-2">
              <button onClick={run} disabled={isRunning}
                className="flex-1 py-2 text-sm rounded-lg bg-scheduling text-accent-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                {isRunning ? "Running..." : "▶ Run"}
              </button>
              <button onClick={resetAll} className="flex-1 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">Reset</button>
            </div>
          </div>

          {/* Pseudocode */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Pseudocode</h3>

            <div className="max-h-[260px] overflow-y-auto text-xs font-mono leading-relaxed text-muted-foreground bg-secondary/30 rounded-lg p-3">
              <pre className="whitespace-pre-wrap">
                {info.pseudocode}
              </pre>
            </div>
          </div>


        </div>
      </div>
    </AlgoLayout>
  );
};

export default SchedulingPage;
