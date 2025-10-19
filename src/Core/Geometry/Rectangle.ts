import { store } from "./GeoData";
import { LineSegment } from "./LineSegment";
import { JoinType, PolyLine } from "./PolyLine";
import { Transform } from "./Transform";
import { mid, Point, v2 } from "./Vector";

export class Rectangle extends PolyLine {
    public type = "Rectangle";

    // assume normalized width, aspect = height/width
    protected constructor(private aspect: number) {
        const hw = 1 / 2;
        const hh = aspect / 2;
        const points: Point[] = [
            v2(-hw, -hh),
            v2(hw, -hh),
            v2(hw, hh),
            v2(-hw, hh),
        ];
        const lines = points.map((p, i) => {
            const other = points[(i + 1) % points.length];
            return new LineSegment(p, other);
        });

        super(lines);
    }

    get width() {
        const s = this.T.scale;
        return s.x;
    }
    get height() {
        const s = this.T.scale;
        return s.y * this.aspect;
    }
    get center() {
        return this.T.translation;
    }

    // offset can be special cased for insets and mitered outsets, just adjust the transform
    public offset(
        distance: number,
        joinType: JoinType = "round"
    ): Rectangle | PolyLine {
        if (distance === 0) return this;
        if (distance < 0) {
            const w = this.width + 2 * distance;
            const h = this.height + 2 * distance;
            return Rectangle.fromDimensions(this.center, w, h);
        }
        if (distance > 0 && joinType === "miter") {
            const w = this.width + 2 * distance;
            const h = this.height + 2 * distance;
            return Rectangle.fromDimensions(this.center, w, h);
        }
        return super.offset(distance, joinType);
    }

    static fromBounds(lowerLeft: Point, upperRight: Point): Rectangle {
        const width = upperRight.x - lowerLeft.x;
        const height = upperRight.y - lowerLeft.y;
        const center = mid(lowerLeft, upperRight);

        return Rectangle.fromDimensions(center, width, height);
    }

    static fromDimensions(
        center: Point,
        width: number,
        height: number
    ): Rectangle {
        const aspect = height / width;
        const transform = Transform.from(center, 0, width);

        const hash = `rect-${aspect}`;
        const prop = store.getProp(hash, "from");
        if (prop) {
            return (prop as Rectangle).transform(transform);
        }

        const rect = new Rectangle(aspect);
        store.setProp(hash, "from", rect);

        return rect.transform(transform);
    }
}
