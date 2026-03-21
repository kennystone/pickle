import { test, expect, describe, mock, spyOn, beforeEach } from "bun:test";
import { parseFlags, shortId, resolveGameId } from "./admin";

describe("parseFlags", () => {
  test("parses key-value flags", () => {
    expect(parseFlags(["--date", "2026-03-21", "--time", "14:00"])).toEqual({
      date: "2026-03-21",
      time: "14:00",
    });
  });

  test("parses boolean flags (no value)", () => {
    expect(parseFlags(["--all"])).toEqual({ all: "true" });
  });

  test("parses mixed flags", () => {
    expect(
      parseFlags(["--date", "2026-03-21", "--all", "--place", "PA"])
    ).toEqual({
      date: "2026-03-21",
      all: "true",
      place: "PA",
    });
  });

  test("returns empty object for no flags", () => {
    expect(parseFlags([])).toEqual({});
  });

  test("ignores non-flag args", () => {
    expect(parseFlags(["games", "create", "--date", "2026-03-21"])).toEqual({
      date: "2026-03-21",
    });
  });

  test("consecutive flags treated as booleans except last", () => {
    expect(parseFlags(["--verbose", "--debug", "--name", "test"])).toEqual({
      verbose: "true",
      debug: "true",
      name: "test",
    });
  });

  test("flag at end with no value is boolean", () => {
    expect(parseFlags(["--date", "2026-03-21", "--verbose"])).toEqual({
      date: "2026-03-21",
      verbose: "true",
    });
  });
});

describe("shortId", () => {
  test("returns first 8 characters", () => {
    expect(shortId("88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89")).toBe("88b667c4");
  });

  test("handles short strings", () => {
    expect(shortId("abc")).toBe("abc");
  });

  test("handles exactly 8 characters", () => {
    expect(shortId("12345678")).toBe("12345678");
  });
});

describe("resolveGameId", () => {
  function mockSupabase(games: { id: string }[]) {
    return {
      from: () => ({
        select: () => ({ data: games }),
      }),
    } as any;
  }

  test("resolves exact prefix to full ID", async () => {
    const supabase = mockSupabase([
      { id: "88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89" },
      { id: "a1234567-0000-0000-0000-000000000000" },
    ]);
    const result = await resolveGameId(supabase, "88b6");
    expect(result).toBe("88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89");
  });

  test("resolves full UUID", async () => {
    const fullId = "88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89";
    const supabase = mockSupabase([{ id: fullId }]);
    const result = await resolveGameId(supabase, fullId);
    expect(result).toBe(fullId);
  });

  test("exits on no match", async () => {
    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const supabase = mockSupabase([
      { id: "88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89" },
    ]);
    expect(resolveGameId(supabase, "zzz")).rejects.toThrow("process.exit");
    exitSpy.mockRestore();
  });

  test("exits on ambiguous prefix", async () => {
    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const supabase = mockSupabase([
      { id: "88b667c4-ee2e-4dfe-9fe4-4d5a2951fb89" },
      { id: "88b99999-0000-0000-0000-000000000000" },
    ]);
    expect(resolveGameId(supabase, "88b")).rejects.toThrow("process.exit");
    exitSpy.mockRestore();
  });

  test("exits when data is null", async () => {
    const exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
    const supabase = {
      from: () => ({
        select: () => ({ data: null }),
      }),
    } as any;
    expect(resolveGameId(supabase, "abc")).rejects.toThrow("process.exit");
    exitSpy.mockRestore();
  });
});

describe("CLI routing", () => {
  let exitSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    exitSpy = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit");
    });
  });

  test("unknown command exits with error", async () => {
    const original = process.argv;
    process.argv = ["bun", "admin.ts", "bogus"];
    const { main } = await import("./admin");
    expect(main()).rejects.toThrow("process.exit");
    process.argv = original;
    exitSpy.mockRestore();
  });

  test("missing invite args exits with error", async () => {
    const original = process.argv;
    process.argv = ["bun", "admin.ts", "invite"];
    const { main } = await import("./admin");
    expect(main()).rejects.toThrow("process.exit");
    process.argv = original;
    exitSpy.mockRestore();
  });

  test("missing attendees args exits with error", async () => {
    const original = process.argv;
    process.argv = ["bun", "admin.ts", "attendees"];
    const { main } = await import("./admin");
    expect(main()).rejects.toThrow("process.exit");
    process.argv = original;
    exitSpy.mockRestore();
  });

  test("missing games delete id exits with error", async () => {
    const original = process.argv;
    process.argv = ["bun", "admin.ts", "games", "delete"];
    const { main } = await import("./admin");
    expect(main()).rejects.toThrow("process.exit");
    process.argv = original;
    exitSpy.mockRestore();
  });
});
