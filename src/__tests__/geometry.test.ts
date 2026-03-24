import { describe, it, expect } from "vitest";
import { getEdgeParams } from "@/lib/geometry";
import { Position, type Node } from "@xyflow/react";

function makeNode(
  id: string,
  x: number,
  y: number,
  w = 200,
  h = 60
): Node {
  return {
    id,
    position: { x, y },
    data: {},
    measured: { width: w, height: h },
  } as unknown as Node;
}

describe("getEdgeParams", () => {
  it("returns right→left when target is to the right", () => {
    const source = makeNode("a", 0, 0);
    const target = makeNode("b", 400, 0);
    const result = getEdgeParams(source, target);

    expect(result.sourcePos).toBe(Position.Right);
    expect(result.targetPos).toBe(Position.Left);
    // Source x should be at the right edge of source node
    expect(result.sx).toBe(200); // 0 + 200 (width)
    // Target x should be at the left edge of target node
    expect(result.tx).toBe(400); // 400 + 0
  });

  it("returns left→right when target is to the left", () => {
    const source = makeNode("a", 400, 0);
    const target = makeNode("b", 0, 0);
    const result = getEdgeParams(source, target);

    expect(result.sourcePos).toBe(Position.Left);
    expect(result.targetPos).toBe(Position.Right);
  });

  it("returns bottom→top when target is directly below", () => {
    const source = makeNode("a", 0, 0);
    const target = makeNode("b", 0, 300);
    const result = getEdgeParams(source, target);

    expect(result.sourcePos).toBe(Position.Bottom);
    expect(result.targetPos).toBe(Position.Top);
  });

  it("returns top→bottom when target is directly above", () => {
    const source = makeNode("a", 0, 300);
    const target = makeNode("b", 0, 0);
    const result = getEdgeParams(source, target);

    expect(result.sourcePos).toBe(Position.Top);
    expect(result.targetPos).toBe(Position.Bottom);
  });

  it("handles nodes at the exact same position without error", () => {
    const source = makeNode("a", 100, 100);
    const target = makeNode("b", 100, 100);
    const result = getEdgeParams(source, target);

    // Should not throw or return NaN
    expect(result.sourcePos).toBe(Position.Top);
    expect(result.targetPos).toBe(Position.Top);
    expect(Number.isFinite(result.sx)).toBe(true);
    expect(Number.isFinite(result.sy)).toBe(true);
  });

  it("handles diagonal positioning (bottom-right)", () => {
    const source = makeNode("a", 0, 0, 100, 100);
    const target = makeNode("b", 500, 500, 100, 100);
    const result = getEdgeParams(source, target);

    // With equal dx and dy on a square node, it could be either right or bottom
    expect([Position.Right, Position.Bottom]).toContain(result.sourcePos);
    expect([Position.Left, Position.Top]).toContain(result.targetPos);
  });

  it("uses fallback dimensions when measured is undefined", () => {
    const source = { id: "a", position: { x: 0, y: 0 }, data: {} } as unknown as Node;
    const target = { id: "b", position: { x: 400, y: 0 }, data: {} } as unknown as Node;
    const result = getEdgeParams(source, target);

    // Should not throw
    expect(result.sourcePos).toBe(Position.Right);
    expect(Number.isFinite(result.sx)).toBe(true);
  });

  it("handles very close but not overlapping nodes", () => {
    const source = makeNode("a", 0, 0, 200, 60);
    const target = makeNode("b", 201, 0, 200, 60);
    const result = getEdgeParams(source, target);

    expect(result.sourcePos).toBe(Position.Right);
    expect(result.targetPos).toBe(Position.Left);
  });
});
