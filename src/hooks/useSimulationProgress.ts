import { useEffect, useState } from 'react';

type SimulationStatus = 'idle' | 'running' | 'completed';

export const useSimulationProgress = (steps: readonly string[]) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState<SimulationStatus>('idle');

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    const timerId = window.setInterval(() => {
      setStepIndex((prev) => {
        const next = prev + 1;
        if (next >= steps.length) {
          setStatus('completed');
          return steps.length - 1;
        }
        return next;
      });
    }, 1200);

    return () => window.clearInterval(timerId);
  }, [status, steps]);

  const start = () => {
    setStepIndex(0);
    setStatus('running');
  };

  const reset = () => {
    setStepIndex(0);
    setStatus('idle');
  };

  return {
    stepIndex,
    totalSteps: steps.length,
    status,
    isRunning: status === 'running',
    hasCompleted: status === 'completed',
    start,
    reset
  };
};
