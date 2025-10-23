import { PolyLine } from "./PolyLine";
import { Segment } from "./Segment";
class GeoData {
    private geoData: Map<string, Map<string, any>> = new Map();
    public setProp(geohash: string, propKey: string, propValue: any) {
        if (!this.geoData.has(geohash)) {
            this.geoData.set(geohash, new Map());
        }
        const propMap = this.geoData.get(geohash)!;
        propMap.set(propKey, propValue);
    }
    public getProp(geohash: string, propKey: string): any | undefined {
        const propMap = this.geoData.get(geohash);
        return propMap ? propMap.get(propKey) : undefined;
    }
    public hasProp(geohash: string, propKey: string): boolean {
        const propMap = this.geoData.get(geohash);
        return propMap ? propMap.has(propKey) : false;
    }
}

export const store = new GeoData();

if (typeof window !== "undefined") {
    (window as any)._geoDataStore = store;
}

interface EdgeInfo {
    instance: Segment;
    edge: string; // reference to edge id
    twin: string; // reference to twin edge id
    start: string; // start vertex id
    end: string; // end vertex id
    face: string | null; // face id
    next: string | null; // next edge id
}
export class DCEL {
    // edges
    private edgeIndex: Map<string, EdgeInfo> = new Map();

    /**
     * records the edges of a cell, their twins, next edges and face id
     */
    public addCell(geom: PolyLine) {
        // store dcel reference
        geom.dcel = this;
        // store segments and connctedness info
        geom.getSegments().forEach((seg, i, all) => {
            const next = i < all.length - 1 ? all[i + 1] : all[0];
            this.addEdge(seg, next.id, geom.id);
        });
    }

    /**
     * record an edge and its twin, if not already recorded, no face or next info
     */
    public addEdge(seg: Segment, next?: string, face?: string) {
        const info = this.edgeIndex.get(seg.id);
        if (info) {
            // edge already exists, store next and face if given
            if (next) info.next = next;
            if (face) info.face = face;
            return;
        }
        const twin = seg.reverse();
        // record segment data
        this.edgeIndex.set(seg.id, {
            instance: seg,
            edge: seg.id,
            twin: twin.id,
            start: seg.start.id,
            end: seg.end.id,
            face: face || null,
            next: next || null,
        });

        // record twin data
        if (!this.edgeIndex.has(twin.id)) {
            // this.geoIndex.set(twin.id, twin);
            this.edgeIndex.set(twin.id, {
                instance: twin,
                edge: twin.id,
                twin: seg.id,
                start: twin.start.id,
                end: twin.end.id,
                face: null, // unknown face for twin
                next: null, // unknown next for twin
            });
        }
    }

    public setNext(edgeId: string, nextEdgeId: string) {
        const edgeData = this.edgeIndex.get(edgeId);
        if (edgeData) {
            edgeData.next = nextEdgeId;
        }
    }

    public setFace(edgeId: string, faceId: string) {
        const edgeData = this.edgeIndex.get(edgeId);
        if (edgeData) {
            edgeData.face = faceId;
        }
    }

    public getSegment(edgeId: string): Segment | undefined {
        const edgeData = this.edgeIndex.get(edgeId);
        return edgeData?.instance || undefined;
    }

    /**
     * gets own face and face of twin edge, in that order
     * @param edgeId
     */
    public getFaces(edgeId: string): (string | null)[] {
        const edgeData = this.edgeIndex.get(edgeId);
        if (!edgeData) {
            return [];
        }
        const faces: (string | null)[] = [];
        faces.push(edgeData.face);
        const twinData = this.edgeIndex.get(edgeData.twin);
        faces.push(twinData?.face || null);
        return faces;
    }
    /**
     * gets the edges forming a loop starting from the given edge, ending when it comes back to it or no next edge is found
     * @param startEdgeId
     */
    public getEdgeLoop(startEdgeId: string): string[] {
        const edges: string[] = [];
        let currentEdgeId: string | null = startEdgeId;
        while (currentEdgeId && !edges.includes(currentEdgeId)) {
            edges.push(currentEdgeId);
            const edgeData = this.edgeIndex.get(currentEdgeId);
            currentEdgeId = edgeData?.next || null;
        }
        return edges;
    }
}
