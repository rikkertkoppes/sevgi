"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";
import { useGesture } from "@use-gesture/react";

import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { Point } from "@/Core/Geometry/Vector";

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

function getSvgPoint(container: SVGSVGElement, x: number, y: number) {
    const pt = container.createSVGPoint();
    pt.x = x;
    pt.y = y;
    const ctm = container.getScreenCTM();
    if (ctm) {
        const p = pt.matrixTransform(ctm.inverse());
        return { x: p.x, y: p.y };
    }
}

interface SVGScrollerProps {
    children?: React.ReactNode;
}
function SVGScroller({ children }: SVGScrollerProps) {
    const svgRef = React.useRef<SVGSVGElement>(null);
    const [offset, setOffset] = React.useState({ x: 0, y: 0 });
    const [zoom, setZoom] = React.useState(1);

    const bind = useGesture({
        onDrag: ({ delta: [dx, dy] }) => {
            setOffset(({ x, y }) => ({ x: x + dx, y: y + dy }));
        },
        onWheel: ({ delta: [, dy], event }) => {
            const svg = svgRef.current;
            if (!svg) return;
            const pt = getSvgPoint(svg, event.pageX, event.pageY);
            if (!pt) return;
            const newZoom = Math.max(0.1, zoom - dy * 0.001 * zoom);
            // adjust offset to zoom arount mouse position
            setOffset((offset) => ({
                x: (newZoom * (offset.x - pt.x)) / zoom + pt.x,
                y: (newZoom * (offset.y - pt.y)) / zoom + pt.y,
            }));
            setZoom(newZoom);
        },
    });

    return (
        <div className={styles.Scroll} {...bind()}>
            <svg ref={svgRef}>
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
