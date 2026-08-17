import { renderHook, act } from "@testing-library/react";
import { useCountdown, pad } from "./useCountdown";

// The countdown drives the live auction timer. Fake timers + a fixed system
// clock make the time math deterministic.
describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2030-01-01T00:00:00Z"));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test("reports ended for a target in the past", () => {
    const { result } = renderHook(() => useCountdown("2020-01-01T00:00:00Z"));
    expect(result.current.ended).toBe(true);
    expect(result.current.total).toBe(0);
  });

  test("reports ended when no target is given", () => {
    const { result } = renderHook(() => useCountdown(undefined));
    expect(result.current.ended).toBe(true);
  });

  test("computes a day/hour/minute/second breakdown for a future target", () => {
    // 1 day, 2 hours, 3 minutes, 4 seconds ahead of the fixed clock
    const target = new Date("2030-01-02T02:03:04Z").toISOString();
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.ended).toBe(false);
    expect(result.current.days).toBe(1);
    expect(result.current.hours).toBe(2);
    expect(result.current.minutes).toBe(3);
    expect(result.current.seconds).toBe(4);
  });

  test("ticks down one second per interval", () => {
    const target = new Date("2030-01-01T00:00:10Z").toISOString(); // 10s ahead
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.seconds).toBe(10);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.seconds).toBe(9);
  });

  test("pad() zero-pads to two digits", () => {
    expect(pad(5)).toBe("05");
    expect(pad(12)).toBe("12");
  });
});
