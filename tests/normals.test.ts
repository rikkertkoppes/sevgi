import { Circle } from "../src/Core/Geometry/Circle";
import { LineSegment } from "../src/Core/Geometry/LineSegment";
import { same, v2 } from "../src/Core/Geometry/Vector";
import { Arc } from "../src/Core/Geometry/Arc";

describe("Normals API", () => {
    describe("line", () => {
        it("tangent of a line from (0,0) to (1,0) should be (1,0)", async () => {
            const l = new LineSegment(v2(0, 0), v2(1, 0));
            const t = l.direction();
            expect(same(t, v2(1, 0))).toBe(true);
        });
        it("normal of a line should be pointing right of direction of travel", async () => {
            const l = new LineSegment(v2(0, 0), v2(0, 1));
            const n = l.normal();
            expect(same(n, v2(1, 0))).toBe(true);
        });
    });

    describe("arc", () => {
        it("tangent of an arc from (1,0) to (0,1) should be (0,1) at t=0 and (-1,0) at t=1", async () => {
            const a = new Arc(new Circle(v2(0, 0), 1), 0, Math.PI / 2);
            const t0 = a.tangentAt(0);
            const t1 = a.tangentAt(1);
            console.log(t0, t1);
            expect(same(t0, v2(0, 1))).toBe(true);
            expect(same(t1, v2(-1, 0))).toBe(true);
        });
        it("normal of an arc from (1,0) to (0,1) should be (1,0) at t=0 and (0,1) at t=1", async () => {
            const a = new Arc(new Circle(v2(0, 0), 1), 0, Math.PI / 2);
            const n0 = a.normalAt(0);
            const n1 = a.normalAt(1);
            console.log(n0, n1);
            expect(same(n0, v2(1, 0))).toBe(true);
            expect(same(n1, v2(0, 1))).toBe(true);
        });
    });
});
