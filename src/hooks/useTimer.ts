import { useState, useRef, useCallback } from "react";

export type TimerState = "idle" | "running" | "done";

interface UseTimerReturn {
  elapsed: number; // milliseconds
  timerState: TimerState;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useTimer(): UseTimerReturn {
  const [elapsed, setElapsed] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clear = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback(() => {
    clear();
    setElapsed(0);
    setTimerState("running");
    startTimeRef.current = performance.now();
    intervalRef.current = setInterval(() => {
      setElapsed(performance.now() - startTimeRef.current);
    }, 50); // 50ms tick → smooth two-decimal display
  }, []);

  const stop = useCallback(() => {
    clear();
    setElapsed(performance.now() - startTimeRef.current);
    setTimerState("done");
  }, []);

  const reset = useCallback(() => {
    clear();
    setElapsed(0);
    setTimerState("idle");
  }, []);

  return { elapsed, timerState, start, stop, reset };
}
