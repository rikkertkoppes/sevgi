import { Arc } from "./Arc";
import { BaseGeometry, WalkerOptions } from "./BaseGeometry";
import { Circle } from "./Circle";
import { ClosestPointInfo, Curve } from "./Curve";
import { Line } from "./Line";
import { LineSegment } from "./LineSegment";
import { Segment } from "./Segment";
import { Point, same } from "./Vector";

type JoinType = "miter" | "bevel" | "round" | "none";
export class PolyLine extends Curve {
    public type = "PolyLine";
    public length: number;
    private lengths: number[] = [];
    private offsets: number[] = [];
    private segments: Segment[] = [];
    protected closed = false;
    private joined = false;
    constructor(segments: Segment[]) {
        super();
        // TODO: order
        this.segments = segments;
        this.lengths = this.segments.map((e) => e.length);
        this.offsets = this.lengths.reduce(
            (acc, l) => {
                const last = acc.length > 0 ? acc[acc.length - 1] : 0;
                acc.push(last + l);
                return acc;
            },
            [0] as number[]
        );
        this.length = this.lengths.reduce((sum, l) => sum + l, 0);
        const jointsClosed = this.segments.map((s, i) => {
            const next = this.segments[(i + 1) % this.segments.length];
            return same(s.end, next.start);
        });
        this.joined = jointsClosed.slice(0, -1).every((v) => v); // don't care about last to first joint
        this.closed = jointsClosed.every((v) => v);
    }

    public clone(): PolyLine {
        return new PolyLine(this.segments.map((p) => p.clone()));
    }
    public translate(v: Point): PolyLine {
        return this.copyIdentity(
            new PolyLine(this.segments.map((p) => p.translate(v)))
        );
    }
    public rotate(angle: number, center: Point): PolyLine {
        return this.copyIdentity(
            new PolyLine(this.segments.map((p) => p.rotate(angle, center)))
        );
    }
    public scale(factor: number, center: Point): PolyLine {
        return this.copyIdentity(
            new PolyLine(this.segments.map((p) => p.scale(factor, center)))
        );
    }

    private getLocalT(globalT: number) {
        globalT = Math.min(Math.max(globalT, 0), 1);
        const offset = globalT * this.length;
        const edgeIndex = this.offsets.findLastIndex((o) => o <= offset);
        const startOffset = this.offsets[edgeIndex];
        const localOffset = offset - startOffset;
        const t = localOffset / this.lengths[edgeIndex];
        return { edgeIndex, t };
    }
    private getGlobalT(localT: number, edgeIndex: number) {
        const startOffset = this.offsets[edgeIndex];
        const offset = startOffset + localT * this.lengths[edgeIndex];
        return offset / this.length;
    }

    public pointAt(t: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.segments[edgeIndex].pointAt(localT);
    }
    public normalAt(t: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.segments[edgeIndex].normalAt(localT);
    }
    public tangentAt(t: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.segments[edgeIndex].tangentAt(localT);
    }
    public offsetAt(t: number, distance: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.segments[edgeIndex].offsetAt(localT, distance);
    }
    public curvatureAt(t: number): number {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.segments[edgeIndex].curvatureAt(localT);
    }
    public findClosestPoint(p: Point): ClosestPointInfo {
        let closest: { t: number; point: Point; distance: number } | null =
            null;
        let accLength = 0;
        this.segments.forEach((edge) => {
            const cp = edge.findClosestPoint(p);
            if (!closest || cp.distance < closest.distance) {
                closest = {
                    t: (accLength + cp.t * edge.length) / this.length,
                    point: cp.point,
                    distance: cp.distance,
                };
            }
            accLength += edge.length;
        });
        return closest!;
    }

    public getSegments() {
        return this.segments;
    }

    public offset(d: number, joinType: JoinType = "round"): PolyLine {
        if (this.segments.length === 0) return new PolyLine([]);

        // 1) Offset each edge individually
        const raw = this.segments.map((e) => e.offset(d));

        // 2) Stitch with trimming or chamfering
        const result: Segment[] = [];

        // Start with a copy of the first offset edge
        let curr = raw[0];
        const lastToVisit = this.closed ? raw.length : raw.length - 1;

        for (let i = 0; i < lastToVisit; i++) {
            const next = raw[(i + 1) % raw.length];
            const endLine = Line.fromPointAndDirection(
                curr.end,
                curr.tangentAt(1)
            );
            const startLine = Line.fromPointAndDirection(
                next.start,
                next.tangentAt(0)
            );

            const joints = curr.intersectWith(next);

            if (joints.length) {
                // (A) They meet (or cross) within both segments -> trim to intersection
                // Commit the trimmed prev; move on with trimmed curr

                // TODO find the one closest to the original joint?

                curr.end = joints[0];
                next.start = joints[0];
                result.push(curr);
            } else {
                switch (joinType) {
                    case "miter": {
                        const p = Line.intersection(endLine, startLine);
                        if (p) {
                            // Commit the extended prev; move on with extended curr
                            curr.end = p;
                            next.start = p;
                            result.push(curr);
                        } else {
                            // parallel lines - just join them
                            result.push(curr);
                        }
                        break;
                    }
                    case "bevel": {
                        // create chamfer
                        const chamfer = new LineSegment(curr.end, next.start);

                        result.push(curr);
                        result.push(chamfer);
                        break;
                    }
                    case "round": {
                        // create rounded corner fillet
                        const dir = Math.sign(d);
                        const c = this.segments[i].end;
                        const arc = new Arc(
                            new Circle(c, d),
                            endLine.angle() - (dir * Math.PI) / 2,
                            startLine.angle() - (dir * Math.PI) / 2
                        );
                        result.push(curr);
                        result.push(arc);
                        break;
                    }
                    case "none": {
                        // leave gaps
                        result.push(curr);
                        break;
                    }
                }
            }

            curr = next;
        }

        // Push the last carried segment, unless the poly is closed, in which case this segment is the first and was already pushed
        if (!this.closed) {
            result.push(curr);
        }

        return new PolyLine(result);
    }

    public getPoints() {
        const index: Record<string, Point> = {};
        this.segments.forEach((e) => {
            index[e.start.hash()] = e.start;
            index[e.end.hash()] = e.end;
        });
        return Object.values(index);
    }

    public walk({ enter, exit }: WalkerOptions): this {
        let r = this;
        if (enter) {
            r = enter(r) || r;
        }
        const newSegments = this.segments.map((s) => s.walk({ enter, exit }));
        if (newSegments.some((s, i) => s !== this.segments[i])) {
            r = this.copyIdentity(new PolyLine(newSegments)) as this;
        }
        if (exit) {
            r = exit(r) || r;
        }
        return r;
    }
    public flatten(): BaseGeometry[] {
        return [this, ...this.segments.flatMap((s) => s.flatten())];
    }

    public toSVG() {
        if (!this.joined) {
            return this.segments.map((l) => l.toSVG()).join(" ");
        }

        const [first, ...rest] = this.segments;
        const path = first.toSVG() + rest.map((l) => l.toSVGRel()).join(" ");
        if (this.closed) {
            return path + " z";
        }

        return path;
    }

    public toString(): string {
        return `<PolyLine>`;
    }

    public static is(p: any): p is PolyLine {
        return p && Array.isArray(p.points) && p.points.every(Point.is);
    }

    public static fromPoints(points: Point[], close = false): PolyLine {
        const lines: LineSegment[] = [];
        for (let i = 0; i < points.length - 1; i++) {
            lines.push(new LineSegment(points[i], points[i + 1]));
        }
        if (close && points.length > 2) {
            lines.push(new LineSegment(points[points.length - 1], points[0]));
        }
        return new PolyLine(lines);
    }
}
