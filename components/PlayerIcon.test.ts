import { test, expect, describe } from "bun:test";
import { getPlayerStyle } from "./PlayerIcon";

describe("getPlayerStyle", () => {
  test("first 5 players get all different icons", () => {
    const gameId = "test-game-abc";
    const icons = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, gameId).icon);
    const unique = new Set(icons);
    expect(unique.size).toBe(5);
  });

  test("first 5 players get all different colors", () => {
    const gameId = "test-game-abc";
    const colors = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, gameId).color);
    const unique = new Set(colors);
    expect(unique.size).toBe(5);
  });

  test("icons repeat after 5 (all 5 exhausted before repeating)", () => {
    const gameId = "test-game-xyz";
    const first5 = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, gameId).icon);
    const next5 = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i + 5, gameId).icon);
    // next5 should be the same set of icons as first5
    expect(new Set(next5)).toEqual(new Set(first5));
  });

  test("10 players have 10 unique icon+color combos", () => {
    const gameId = "test-game-ten";
    const combos = Array.from({ length: 10 }, (_, i) => {
      const { icon, color } = getPlayerStyle(i, gameId);
      return `${icon}-${color}`;
    });
    const unique = new Set(combos);
    expect(unique.size).toBe(10);
  });

  test("same gameId always produces same result (deterministic)", () => {
    const gameId = "deterministic-check";
    const a = Array.from({ length: 8 }, (_, i) => getPlayerStyle(i, gameId));
    const b = Array.from({ length: 8 }, (_, i) => getPlayerStyle(i, gameId));
    expect(a).toEqual(b);
  });

  test("different gameIds produce different orderings", () => {
    const a = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, "game-aaa").icon);
    const b = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, "game-bbb").icon);
    // Extremely unlikely to be identical with different seeds
    // Check they're not the default order either
    const allSame = a.every((icon, i) => icon === b[i]);
    // This could theoretically fail with a collision, but practically won't
    expect(allSame).toBe(false);
  });

  test("icon order is shuffled (not always hat, paddle, ball, shoes, smash)", () => {
    // Try several game IDs - at least one should differ from default order
    const defaultOrder = ["hat", "paddle", "ball", "shoes", "smash"];
    const gameIds = ["shuffle-1", "shuffle-2", "shuffle-3", "shuffle-4", "shuffle-5"];
    const anyShuffled = gameIds.some((id) => {
      const icons = Array.from({ length: 5 }, (_, i) => getPlayerStyle(i, id).icon);
      return !icons.every((icon, i) => icon === defaultOrder[i]);
    });
    expect(anyShuffled).toBe(true);
  });

  test("20 players all have unique icon+color combos", () => {
    const gameId = "test-game-twenty";
    const combos = Array.from({ length: 20 }, (_, i) => {
      const { icon, color } = getPlayerStyle(i, gameId);
      return `${icon}-${color}`;
    });
    const unique = new Set(combos);
    expect(unique.size).toBe(20);
  });
});
