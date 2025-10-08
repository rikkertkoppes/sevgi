"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";

import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { Point } from "@/Core/Geometry/Vector";
import { SVGScroller } from "./ScrollZoom";

import "@rkmodules/rules/index.css";
import styles from "./Canvas.module.css";

interface GeometryProps {
    c: string;
    d: string;
}
const Geometry = React.memo(({ d, c }: GeometryProps) => {
    if (!d) return null;
    return <path d={d} className={c} />;
});
Geometry.displayName = "Geometry";

function serializeSVG(geometry: BaseGeometry[]) {
    // todo: calculate proper viewBox
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200">`;
    geometry.forEach((g) => {
        if (g instanceof Point) return;
        svg += `<path d="${g.toSVG()}" style="stroke:black; stroke-width: 0.1; fill: none" />`;
    });
    svg += `</svg>`;
    return svg;
}

interface CanvasProps {
    geometry: Tree<BaseGeometry>;
    selection: Record<string, Tree<BaseGeometry>>;
}

export function Canvas({ geometry: geoTree, selection }: CanvasProps) {
    const [selectionGeometry, setSelectionGeometry] = React.useState<
        BaseGeometry[]
    >([]);

    const geometry = toArray(geoTree || {}) as BaseGeometry[];

    const handleDownload = () => {
        const svg = serializeSVG(geometry);
        const element = document.createElement("a");
        const file = new Blob([svg], { type: "image/svg+xml" });
        element.href = URL.createObjectURL(file);
        element.download = "model.svg";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element); // Clean up
    };

    React.useEffect(() => {
        const mainSel = selection[Object.keys(selection)[0]];
        const selGeometry = toArray(mainSel || {}) as BaseGeometry[];
        setSelectionGeometry(selGeometry);
    }, [selection]);

    return (
        <div className={styles.Canvas}>
            <button className={styles.Download} onClick={handleDownload}>
                Download SVG
            </button>
            <SVGScroller>
                <pattern
                    id="bkg"
                    width={10}
                    height={10}
                    patternUnits="userSpaceOnUse"
                    viewBox="-5 -5 10 10"
                    x={-5}
                    y={-5}
                >
                    <circle
                        cx={0}
                        cy={0}
                        r={0.25}
                        className={styles.BGPattern}
                    />
                </pattern>
                <rect
                    x={-1000}
                    y={-1000}
                    width={2000}
                    height={2000}
                    fill="url(#bkg)"
                />
                <line
                    x1={-1000}
                    y1={0}
                    x2={1000}
                    y2={0}
                    className={styles.XAxis}
                />
                <line
                    x1={0}
                    y1={-1000}
                    x2={0}
                    y2={1000}
                    className={styles.YAxis}
                />
                <g className={styles.Geometry}>
                    {geometry.map((g, i) => {
                        if (!g) return null;
                        return <Geometry d={g.toSVG?.()} key={i} c={g.type} />;
                    })}
                </g>
                <g className={styles.Selection}>
                    {selectionGeometry.map((g, i) => {
                        if (!g) return null;
                        return <Geometry d={g.toSVG?.()} key={i} c={g.type} />;
                    })}
                </g>
            </SVGScroller>
        </div>
    );
}
