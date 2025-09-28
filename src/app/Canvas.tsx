"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";

import "@rkmodules/rules/index.css";
import styles from "./page.module.css";
import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { useGesture } from "@use-gesture/react";
import { Point } from "@/Core/Geometry/Vector";

interface GeometryProps {
    c: string;
    d: string;
}
const Geometry = React.memo(({ d, c }: GeometryProps) => {
    if (!d) return null;
    return <path d={d} className={c} />;
});
Geometry.displayName = "Geometry";

interface SVGScrollerProps {
    children?: React.ReactNode;
}
function SVGScroller({ children }: SVGScrollerProps) {
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);

    const bind = useGesture({
        onDrag: ({ offset: [ox, oy] }) => {
            setOffset({ x: ox, y: oy });
        },
        onWheel: ({ delta: [, dy] }) => {
            setZoom((z) => Math.max(0.1, z - dy * 0.001 * z));
        },
    });

    return (
        <div className={styles.Scroll} {...bind()}>
            <svg>
                <defs>
                    <marker
                        id="cross"
                        viewBox="-10 -10 20 20"
                        refX="0"
                        refY="0"
                        markerWidth="8"
                        markerHeight="8"
                        orient="auto-start-reverse"
                    >
                        <path d="M -10 -10 L 10 10 M -10 10 L 10 -10 z" />
                    </marker>
                </defs>
                <g
                    transform={`translate(${offset.x},${
                        offset.y
                    }) scale(${zoom},${-zoom})`}
                >
                    {children}
                </g>
            </svg>
        </div>
    );
}

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
    model: Tree<BaseGeometry>;
    selection: Record<string, Tree<BaseGeometry>>;
}

export function Canvas({ model, selection }: CanvasProps) {
    const [geometry, setGeometry] = React.useState<BaseGeometry[]>([]);
    const [selectionGeometry, setSelectionGeometry] = React.useState<
        BaseGeometry[]
    >([]);

    React.useEffect(() => {
        const geometry = toArray(model || {}) as BaseGeometry[];
        // console.log("result geometry", geometry);

        setGeometry(geometry);
    }, [model]);

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
