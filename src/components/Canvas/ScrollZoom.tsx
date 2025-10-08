// "use client";
import React from "react";
import { useGesture } from "@use-gesture/react";

import styles from "./Canvas.module.css";

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
export function SVGScroller({ children }: SVGScrollerProps) {
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
        onPinch: ({ origin: [ox, oy], offset: [s], event }) => {
            const svg = svgRef.current;
            if (!svg) return;
            const pt = getSvgPoint(svg, ox, oy);
            if (!pt) return;
            const newZoom = Math.max(0.1, s);
            // adjust offset to zoom arount pinch origin
            setOffset((offset) => ({
                x: (newZoom * (offset.x - pt.x)) / zoom + pt.x,
                y: (newZoom * (offset.y - pt.y)) / zoom + pt.y,
            }));
            setZoom(newZoom);
            event.preventDefault();
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
