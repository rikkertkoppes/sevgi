import { store } from "./GeoData";
import { LineSegment } from "./LineSegment";
import { JoinType, PolyLine } from "./PolyLine";
import { Segment } from "./Segment";
import { Transform } from "./Transform";
import { toDegrees, toRadians } from "./Util";
import { Point, v2 } from "./Vector";

export class RegularPolygon extends PolyLine {
    public type = "RegularPolygon";

    // assume normalized radius
    protected constructor(private n: number) {
        // calculate the segments
        const points: Point[] = [];
        for (let i = 0; i < n; i++) {
            const theta = (2 * Math.PI * i) / n;
            const x = Math.cos(theta);
            const y = Math.sin(theta);
            points.push(v2(x, y));
        }
        const lines = points.map((p, i) => {
            const other = points[(i + 1) % points.length];
            // we have a normalized polygon, so use the constructor
            return new LineSegment(p, other);
        });

        super(lines);
        this.hash = `rp-${n}`;
    }

    get radius() {
        return this.T.scale.x;
    }

    get angle() {
        return toDegrees(this.T.rotation);
    }

    get center() {
        return this.T.translation;
    }

    // offset can be spacial cased for insets and mitered outsets, just adjust the transform
    public offset(
        distance: number,
        joinType: JoinType = "round"
    ): RegularPolygon | PolyLine {
        if (distance === 0) return this;
        const dr = distance / Math.cos(Math.PI / this.n);
        const r = this.radius + dr;
        if (distance < 0 || joinType === "miter") {
            return RegularPolygon.from(
                this.center,
                this.n,
                r,
                this.angle,
                true
            );
        }
        return super.offset(distance, joinType);
    }

    static from(segments: Segment[]): PolyLine;
    static from(
        center: Point,
        sides: number,
        radius: number,
        angle?: number,
        useOuter?: boolean
    ): RegularPolygon;
    static from(
        arg1: Segment[] | Point,
        sides?: number,
        radius?: number,
        angle = 0,
        useOuter = false
    ): PolyLine | RegularPolygon {
        // Delegate to base behavior when called with segments
        if (Array.isArray(arg1)) {
            return super.from(arg1);
        }

        const center = arg1 as Point;
        // when useOuter is true, radius is the radius of the outer circle
        // so when false, we need to adjust the radius to fit the polygon inside
        if (!useOuter) {
            radius = radius! / Math.cos(Math.PI / sides!);
        }
        const transform = Transform.from(center, toRadians(angle), radius);

        const hash = `rp-${sides}`;
        const prop = store.getProp(hash, "from");
        if (prop) {
            return (prop as RegularPolygon).transform(transform);
        }

        const poly = new RegularPolygon(sides!);
        store.setProp(hash, "from", poly);

        return poly.transform(transform);
    }
}
