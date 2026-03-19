import { test, expect, describe } from "bun:test";
import { generateSlug } from "./slug-generator";

describe("generateSlug", () => {
  test("format is {6-hex}-{adjective}-{noun}", () => {
    const slug = generateSlug();
    const parts = slug.split("-");
    // hex part is 6 chars, then adjective, then noun = 3 dash-separated segments
    // but adjective or noun could be multi-word... actually they're single words
    expect(parts.length).toBe(3);
    expect(parts[0]).toMatch(/^[0-9a-f]{6}$/);
    expect(parts[1]!.length).toBeGreaterThan(0);
    expect(parts[2]!.length).toBeGreaterThan(0);
  });

  test("hex prefix is always 6 lowercase hex characters", () => {
    for (let i = 0; i < 50; i++) {
      const hex = generateSlug().split("-")[0];
      expect(hex).toMatch(/^[0-9a-f]{6}$/);
    }
  });

  test("generates unique slugs", () => {
    const slugs = Array.from({ length: 100 }, () => generateSlug());
    const unique = new Set(slugs);
    expect(unique.size).toBe(100);
  });

  test("slug contains only lowercase alphanumeric and hyphens", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateSlug()).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
