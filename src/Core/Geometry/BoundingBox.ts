import { Transform } from "./Transform";
import { Point } from "./Vector";

export class BoundingBox {
    constructor(public bl: Point, public tr: Point) {}

    public transform(T: Transform): BoundingBox {
        return new BoundingBox(this.bl.transform(T), this.tr.transform(T));
    }

    public merge(bb: BoundingBox) {
        return BoundingBox.merge(this, bb);
    }

    static merge(bb1: BoundingBox, bb2: BoundingBox) {
        return new BoundingBox(
            new Point(
                Math.min(bb1.bl.x, bb2.bl.x),
                Math.min(bb1.bl.y, bb2.bl.y)
            ),
            new Point(
                Math.max(bb1.tr.x, bb2.tr.x),
                Math.max(bb1.tr.y, bb2.tr.y)
            )
        );
    }

    static overlaps(bb1: BoundingBox, bb2: BoundingBox) {
        // calculate if overlaps in horizontal direction
        const xOverlap =
            (bb1.bl.x <= bb2.bl.x && bb1.tr.x >= bb2.bl.x) ||
            (bb2.bl.x <= bb1.bl.x && bb2.tr.x >= bb1.bl.x);
        // calculate if overlaps in vertical direction
        const yOverlap =
            (bb1.bl.y <= bb2.bl.y && bb1.tr.y >= bb2.bl.y) ||
            (bb2.bl.y <= bb1.bl.y && bb2.tr.y >= bb1.bl.y);
        return xOverlap && yOverlap;
    }
}
