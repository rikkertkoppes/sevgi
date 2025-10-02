import { LineSegment } from "@/Core/Geometry/Line";
import { PolyLine } from "@/Core/Geometry/PolyLine";
import { Point } from "@/Core/Geometry/Vector";

// Assumed imports/types (as described by you):
// type IPoint = [number, number];
// namespace paths { export type Line = { origin: IPoint; end: IPoint }; }
// type IModel = { paths: paths.Line[] };

export function linesToCells(lines: LineSegment[]): PolyLine[] {
    // Tunables for robustness on float inputs (snap + area threshold)
    const EPS_AREA = 1e-12;

    type Vid = number;
    type Hid = number;

    interface HalfEdge {
        tail: Vid; // vertex id (origin of the directed half-edge)
        head: Vid; // vertex id (end of the directed half-edge)
        twin: Hid; // index of opposite half-edge
        next: Hid; // face traversal "next" (set after angular linking)
        outIdx: number; // index inside the tail's outgoing circular list
        lineIndex: number; // index into original (deduped) undirected lines
    }

    // --- 1) Snap & deduplicate vertices; deduplicate undirected edges ---
    const vertexIds = new Map<string, Vid>();
    const vertices: Point[] = [];

    const getVertexId = (p: Point): Vid => {
        const key = p.hash();
        let id = vertexIds.get(key);
        if (id === undefined) {
            id = vertices.length;
            vertexIds.set(key, id);
            vertices.push(p);
        }
        return id;
    };

    // undirected edge key with canonical (min,max) vertex ids
    const eKey = (a: Vid, b: Vid) => (a < b ? `${a}_${b}` : `${b}_${a}`);

    const undirectedLines: { a: Vid; b: Vid; src: LineSegment }[] = [];
    const edgeSeen = new Map<string, number>(); // key -> index in undirectedLines

    for (let i = 0; i < lines.length; i++) {
        const { start, end } = lines[i];
        const u = getVertexId(start);
        const v = getVertexId(end);
        if (u === v) continue; // discard zero-length
        const key = eKey(u, v);
        if (!edgeSeen.has(key)) {
            edgeSeen.set(key, undirectedLines.length);
            undirectedLines.push({ a: u, b: v, src: lines[i] });
        }
    }

    // Quick exit: nothing to polygonize
    if (undirectedLines.length === 0) return [];

    // --- 2) Build half-edges & adjacency lists ---
    const H: HalfEdge[] = [];
    const outgoingHE: number[][] = []; // per vertex list of half-edge ids

    for (let vid = 0; vid < vertices.length; vid++) {
        outgoingHE[vid] = [];
    }

    const pushHalfEdge = (tail: Vid, head: Vid, lineIndex: number): Hid => {
        const id = H.length;
        H.push({
            tail,
            head,
            twin: -1,
            next: -1,
            outIdx: -1,
            lineIndex,
        });
        outgoingHE[tail].push(id);
        return id;
    };

    for (let li = 0; li < undirectedLines.length; li++) {
        const { a, b } = undirectedLines[li];
        const h = pushHalfEdge(a, b, li);
        const ht = pushHalfEdge(b, a, li);
        H[h].twin = ht;
        H[ht].twin = h;
    }

    // --- 3) Sort outgoing half-edges around each vertex by angle (CCW) ---
    const atan2 = Math.atan2;
    for (let v = 0; v < vertices.length; v++) {
        const pv = vertices[v];
        const arr = outgoingHE[v];
        if (arr.length === 0) continue;

        arr.sort((ha, hb) => {
            const a = vertices[H[ha].head];
            const b = vertices[H[hb].head];
            const angA = atan2(a.y - pv.y, a.x - pv.x);
            const angB = atan2(b.y - pv.y, b.x - pv.x);
            return angA - angB;
        });

        // record circular position (outIdx) for O(1) predecessor/next indexing
        for (let i = 0; i < arr.length; i++) {
            H[arr[i]].outIdx = i;
        }
    }

    // --- 4) Link "next" pointers for left-face traversal ---
    for (let h = 0; h < H.length; h++) {
        const twin = H[h].twin;
        const v = H[h].head; // we arrive at vertex v along h
        const arr = outgoingHE[v];
        if (arr.length === 0) continue; // isolated, shouldn't happen in tessellation
        const i = H[twin].outIdx; // position of the twin in v's outgoing order
        const prevIdx = (i - 1 + arr.length) % arr.length; // one step CCW from twin
        H[h].next = arr[prevIdx];
    }

    // --- 5) Walk faces, collect cycles ---
    const visitedFaceOf: number[] = new Array(H.length).fill(-1);
    const faces: { hedges: Hid[]; vids: Vid[]; area: number }[] = [];

    const polygonAreaFromVids = (vs: Vid[]): number => {
        let a = 0;
        for (let i = 0, n = vs.length; i < n; i++) {
            const p = vertices[vs[i]];
            const q = vertices[vs[(i + 1) % n]];
            a += p.x * q.y - p.y * q.x;
        }
        return 0.5 * a;
    };

    for (let h0 = 0; h0 < H.length; h0++) {
        if (visitedFaceOf[h0] !== -1) continue;

        // follow the left-face of h0
        const hedges: Hid[] = [];
        const vids: Vid[] = [];

        let h = h0;
        while (true) {
            visitedFaceOf[h] = faces.length;
            hedges.push(h);
            vids.push(H[h].tail);
            h = H[h].next;
            if (h === h0) break;
            // Safety against malformed inputs: cycle limit
            if (hedges.length > H.length + 5) break;
        }

        const area = polygonAreaFromVids(vids);
        faces.push({ hedges, vids, area });
    }

    // --- 6) Keep bounded CCW faces (cells) and convert to IModel ---
    // Convention here:
    //  - CCW area > 0  => bounded face (cell)
    //  - CW (area < 0) => likely the unbounded outer face
    const cells: PolyLine[] = [];

    for (const f of faces) {
        if (f.area <= EPS_AREA) continue; // drop outer face or degenerate loops

        // Build the list of boundary lines for this face using the directed lines
        // We keep them in traversal order (optional; you can sort/normalize if desired).
        const modelLines: LineSegment[] = f.hedges.map((hid) => {
            const origin = vertices[H[hid].tail];
            const end = vertices[H[hid].head];
            return new LineSegment(origin, end);
        });

        cells.push(new PolyLine(modelLines));
    }

    return cells;
}
