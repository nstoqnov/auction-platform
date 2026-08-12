import { useEffect, useState } from "react";

/**
 * Returns a live-ticking breakdown of the time until `target`.
 * Ticks every second; stops at zero. Returns { days, hours, minutes,
 * seconds, total, ended } where `total` is milliseconds remaining.
 */
export function useCountdown(target) {
  const compute = () => {
    if (!target) return { total: 0, ended: true };
    const total = new Date(target).getTime() - Date.now();
    if (Number.isNaN(total)) return { total: 0, ended: true };
    if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, ended: true };
    return {
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / (1000 * 60)) % 60),
      seconds: Math.floor((total / 1000) % 60),
      total,
      ended: false,
    };
  };

  const [time, setTime] = useState(compute);

  useEffect(() => {
    setTime(compute());
    const id = setInterval(() => {
      const next = compute();
      setTime(next);
      if (next.ended) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return time;
}

/** Pads a number to 2 digits for countdown display. */
export const pad = (n) => String(n).padStart(2, "0");
