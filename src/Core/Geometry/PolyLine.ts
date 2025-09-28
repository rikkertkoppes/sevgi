import { Curve } from "./Curve";
import { LineSegment } from "./Line";
import { Point } from "./Vector";

export class PolyLine extends Curve {
    public length: number;
    private lengths: number[] = [];
    private offsets: number[] = [];
    private edges: LineSegment[] = [];
    constructor(public lines: LineSegment[]) {
        super();
        // TODO: order
        this.edges = lines;
        this.lengths = this.edges.map((e) => e.length);
        this.offsets = this.lengths.reduce(
            (acc, l) => {
                const last = acc.length > 0 ? acc[acc.length - 1] : 0;
                acc.push(last + l);
                return acc;
            },
            [0] as number[]
        );
        this.length = this.lengths.reduce((sum, l) => sum + l, 0);
    }

    public clone(): PolyLine {
        return new PolyLine(this.lines.map((p) => p.clone()));
    }
    public translate(v: Point): PolyLine {
        return new PolyLine(this.lines.map((p) => p.translate(v)));
    }
    public rotate(angle: number, center: Point): PolyLine {
        return new PolyLine(this.lines.map((p) => p.rotate(angle, center)));
    }
    public scale(factor: number, center: Point): PolyLine {
        return new PolyLine(this.lines.map((p) => p.scale(factor, center)));
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
        return this.edges[edgeIndex].pointAt(localT);
    }
    public normalAt(t: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.edges[edgeIndex].normalAt(localT);
    }
    public tangentAt(t: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.edges[edgeIndex].tangentAt(localT);
    }
    public offsetAt(t: number, distance: number): Point {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.edges[edgeIndex].offsetAt(localT, distance);
    }
    public curvatureAt(t: number): number {
        const { edgeIndex, t: localT } = this.getLocalT(t);
        return this.edges[edgeIndex].curvatureAt(localT);
    }
    public findClosestPoint(p: Point) {
        let closest: { t: number; point: Point; distance: number } | null =
            null;
        let accLength = 0;
        this.edges.forEach((edge, i) => {
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
        return this.edges;
    }

    public offset(d: number): PolyLine {
        return new PolyLine(this.lines.map((p) => p.offset(d)));
    }

    public getPoints() {
        const index: Record<string, Point> = {};
        this.edges.forEach((e) => {
            index[e.start.hash()] = e.start;
            index[e.end.hash()] = e.end;
        });
        return Object.values(index);
    }

    public toSVG() {
        return this.edges.map((l) => l.toSVG()).join(" ");

        const [first, ...rest] = this.edges;
        const path = first.toSVG() + rest.map((l) => l.toSVGRel()).join(" ");

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
