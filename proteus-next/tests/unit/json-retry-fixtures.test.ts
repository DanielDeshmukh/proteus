import { describe, expect, it } from "vitest";
import { extractJson, repairJson } from "@/lib/agents/json-retry";

describe("extractJson", () => {
  it("extracts JSON wrapped in prose", () => {
    const raw = 'Sure! Here is the JSON you asked for: {"a": 1, "b": [2, 3]} — let me know if you need more.';
    expect(JSON.parse(extractJson(raw))).toEqual({ a: 1, b: [2, 3] });
  });

  it("strips markdown code fences", () => {
    const raw = '```json\n{"a": 1}\n```';
    expect(JSON.parse(extractJson(raw))).toEqual({ a: 1 });
  });

  it("handles braces inside string values", () => {
    const raw = 'noise {"a": "closing } brace inside", "b": 2} trailing';
    expect(JSON.parse(extractJson(raw))).toEqual({ a: "closing } brace inside", b: 2 });
  });

  it("handles array-rooted responses", () => {
    const raw = 'Result: [1, 2, 3]';
    expect(JSON.parse(extractJson(raw))).toEqual([1, 2, 3]);
  });
});

describe("repairJson", () => {
  it("removes trailing commas", () => {
    expect(JSON.parse(repairJson('{"a": 1, "b": [1, 2,],}'))).toEqual({ a: 1, b: [1, 2] });
  });

  it("escapes literal control characters inside string values", () => {
    const raw = '{"a": "line1\nline2\ttabbed"}';
    expect(JSON.parse(repairJson(raw))).toEqual({ a: "line1\nline2\ttabbed" });
  });

  it("drops trailing text after the closing brace", () => {
    expect(JSON.parse(repairJson('{"a": 1} Hope this helps!'))).toEqual({ a: 1 });
  });
});
