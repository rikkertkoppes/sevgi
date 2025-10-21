import { Arc } from "./Arc";
import { BaseGeometry, WalkerOptions } from "./BaseGeometry";
import { Circle } from "./Circle";
import { ClosestPointInfo, Curve } from "./Curve";
import { store } from "./GeoData";
import { Line } from "./Line";
import { LineSegment } from "./LineSegment";
import { Segment } from "./Segment";
import { Transform } from "./Transform";
import { diff, Point, same } from "./Vector";

export type JoinType = "miter" | "bevel" | "round" | "none";
export class PolyLine extends Curve {
    public type = "PolyLine";
    public length: number = 0;
    private lengths: number[] = [];
    private offsets: number[] = [];
    private segments: Segment[] = [];
    protected closed = false;
    private joined = false;
    private points: Point[] = [];
    public first: Point = new Point(0, 0);
    public last: Point = new Point(0, 0);
    public T: Transform = Transform.ONE;
    public Ti: Transform = Transform.ONE;
    private _worldSegments: Segment[] | null = null;

    protected constructor(segments: Segment[]) {
        super();

        if (!segments.length) return this;
        // TODO: order
        this.segments = segments;
        // the lengths of each segment
        this.lengths = this.segments.map((e) => e.length);
        // the start of each segment in world space
        this.offsets = this.lengths.reduce(
            (acc, l) => {
                const last = acc.length > 0 ? acc[acc.length - 1] : 0;
                acc.push(last + l);
                return acc;
            },
            [0] as number[]
        );
        // total length
        this.length = this.lengths.reduce((sum, l) => sum + l, 0);
        const jointsClosed = this.segments.map((s, i) => {
            const next = this.segments[(i + 1) % this.segments.length];
            return same(s.end, next.start);
        });
        // all segments connected? don't care about last to first joint
        this.joined = jointsClosed.slice(0, -1).every((v) => v);
        // all segments connected and last to first joint too?
        this.closed = jointsClosed.every((v) => v);
        // get the unique points
        const index: Record<string, Point> = {};
        this.segments.forEach((e) => {
            index[e.start.hash] = e.start;
            index[e.end.hash] = e.end;
        });
        this.points = Object.values(index);
        this.first = this.points[0];
        this.last = this.points[this.points.length - 1];

        this.hash = this.segments.map((s) => s.hash).join("|");
    }

    public clone(): PolyLine {
        return this.shallowCopy();
    }
    private shallowCopy(): this {
        const c = Object.create(Object.getPrototypeOf(this));
        Object.assign(c, this);
        return c;
    }

    public transform(t: Transform): this {
        const c = this.shallowCopy();
        t = t.multiply(this.T);
        c.T = t;
        c.Ti = t.inverse();
        c._worldSegments = null; // reset world segments cache
        return c;
    }

    public translate(v: Point): PolyLine {
        return this.copyAncestry(this.transform(Transform.fromTranslation(v)));
    }
    public rotate(angle: number, center: Point): PolyLine {
        return this.copyAncestry(
            this.transform(Transform.fromRotation(angle, center))
        );
    }
    public scale(factor: number, center: Point): PolyLine {
        return this.copyAncestry(
            this.transform(Transform.fromScaling(factor, center))
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

    /**
     * @returns the segments in world coordinates
     */
    public getSegments() {
        if (!this._worldSegments) {
            this._worldSegments = this.segments.map((s) => s.transform(this.T));
        }
        return this._worldSegments;
    }

    /**
     * returns the segments in local coordinates
     */
    public getLocalSegments() {
        return this.segments;
    }

    public offset(d: number, joinType: JoinType = "round"): PolyLine {
        const propKey = `offset_${d}_${joinType}`;
        // check if a stored offset exists
        const prop = store.getProp(this.hash, propKey);
        if (prop) {
            return (prop as PolyLine).transform(this.T);
        }

        if (this.segments.length === 0) return new PolyLine([]);

        const s = this.T.scale;
        d = d / Math.max(Math.abs(s.x), Math.abs(s.y));

        // 1) Offset each edge individually
        const raw = this.segments.map((e) => e.offset(d));

        // 2) Stitch with trimming or chamfering
        const segments: Segment[] = [];

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
                segments.push(curr);
            } else {
                switch (joinType) {
                    case "miter": {
                        const p = Line.intersection(endLine, startLine);
                        if (p) {
                            // Commit the extended prev; move on with extended curr
                            curr.end = p;
                            next.start = p;
                            segments.push(curr);
                        } else {
                            // parallel lines - just join them
                            segments.push(curr);
                        }
                        break;
                    }
                    case "bevel": {
                        // create chamfer
                        const chamfer = new LineSegment(curr.end, next.start);

                        segments.push(curr);
                        segments.push(chamfer);
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
                        segments.push(curr);
                        segments.push(arc);
                        break;
                    }
                    case "none": {
                        // leave gaps
                        segments.push(curr);
                        break;
                    }
                }
            }

            curr = next;
        }

        // Push the last carried segment, unless the poly is closed, in which case this segment is the first and was already pushed
        if (!this.closed) {
            segments.push(curr);
        }

        const newPoly = new PolyLine(segments);
        store.setProp(this.hash, propKey, newPoly);

        return newPoly.transform(this.T);
    }

    public getPoints() {
        return this.points;
    }

    public interSectWithLineSegment(segment: LineSegment): Point[] {
        return this.segments.flatMap((s) => s.intersectWith(segment));
    }

    public walk({ enter, exit }: WalkerOptions): this {
        let r = this;
        if (enter) {
            r = enter(r) || r;
        }
        const newSegments = this.segments.map((s) => s.walk({ enter, exit }));
        if (newSegments.some((s, i) => s !== this.segments[i])) {
            r = this.copyAncestry(new PolyLine(newSegments)) as this;
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
        const worldSegments = this.getSegments();
        if (!this.joined) {
            return worldSegments.map((l) => l.toSVG()).join(" ");
        }

        const [first, ...rest] = worldSegments;
        const path = first.toSVG() + rest.map((l) => l.toSVGRel()).join(" ");
        if (this.closed) {
            return path + " z";
        }

        return path;
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

    static from(segments: Segment[]): PolyLine {
        const first = segments[0];
        const last = segments[segments.length - 1];

        const fp = first.start;
        const lp = same(last.end, first.start) ? last.start : last.end;
        // normalize the polyline, by setting the first point to origin and last point to (1,0)
        // calculate the transformation matrix first by moving the first point to the origin and scaling and rotating souch that the second point is at (1,0)
        const d = diff(fp, lp);

        const T = Transform.fromElements(d.x, d.y, -d.y, d.x, fp.x, fp.y);
        const Ti = T.inverse();
        // console.log("matrices", this.first, this.T, this.Ti);

        const segs = segments.map((s) => s.transform(Ti));

        const poly = new PolyLine(segs);
        // directly store the world segments to avoid recomputing
        poly._worldSegments = segments;
        // store.setProp(hash, "from", poly);
        return poly.transform(T);
    }
}
