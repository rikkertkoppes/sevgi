import { store } from "./GeoData";
import { LineSegment } from "./LineSegment";
import { PolyLine } from "./PolyLine";
import { Transform } from "./Transform";
import { mid, Point, v2 } from "./Vector";

export class Rectangle extends PolyLine {
    public type = "Rectangle";

    // assume normalized width and height, aspect = height/width
    protected constructor(aspect: number) {
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

    // TODO: offset can be spacial cased for insets and mitered outsets, just adjust the transform

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
