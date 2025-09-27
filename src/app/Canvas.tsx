"use client";
import React from "react";
import { toArray, Tree } from "@rkmodules/rules";

import "@rkmodules/rules/index.css";
import styles from "./page.module.css";
import { BaseGeometry } from "@/Core/Geometry/BaseGeometry";
import { useGesture } from "@use-gesture/react";

interface GeometryProps {
    d: string;
}
const Geometry = React.memo(({ d }: GeometryProps) => {
    if (!d) return null;
    return <path d={d} />;
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

interface CanvasProps {
    model: Tree<BaseGeometry>;
    selection: Record<string, any>;
}

export function Canvas({ model, selection }: CanvasProps) {
    const [svg, setSvg] = React.useState("");
    const [geometry, setGeometry] = React.useState<BaseGeometry[]>([]);

    React.useEffect(() => {
        const models = toArray(model || {}) as BaseGeometry[];
        // console.log("result geometry", models);

        // TODO: use model walker to iterate paths
        // then use pathToSVGPathData to create svg paths
        // use own style annotations in the paths to add style
        // output react elements
        // can use memoization to only redraw when needed

        // const finalModel: IModel = {
        //     models: Object.fromEntries(
        //         models.map((m: any, i: number) => [`m${i}`, m])
        //     ),
        // };

        // setSvg(
        //     exporter.toSVG(finalModel, {
        //         useSvgPathOnly: false,
        //         // flow: {
        //         //     size: 1,
        //         // },
        //         strokeWidth: "0.2px",
        //         origin: [0, 0],
        //     })
        // );
        setGeometry(models);
    }, [model]);

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([svg], { type: "image/svg+xml" });
        element.href = URL.createObjectURL(file);
        element.download = "model.svg";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element); // Clean up
    };

    // React.useEffect(() => {
    //     const mainSel = selection[Object.keys(selection)[0]];
    //     const points: IPoint[] = [];
    //     const selModel: IModel = { paths: {}, models: {} };
    //     if (mainSel) {
    //         const items = toArray(mainSel);
    //         console.log("focus items", items);
    //         items.forEach((item, index) => {
    //             if (isPoint(item)) {
    //                 points.push(item);
    //             } else if (isPath(item)) {
    //                 selModel.paths!["p" + index] = item;
    //             } else if (isModel(item)) {
    //                 selModel.models!["m" + index] = item;
    //             }
    //         });
    //     }
    //     setPoints(points);
    //     setSelSvg(
    //         exporter.toSVG(selModel, {
    //             useSvgPathOnly: false,
    //             strokeWidth: "0.1px",
    //             stroke: "#0af",
    //             origin: [0, 0],
    //         })
    //     );
    // }, [selection]);

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
                    {geometry.map((g, i) => (
                        <Geometry d={g?.toSVG()} key={i} />
                    ))}
                </g>
            </SVGScroller>
            {/* <div dangerouslySetInnerHTML={{ __html: svg }} /> */}
            {/* <div dangerouslySetInnerHTML={{ __html: selSvg }} />
                <svg>
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p[0]}
                            cy={-p[1]}
                            r={1}
                            fill="#0af"
                        />
                    ))}
                </svg> */}
            {/* </ScrollCanvas> */}
        </div>
    );
}
