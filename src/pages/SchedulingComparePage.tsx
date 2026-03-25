import { useState, useRef, useCallback, useEffect } from "react";
import AlgoLayout from "@/components/AlgoLayout";
import SpeedControl from "@/components/SpeedControl";
import {
  fcfs, sjf, srtf, roundRobin, priorityScheduling,
  schedulingAlgoInfo, type ScheduleResult,
} from "@/lib/schedulingAlgorithms";

const defaultArrival = [0, 1, 2, 3];
const defaultBurst = [5, 3, 2, 6];

const algorithms = Object.keys(schedulingAlgoInfo);
const COLORS = [
  "hsl(174, 72%, 50%)", "hsl(33, 100%, 60%)", "hsl(262, 83%, 65%)",
  "hsl(0, 84%, 60%)", "hsl(142, 76%, 46%)", "hsl(199, 89%, 48%)",
  "hsl(330, 70%, 55%)", "hsl(45, 93%, 58%)",
];

function runAlgo(algo: string, arrival: number[], burst: number[], quantum: number, priority: number[]): ScheduleResult {
  switch (algo) {
    case "FCFS": return fcfs(arrival, burst);
    case "SJF": return sjf(arrival, burst);
    case "SRTF": return srtf(arrival, burst);
    case "Round Robin": return roundRobin(arrival, burst, quantum);
    case "Priority": return priorityScheduling(arrival, burst, priority);
    default: return fcfs(arrival, burst);
  }
}
const initialResultA = runAlgo("FCFS", defaultArrival, defaultBurst, 2, [2, 1, 3, 4]);
const initialResultB = runAlgo("SJF", defaultArrival, defaultBurst, 2, [2, 1, 3, 4]);

interface PanelState {
  algo: string;
  result: ScheduleResult | null;
  visibleBlocks: number;
  done: boolean;
}

const SchedulingComparePage = () => {
  const [algoA, setAlgoA] = useState("FCFS");
  const [algoB, setAlgoB] = useState("SJF");
  const [arrivalInput, setArrivalInput] = useState("0,1,2,3");
  const [burstInput, setBurstInput] = useState("5,3,2,6");
  const [priorityInput, setPriorityInput] = useState("2,1,3,4");
  const [quantumInput, setQuantumInput] = useState("2");
  const [speed, setSpeed] = useState(1);
  const [isRunning, setIsRunning] = useState(false);

  const [panelA, setPanelA] = useState<PanelState>({
    algo: "FCFS",
    result: initialResultA,
    visibleBlocks: initialResultA.gantt.length,
    done: true
  });

  const [panelB, setPanelB] = useState<PanelState>({
    algo: "SJF",
    result: initialResultB,
    visibleBlocks: initialResultB.gantt.length,
    done: true
  });

  const timerRef = useRef<number | null>(null);
  const panelARef = useRef(panelA);
  const panelBRef = useRef(panelB);
  panelARef.current = panelA;
  panelBRef.current = panelB;

  const stopAnimation = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setIsRunning(false);
  }, []);

  const animate = useCallback(() => {
    const a = panelARef.current;
    const b = panelBRef.current;
    const aDone = !a.result || a.visibleBlocks >= a.result.gantt.length;
    const bDone = !b.result || b.visibleBlocks >= b.result.gantt.length;
    if (aDone && bDone) {
      setPanelA(prev => ({ ...prev, done: true }));
      setPanelB(prev => ({ ...prev, done: true }));
      setIsRunning(false);
      return;
    }
    if (!aDone) setPanelA(prev => ({ ...prev, visibleBlocks: prev.visibleBlocks + 1, done: prev.result ? prev.visibleBlocks + 1 >= prev.result.gantt.length : false }));
    if (!bDone) setPanelB(prev => ({ ...prev, visibleBlocks: prev.visibleBlocks + 1, done: prev.result ? prev.visibleBlocks + 1 >= prev.result.gantt.length : false }));
    timerRef.current = window.setTimeout(animate, 400 / speed);
  }, [speed]);

  const startCompare = () => {
    stopAnimation();
    const arrival = arrivalInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const burst = burstInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const priority = priorityInput.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const quantum = parseInt(quantumInput) || 2;
    if (!arrival.length || !burst.length || arrival.length !== burst.length) return;

    const resA = runAlgo(algoA, arrival, burst, quantum, priority);
    const resB = runAlgo(algoB, arrival, burst, quantum, priority);
    const newA: PanelState = { algo: algoA, result: resA, visibleBlocks: 0, done: false };
    const newB: PanelState = { algo: algoB, result: resB, visibleBlocks: 0, done: false };
    setPanelA(newA);
    setPanelB(newB);
    setIsRunning(true);
    setTimeout(() => {
      panelARef.current = newA;
      panelBRef.current = newB;
      animate();
    }, 50);
  };

  const resetAll = () => {
    stopAnimation();
    setPanelA({
      algo: algoA,
      result: initialResultA,
      visibleBlocks: initialResultA.gantt.length,
      done: true
    });

    setPanelB({
      algo: algoB,
      result: initialResultB,
      visibleBlocks: initialResultB.gantt.length,
      done: true
    });
  };

  useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);

  const needsPriority = schedulingAlgoInfo[algoA]?.needsPriority || schedulingAlgoInfo[algoB]?.needsPriority;
  const needsQuantum = schedulingAlgoInfo[algoA]?.needsQuantum || schedulingAlgoInfo[algoB]?.needsQuantum;

  const renderGanttPanel = (panel: PanelState, color: string) => {
    const maxTime = panel.result ? Math.max(...panel.result.gantt.map(b => b.end), 1) : 1;
    const displayed = panel.result ? panel.result.gantt.slice(0, panel.visibleBlocks) : [];
    const avgWt = panel.result ? (panel.result.waitingTime.reduce((a, b) => a + b, 0) / panel.result.waitingTime.length).toFixed(2) : "—";
    const avgTat = panel.result ? (panel.result.turnaroundTime.reduce((a, b) => a + b, 0) / panel.result.turnaroundTime.length).toFixed(2) : "—";

    return (
      <div className="flex-1 min-w-0 space-y-3">
        <div className="rounded-xl border border-border bg-card p-4 min-h-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-bold ${color}`}>{panel.algo}</h3>
            {panel.done && (
              <span className="text-[10px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full">✓ Complete</span>
            )}
          </div>
          {panel.result ? (
            <div className="space-y-3">
              <div className="flex h-14 rounded-lg overflow-hidden bg-secondary/30">
                {displayed.map((block, i) => (
                  <div key={`${block.processId}-${block.start}`}
                    className="h-full flex items-center justify-center text-xs font-bold border-r border-background/30"
                    style={{
                      width: `${((block.end - block.start) / maxTime) * 100}%`,
                      backgroundColor: COLORS[block.processId % COLORS.length],
                      color: "hsl(240, 15%, 6%)",
                      minWidth: 28,
                      animation: i === displayed.length - 1 ? "gantt-slide-in 0.35s ease-out" : undefined,
                    }}>
                    P{block.processId}
                  </div>
                ))}
                {displayed.length < (panel.result?.gantt.length ?? 0) && (
                  <div className="h-full flex-1 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-scheduling/40 animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex text-[10px] text-muted-foreground">
                {displayed.map((block, i) => (
                  <div key={i} style={{ width: `${((block.end - block.start) / maxTime) * 100}%`, minWidth: 28 }} className="relative">
                    <span className="absolute left-0">{block.start}</span>
                    {i === displayed.length - 1 && <span className="absolute right-0">{block.end}</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-20 text-sm text-muted-foreground">Click Compare to start</div>
          )}
        </div>

        {/* Stats */}
        {panel.done && panel.result && (
          <div className="rounded-xl border border-border bg-card p-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] text-muted-foreground">Avg Waiting</div>
                <div className={`text-lg font-mono font-bold mt-1 ${color}`}>{avgWt}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50">
                <div className="text-[10px] text-muted-foreground">Avg Turnaround</div>
                <div className={`text-lg font-mono font-bold mt-1 ${color}`}>{avgTat}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <AlgoLayout title="Scheduling — Compare">
      <div className="w-full rounded-xl border border-border bg-card p-4 mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm A</label>
            <select value={algoA} onChange={e => setAlgoA(e.target.value)} disabled={isRunning}
              className="block w-36 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <span className="text-muted-foreground text-lg font-bold pb-1">vs</span>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Algorithm B</label>
            <select value={algoB} onChange={e => setAlgoB(e.target.value)} disabled={isRunning}
              className="block w-36 px-3 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none">
              {algorithms.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Arrival</label>
            <input value={arrivalInput} onChange={e => setArrivalInput(e.target.value)}
              className="w-28 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Burst</label>
            <input value={burstInput} onChange={e => setBurstInput(e.target.value)}
              className="w-28 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none" />
          </div>
          {needsPriority && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Priority</label>
              <input value={priorityInput} onChange={e => setPriorityInput(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none" />
            </div>
          )}
          {needsQuantum && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Quantum</label>
              <input value={quantumInput} onChange={e => setQuantumInput(e.target.value)}
                className="w-16 px-2 py-1.5 text-xs rounded-lg bg-secondary border border-border text-foreground focus:outline-none" />
            </div>
          )}
          <div className="min-w-[140px]">
            <SpeedControl speed={speed} onSpeedChange={setSpeed} />
          </div>
          <div className="flex gap-2 pb-0.5">
            <button onClick={startCompare} disabled={isRunning}
              className="px-5 py-2 text-sm rounded-lg bg-scheduling text-accent-foreground font-medium hover:opacity-90 disabled:opacity-50">
              {isRunning ? "Running..." : "▶ Compare"}
            </button>
            <button onClick={resetAll} className="px-4 py-2 text-sm rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80">Reset</button>
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        {renderGanttPanel(panelA, "text-scheduling")}
        <div className="w-px bg-border self-stretch" />
        {renderGanttPanel(panelB, "text-sorting")}
      </div>

      {panelA.done && panelB.done && panelA.result && panelB.result && (
        <div className="mt-5 rounded-xl border border-border bg-card p-5 text-center animate-fade-in">
          {(() => {
            const avgA = panelA.result!.waitingTime.reduce((a, b) => a + b, 0) / panelA.result!.waitingTime.length;
            const avgB = panelB.result!.waitingTime.reduce((a, b) => a + b, 0) / panelB.result!.waitingTime.length;
            return (
              <>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {avgA < avgB ? `🏆 ${panelA.algo} has lower avg waiting time!` : avgA > avgB ? `🏆 ${panelB.algo} has lower avg waiting time!` : "🤝 Both have equal avg waiting time!"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  <span className="text-scheduling font-mono">{panelA.algo}: {avgA.toFixed(2)}</span>{" vs "}
                  <span className="text-sorting font-mono">{panelB.algo}: {avgB.toFixed(2)}</span>
                </p>
              </>
            );
          })()}
        </div>
      )}
    </AlgoLayout>
  );
};

export default SchedulingComparePage;
