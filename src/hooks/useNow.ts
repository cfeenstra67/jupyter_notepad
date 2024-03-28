import { useEffect, useState } from "react";

export function useNow(refreshInterval?: number): [number, () => void] {
  const [now, setNow] = useState(Date.now());

  const setNowValue = () => {
    setNow(Date.now());
  };

  useEffect(() => {
    if (!refreshInterval) {
      return;
    }

    const ivl = setInterval(setNowValue, refreshInterval);

    return () => {
      clearInterval(ivl);
    };
  }, [setNow, refreshInterval]);

  return [now, setNowValue];
}
