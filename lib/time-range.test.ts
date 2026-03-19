import { test, expect, describe } from "bun:test";
import { formatTimeRange } from "./time-range";

describe("formatTimeRange", () => {
  test("same period drops am/pm from start", () => {
    const result = formatTimeRange("14:00", 120);
    expect(result).toBe("2:00-4:00pm");
  });

  test("crossing am/pm shows both", () => {
    const result = formatTimeRange("11:00", 120);
    expect(result).toBe("11:00am-1:00pm");
  });

  test("morning range drops am from start", () => {
    const result = formatTimeRange("07:00", 120);
    expect(result).toBe("7:00-9:00am");
  });

  test("30 minute duration", () => {
    const result = formatTimeRange("09:00", 30);
    expect(result).toBe("9:00-9:30am");
  });

  test("90 minute duration", () => {
    const result = formatTimeRange("18:00", 90);
    expect(result).toBe("6:00-7:30pm");
  });

  test("default 2 hour duration", () => {
    const result = formatTimeRange("09:00", 120);
    expect(result).toBe("9:00-11:00am");
  });

  test("evening to evening same period", () => {
    const result = formatTimeRange("19:00", 120);
    expect(result).toBe("7:00-9:00pm");
  });
});
