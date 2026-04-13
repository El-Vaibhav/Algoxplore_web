import { useState, useRef, useCallback, useEffect } from "react";
import type {
  GraphData,
  ExecutionStep,
  ExecutionState,
  ExecutionPayload,
  AlgorithmCategory,
  Algorithm,
} from "../types";

async function executeCode(payload: ExecutionPayload): Promise<ExecutionStep[]> {
  const res = await fetch("https://algoxplore-web.onrender.com/api/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return (data.steps || []).map((step: any) => ({
  type: step.type,
  node: step.node ?? null,
  edge: step.edge ?? null,
  array: step.array ?? [],
  comparing: step.comparing ?? null,
  swapping: step.swapping ?? null,
  sortedIndices: step.sortedIndices ?? [],
  result: step.result ?? null,

  gantt: step.gantt ?? null,
  waitingTime: step.waitingTime ?? null,
  turnaroundTime: step.turnaroundTime ?? null,

  // Tree 
  treeRoot: step.treeRoot ?? null,
  highlightNode: step.highlightNode ?? null,
  highlightPath: step.highlightPath ?? [],

  // DP
  dpTable: step.dpTable ?? null,
  dpCell: step.dpCell ?? null,
  dpCompare: step.dpCompare ?? [],

  description:
    step.type === "result"
      ? step.result
      : step.description ??
        `${step.type} ${step.node ?? step.value ?? ""}`,
}));
}

export function useExecution() {
  const [state, setState] = useState<ExecutionState>({
    steps: [],
    currentStepIndex: -1,
    isRunning: false,
    isPaused: false,
    isLoading: false,
    speed: 1,
    error: null,
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;

    if (s.isPaused || !s.isRunning) return;

    if (s.currentStepIndex >= s.steps.length - 1) {
      setState((p) => ({ ...p, isRunning: false }));
      return;
    }

    setState((p) => ({
      ...p,
      currentStepIndex: p.currentStepIndex + 1,
    }));

    timerRef.current = setTimeout(
      tick,
      1000 / stateRef.current.speed
    );
  }, []);

  const run = useCallback(
    async (
      code: string,
      category: AlgorithmCategory,
      algorithm: Algorithm,
      graph: GraphData,
      startNode: number,
      array: number[],
      scheduling?: any,
      tree?: any,
      dp?: any
    ) => {
      clearTimer();

      setState((p) => ({
        ...p,
        isLoading: true,
        error: null,
        steps: [],
        currentStepIndex: -1,
        isRunning: false,
        isPaused: false,
      }));

      try {
        const steps = await executeCode({
          code,
          category,
          algorithm: algorithm.toLowerCase() as Algorithm,
          input: {
            graph,
            start: startNode,
            array,
            scheduling,
            tree,
            dp,
          },
        });

        if (!steps || steps.length === 0) {
          setState((p) => ({
            ...p,
            isLoading: false,
            error: "No steps generated. Check your code.",
          }));
          return;
        }

        setState((p) => ({
          ...p,
          steps,
          currentStepIndex: 0,
          isRunning: true,
          isLoading: false,
        }));

        timerRef.current = setTimeout(
          tick,
          1000 / stateRef.current.speed
        );
      } catch (err: any) {
        setState((p) => ({
          ...p,
          isLoading: false,
          error: err.message || "Execution failed.",
        }));
      }
    },
    [clearTimer, tick]
  );

  const pause = useCallback(() => {
    clearTimer();
    setState((p) => ({ ...p, isPaused: true }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState((p) => ({ ...p, isPaused: false }));
    timerRef.current = setTimeout(
      tick,
      1000 / stateRef.current.speed
    );
  }, [tick]);

  const nextStep = useCallback(() => {
    setState((p) =>
      p.currentStepIndex >= p.steps.length - 1
        ? p
        : {
          ...p,
          currentStepIndex: p.currentStepIndex + 1,
          isPaused: true,
          isRunning: true,
        }
    );
    clearTimer();
  }, [clearTimer]);

  const prevStep = useCallback(() => {
    setState((p) =>
      p.currentStepIndex <= 0
        ? p
        : {
          ...p,
          currentStepIndex: p.currentStepIndex - 1,
          isPaused: true,
          isRunning: true,
        }
    );
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState({
      steps: [],
      currentStepIndex: -1,
      isRunning: false,
      isPaused: false,
      isLoading: false,
      speed: 1,
      error: null,
    });
  }, [clearTimer]);

  const setSpeed = useCallback((speed: number) => {
    setState((p) => ({ ...p, speed }));
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return {
    state,
    run,
    pause,
    resume,
    nextStep,
    prevStep,
    reset,
    setSpeed,
  };
}