import { useEffect, useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: makes sense here
export function useTrailing(func: () => any, time: number): () => void {
  const [lastCalledAt, setLastCalledAt] = useState(Date.now());

  useEffect(() => {
    const timeout = setTimeout(func, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [func, lastCalledAt, time]);

  return () => {
    setLastCalledAt(Date.now());
  };
}
