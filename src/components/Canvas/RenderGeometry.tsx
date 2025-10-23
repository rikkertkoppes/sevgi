import React from "react";
import { toArray, Tree } from "@rkmodules/rules";

import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";

import styles from "./Canvas.module.css";

interface RenderGeometryProps {
    geometry: Tree<BaseGeometry>;
}

export function RenderGeometry({ geometry: geoTree }: RenderGeometryProps) {
    const geometry = toArray(geoTree || {}) as BaseGeometry[];

    // console.log("rendering canvas with geometry", geometry);

    const groupedPaths = React.useMemo(() => {
        const byClass = new Map<string, string[]>();
        for (const g of geometry) {
            if (!g) continue;
            const c = g.type;
            const d = g.toSVG();
            if (!byClass.has(c)) byClass.set(c, []);
            byClass.get(c)!.push(d);
        }
        return Array.from(byClass.entries()).flatMap(([c, parts]) => {
            const maxSize = 100;
            // split into multiple paths if too large
            const chunks: string[][] = [];
            let currentChunk: string[] = [];
            let currentSize = 0;
            for (const part of parts) {
                if (currentSize >= maxSize) {
                    chunks.push(currentChunk);
                    currentChunk = [part];
                    currentSize = 1;
                } else {
                    currentChunk.push(part);
                    currentSize += 1;
                }
            }
            if (currentChunk.length > 0) {
                chunks.push(currentChunk);
            }
            return chunks.map((chunk) => ({
                c,
                d: chunk.join(" "),
            }));
        });
    }, [geometry]);

    return (
        <g className={styles.Geometry}>
            {/* {geometry.map((g, i) => {
                            if (!g) return null;
                            return <Geometry d={g.toSVG?.()} key={i} c={g.type} />;
                        })} */}
            {groupedPaths.map(({ c, d }, i) => (
                <path key={i} d={d} className={c} />
            ))}
        </g>
    );
}
